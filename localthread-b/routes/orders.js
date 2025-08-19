const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticate, requireCustomer, requireVendor } = require('../middleware/auth');

// Get all orders (for customers - their own orders, for vendors - orders of their products)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    
    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    } else if (req.user.role === 'vendor') {
      // Get products by this vendor
      const vendorProducts = await Product.find({ vendorId: req.user._id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      filter['items.productId'] = { $in: productIds };
    }

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price images vendorId')
      .populate('items.productId.vendorId', 'storeName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single order by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    let filter = { _id: id };
    
    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    } else if (req.user.role === 'vendor') {
      // Check if any product in the order belongs to this vendor
      const order = await Order.findById(id).populate('items.productId', 'vendorId');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      const hasVendorProduct = order.items.some(item => 
        item.productId && item.productId.vendorId.toString() === req.user._id
      );
      
      if (!hasVendorProduct) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const order = await Order.findOne(filter)
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name price images vendorId')
      .populate('items.productId.vendorId', 'storeName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new order (customer only)
router.post('/', [
  authenticate,
  requireCustomer,
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('shippingAddress.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('shippingAddress.zipCode')
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('Zip code must be 6 digits'),
  body('paymentMethod')
    .isIn(['cod', 'card', 'upi', 'netbanking'])
    .withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      });

      // Update product stock
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    const order = new Order({
      customerId: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price images vendorId')
      .populate('items.productId.vendorId', 'storeName');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: populatedOrder }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update order status (vendor only - for their products)
router.patch('/:id/status', [
  authenticate,
  requireVendor,
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tracking number cannot exceed 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    // Check if order contains products from this vendor
    const order = await Order.findById(id).populate('items.productId', 'vendorId');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

          const hasVendorProduct = order.items.some(item => 
        item.productId && item.productId.vendorId.toString() === req.user._id
      );

    if (!hasVendorProduct) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - no products from this vendor in order'
      });
    }

    // Update only the status and tracking number
    const updateData = { status };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('customerId', 'name email')
     .populate('items.productId', 'name price images vendorId')
     .populate('items.productId.vendorId', 'storeName');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel order (customer only - within time limit)
router.patch('/:id/cancel', authenticate, requireCustomer, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      customerId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled (within 1 hour of creation)
    const orderAge = Date.now() - order.createdAt.getTime();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (orderAge > oneHour) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled after 1 hour'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled - already processed'
      });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    const updatedOrder = await Order.findById(id)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price images vendorId')
      .populate('items.productId.vendorId', 'storeName');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 