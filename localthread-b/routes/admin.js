const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { authenticate: auth } = require('../middleware/auth');
const { sendVendorApproval, sendProductApproval } = require('../utils/emailService');

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
};

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Get pending counts
    const pendingVendors = await User.countDocuments({ 
      role: 'vendor', 
      isVerified: false 
    });
    const pendingProducts = await Product.countDocuments({ 
      isApproved: false 
    });
    const pendingReviews = await Review.countDocuments({ 
      status: 'pending' 
    });

    // Get recent activity
    const recentOrders = await Order.find()
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Get sales statistics
    const salesStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Get monthly sales data
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1) // From start of year
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVendors,
          totalCustomers,
          totalProducts,
          totalShops,
          totalOrders,
          totalReviews
        },
        pending: {
          vendors: pendingVendors,
          products: pendingProducts,
          reviews: pendingReviews
        },
        sales: salesStats[0] || {
          totalRevenue: 0,
          averageOrderValue: 0,
          totalOrders: 0
        },
        monthlySales,
        recentActivity: {
          orders: recentOrders,
          users: recentUsers
        }
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isVerified,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          hasNextPage: parseInt(page) * parseInt(limit) < totalUsers,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify vendor account
// @access  Private (Admin)
router.put('/users/:id/verify', auth, adminAuth, async (req, res) => {
  try {
    const { isVerified, reason } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'vendor') {
      return res.status(400).json({
        success: false,
        message: 'Only vendors can be verified'
      });
    }

    user.isVerified = isVerified;
    user.verificationDate = isVerified ? new Date() : null;
    user.verifiedBy = isVerified ? req.user._id : null;

    await user.save();

    // Send email notification
    if (isVerified) {
      await sendVendorApproval(user);
    }

    res.json({
      success: true,
      message: `Vendor ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Verify vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify vendor'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin)
router.put('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { isActive, reason } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// @route   GET /api/admin/products/pending
// @desc    Get pending products for approval
// @access  Private (Admin)
router.get('/products/pending', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find({ isApproved: false })
      .populate('vendorId', 'name email')
      .populate('shopId', 'name')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalPending = await Product.countDocuments({ isApproved: false });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPending / parseInt(limit)),
          totalPending,
          hasNextPage: parseInt(page) * parseInt(limit) < totalPending,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending products'
    });
  }
});

// @route   PUT /api/admin/products/:id/approve
// @desc    Approve/reject product
// @access  Private (Admin)
router.put('/products/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const { isApproved, reason } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isApproved = isApproved;
    product.approvedBy = isApproved ? req.user._id : null;
    product.approvedAt = isApproved ? new Date() : null;

    await product.save();

    // Send email notification to vendor
    if (isApproved) {
      const vendor = await User.findById(product.vendorId);
      if (vendor) {
        await sendProductApproval(vendor, product);
      }
    }

    res.json({
      success: true,
      message: `Product ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: product.getPublicProfile()
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve product'
    });
  }
});

// @route   GET /api/admin/reviews/pending
// @desc    Get pending reviews for moderation
// @access  Private (Admin)
router.get('/reviews/pending', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find({ status: 'pending' })
      .populate('userId', 'name email')
      .populate('productId', 'name images')
      .populate('shopId', 'name logo')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalPending = await Review.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPending / parseInt(limit)),
          totalPending,
          hasNextPage: parseInt(page) * parseInt(limit) < totalPending,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending reviews'
    });
  }
});

// @route   PUT /api/admin/reviews/:id/moderate
// @desc    Moderate review
// @access  Private (Admin)
router.put('/reviews/:id/moderate', auth, adminAuth, async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = status;
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();
    review.moderationReason = reason;

    await review.save();

    // Update product and shop ratings if status changed
    if (status === 'approved' || review.status !== status) {
      await Product.findById(review.productId).then(product => product.updateRating());
      await Shop.findById(review.shopId).then(shop => shop.updateRating());
    }

    res.json({
      success: true,
      message: 'Review moderated successfully',
      data: review.getPublicProfile()
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate review'
    });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering
// @access  Private (Admin)
router.get('/orders', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('customerId', 'name email')
      .populate('items.vendorId', 'name storeName')
      .populate('items.productId', 'name images')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / parseInt(limit)),
          totalOrders,
          hasNextPage: parseInt(page) * parseInt(limit) < totalOrders,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// @route   GET /api/admin/analytics/sales
// @desc    Get sales analytics
// @access  Private (Admin)
router.get('/analytics/sales', auth, adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Sales data
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'completed'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productName: '$product.name',
          totalSold: 1,
          revenue: 1
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Top vendors
    const topVendors = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'completed'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.vendorId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      {
        $unwind: '$vendor'
      },
      {
        $project: {
          vendorName: '$vendor.name',
          storeName: '$vendor.storeName',
          totalSold: 1,
          revenue: 1
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        topProducts,
        topVendors,
        period: days
      }
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales analytics'
    });
  }
});

// @route   GET /api/admin/analytics/users
// @desc    Get user analytics
// @access  Private (Admin)
router.get('/analytics/users', auth, adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User registration data
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // User role distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Active users (users with orders)
    const activeUsers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$customerId'
        }
      },
      {
        $count: 'total'
      }
    ]);

    res.json({
      success: true,
      data: {
        userRegistrations,
        roleDistribution,
        activeUsers: activeUsers[0]?.total || 0,
        period: days
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics'
    });
  }
});

module.exports = router; 