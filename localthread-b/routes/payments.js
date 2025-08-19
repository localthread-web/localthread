const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { authenticate: auth } = require('../middleware/auth');

// Initialize Razorpay (only if keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway not configured. Please contact support.'
      });
    }

    const { cartId, shippingAddress, paymentMethod = 'card' } = req.body;

    // Get user's cart
    const cart = await Cart.getOrCreateCart(req.user._id);
    
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Check item availability
    await cart.checkAvailability();
    const unavailableItems = cart.items.filter(item => !item.isAvailable);
    
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items are out of stock',
        data: { unavailableItems }
      });
    }

    // Calculate totals
    const summary = cart.getSummary();
    const amount = Math.round(summary.total * 100); // Convert to paise

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount'
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        cartId: cart._id.toString()
      }
    });

    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: razorpayOrder.id,
        amount: amount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        cartSummary: summary,
        shippingAddress
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment signature
// @access  Private
router.post('/verify', auth, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway not configured. Please contact support.'
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      paymentMethod = 'card'
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get user's cart
    const cart = await Cart.getOrCreateCart(req.user._id);
    
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Create order items with product snapshots
    const orderItems = await Promise.all(
      cart.items.map(async (item) => {
        const Product = require('../models/Product');
        const Shop = require('../models/Shop');
        
        const product = await Product.findById(item.productId);
        const shop = await Shop.findById(product.shopId);
        
        return {
          productId: item.productId,
          vendorId: item.vendorId,
          shopId: product.shopId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
          productSnapshot: {
            name: product.name,
            images: product.images,
            category: product.category
          },
          vendorSnapshot: {
            name: shop.name,
            storeName: shop.name,
            storeLocation: shop.address.city
          }
        };
      })
    );

    // Create vendor orders
    const vendorOrders = [];
    const vendorGroups = {};
    
    orderItems.forEach(item => {
      const vendorId = item.vendorId.toString();
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          vendorId: item.vendorId,
          shopId: item.shopId,
          items: [],
          subtotal: 0
        };
      }
      vendorGroups[vendorId].items.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      });
      vendorGroups[vendorId].subtotal += item.price * item.quantity;
    });

    Object.values(vendorGroups).forEach(group => {
      vendorOrders.push({
        vendorId: group.vendorId,
        shopId: group.shopId,
        items: group.items,
        subtotal: group.subtotal,
        status: 'pending'
      });
    });

    // Create order
    const order = new Order({
      customerId: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'completed',
      paymentId: razorpay_payment_id,
      paymentGateway: 'razorpay',
      paymentDetails: {
        transactionId: razorpay_payment_id,
        gatewayResponse: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature
        },
        capturedAt: new Date()
      },
      vendorOrders
    });

    // Calculate totals
    await order.calculateTotals();
    await order.save();

    // Update product stock
    for (const item of orderItems) {
      const Product = require('../models/Product');
      const product = await Product.findById(item.productId);
      
      if (product.hasVariants && item.size && item.color) {
        await product.updateVariantStock(item.size, item.color, item.quantity, 'decrease');
      } else {
        await product.updateStock(item.quantity, 'decrease');
      }
      
      // Increment sales count
      await product.incrementSales(item.quantity);
    }

    // Clear cart
    await cart.clearCart();

    // Add status history
    await order.updateStatus('confirmed', req.user._id, 'Payment verified successfully');

    res.json({
      success: true,
      message: 'Payment verified and order created successfully',
      data: {
        order: order.getPublicProfile(),
        paymentId: razorpay_payment_id
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Razorpay webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload);
        break;
      
      case 'refund.processed':
        await handleRefundProcessed(event.payload);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// @route   POST /api/payments/refund
// @desc    Process refund
// @access  Private (Vendor or Admin)
router.post('/refund', auth, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway not configured. Please contact support.'
      });
    }

    const { orderId, itemId, refundAmount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized
    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Order item not found'
      });
    }

    const isVendor = item.vendorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process refund'
      });
    }

    // Process refund through Razorpay
    const refund = await razorpay.payments.refund(order.paymentId, {
      amount: Math.round(refundAmount * 100), // Convert to paise
      speed: 'normal',
      notes: {
        reason: reason,
        orderId: orderId,
        itemId: itemId
      }
    });

    // Update order item
    await order.processRefund(itemId, refundAmount, reason);

    // Update order status if all items are refunded
    const allItemsRefunded = order.items.every(item => item.status === 'refunded');
    if (allItemsRefunded) {
      await order.updateStatus('refunded', req.user._id, 'All items refunded');
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        refundAmount,
        order: order.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

// @route   GET /api/payments/order/:orderId
// @desc    Get payment details for an order
// @access  Private
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized
    if (order.customerId.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' &&
        !order.items.some(item => item.vendorId.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    // Get payment details from Razorpay if available
    let paymentDetails = null;
    if (razorpay && order.paymentId && order.paymentGateway === 'razorpay') {
      try {
        const payment = await razorpay.payments.fetch(order.paymentId);
        paymentDetails = {
          id: payment.id,
          amount: payment.amount / 100, // Convert from paise
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          capturedAt: payment.captured_at ? new Date(payment.captured_at * 1000) : null,
          refundStatus: payment.refund_status,
          description: payment.description
        };
      } catch (error) {
        console.error('Error fetching payment details:', error);
      }
    }

    res.json({
      success: true,
      data: {
        order: order.getPublicProfile(),
        paymentDetails
      }
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
});

// Helper functions for webhook handling
async function handlePaymentCaptured(payload) {
  try {
    const payment = payload.payment.entity;
    console.log(`Payment captured: ${payment.id}`);
    
    // Update order payment status if needed
    const order = await Order.findOne({ paymentId: payment.id });
    if (order && order.paymentStatus !== 'completed') {
      order.paymentStatus = 'completed';
      order.paymentDetails.capturedAt = new Date();
      await order.save();
    }
  } catch (error) {
    console.error('Handle payment captured error:', error);
  }
}

async function handlePaymentFailed(payload) {
  try {
    const payment = payload.payment.entity;
    console.log(`Payment failed: ${payment.id}`);
    
    // Update order payment status
    const order = await Order.findOne({ paymentId: payment.id });
    if (order) {
      order.paymentStatus = 'failed';
      await order.save();
    }
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
}

async function handleRefundProcessed(payload) {
  try {
    const refund = payload.refund.entity;
    console.log(`Refund processed: ${refund.id}`);
    
    // Update order refund status if needed
    // This can be implemented based on your refund tracking needs
  } catch (error) {
    console.error('Handle refund processed error:', error);
  }
}

module.exports = router; 