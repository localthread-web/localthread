const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authenticate, requireVendor, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/vendors/profile
// @desc    Get vendor profile
// @access  Private (Vendor)
router.get('/profile', authenticate, requireVendor, async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select('-password');
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: { vendor }
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/vendors/profile
// @desc    Update vendor profile
// @access  Private (Vendor)
router.put('/profile', [
  authenticate,
  requireVendor,
  body('storeName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters'),
  body('storeLocation')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Store location cannot exceed 200 characters'),
  body('storeDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Store description cannot exceed 500 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Zip code cannot exceed 10 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      storeName,
      storeLocation,
      storeDescription,
      phone,
      address
    } = req.body;

    // Find vendor and update
    const vendor = await User.findById(req.user._id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update fields
    if (storeName !== undefined) vendor.storeName = storeName;
    if (storeLocation !== undefined) vendor.storeLocation = storeLocation;
    if (storeDescription !== undefined) vendor.storeDescription = storeDescription;
    if (phone !== undefined) vendor.phone = phone;
    if (address !== undefined) vendor.address = { ...vendor.address, ...address };

    await vendor.save();

    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: { vendor: vendor.getPublicProfile() }
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/vendors/:id/verify
// @desc    Verify vendor (Admin only)
// @access  Private (Admin)
router.patch('/:id/verify', authenticate, requireAdmin, async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.role !== 'vendor') {
      return res.status(400).json({
        success: false,
        message: 'User is not a vendor'
      });
    }

    vendor.isVerified = true;
    vendor.verificationDate = new Date();
    vendor.verifiedBy = req.user._id;
    
    await vendor.save();

    res.json({
      success: true,
      message: 'Vendor verified successfully',
      data: { vendor: vendor.getPublicProfile() }
    });
  } catch (error) {
    console.error('Verify vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/vendors/:id/stats
// @desc    Get vendor statistics
// @access  Private (Vendor or Admin)
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const vendorId = req.params.id;
    
    // Check if user can access these stats
    if (req.user.role !== 'admin' && req.user._id.toString() !== vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get vendor's products
    const products = await Product.find({ vendorId }).select('_id name price');
    const productIds = products.map(p => p._id);

    // Get orders with vendor's products
    const orders = await Order.find({
      'items.productId': { $in: productIds },
      status: { $in: ['completed', 'delivered'] }
    }).populate('items.productId');

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      const vendorItems = order.items.filter(item => 
        productIds.includes(item.productId._id)
      );
      return sum + vendorItems.reduce((itemSum, item) => 
        itemSum + (item.price * item.quantity), 0
      );
    }, 0);

    // Monthly sales trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthOrders = orders.filter(order => 
        order.createdAt >= monthStart && order.createdAt <= monthEnd
      );

      const monthRevenue = monthOrders.reduce((sum, order) => {
        const vendorItems = order.items.filter(item => 
          productIds.includes(item.productId._id)
        );
        return sum + vendorItems.reduce((itemSum, item) => 
          itemSum + (item.price * item.quantity), 0
        );
      }, 0);

      monthlyStats.unshift({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        orders: monthOrders.length,
        revenue: monthRevenue
      });
    }

    // Top selling products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.includes(item.productId._id)) {
          const productId = item.productId._id.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              product: item.productId,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        }
      });
    });

    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        monthlyStats,
        topSellingProducts,
        totalProducts: products.length
      }
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/vendors
// @desc    Get all vendors (Admin only)
// @access  Private (Admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, verified, search } = req.query;
    
    const query = { role: 'vendor' };
    
    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalVendors: total
        }
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 