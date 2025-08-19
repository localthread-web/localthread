const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const { authenticate: auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// @route   GET /api/reviews
// @desc    Get reviews with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      productId,
      shopId,
      rating,
      status = 'approved',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      verifiedOnly
    } = req.query;

    const query = { status };

    if (productId) {
      query.productId = productId;
    }

    if (shopId) {
      query.shopId = shopId;
    }

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (verifiedOnly === 'true') {
      query.isVerifiedPurchase = true;
    }

    const options = {
      rating: rating ? parseInt(rating) : undefined,
      verifiedOnly: verifiedOnly === 'true',
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    let reviews;
    let totalReviews;

    if (productId) {
      reviews = await Review.findByProduct(productId, options);
      totalReviews = await Review.countDocuments({
        productId,
        status: 'approved'
      });
    } else if (shopId) {
      reviews = await Review.findByShop(shopId, options);
      totalReviews = await Review.countDocuments({
        shopId,
        status: 'approved'
      });
    } else {
      reviews = await Review.find(query)
        .populate('userId', 'name avatar')
        .populate('productId', 'name images')
        .populate('shopId', 'name logo')
        .sort(options.sort)
        .limit(options.limit)
        .skip(options.skip);

      totalReviews = await Review.countDocuments(query);
    }

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNextPage: parseInt(page) * parseInt(limit) < totalReviews,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'name avatar')
      .populate('productId', 'name images')
      .populate('shopId', 'name logo');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review.getPublicProfile()
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review'
    });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      productId,
      shopId,
      rating,
      title,
      comment,
      tags,
      images
    } = req.body;

    // Validate required fields
    if (!productId || !shopId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, Shop ID, rating, and comment are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Check if user has purchased this product (for verified purchase)
    const order = await Order.findOne({
      customerId: req.user._id,
      'items.productId': productId,
      status: 'delivered'
    });

    const isVerifiedPurchase = !!order;

    const review = new Review({
      productId,
      shopId,
      userId: req.user._id,
      rating,
      title,
      comment,
      tags,
      images,
      isVerifiedPurchase,
      orderId: order ? order._id : null
    });

    await review.save();

    // Update product and shop ratings
    await product.updateRating();
    await shop.updateRating();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review.getPublicProfile()
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private (Review Owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const updateFields = ['rating', 'title', 'comment', 'tags', 'images'];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    });

    await review.save();

    // Update product and shop ratings
    await Product.findById(review.productId).then(product => product.updateRating());
    await Shop.findById(review.shopId).then(shop => shop.updateRating());

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review.getPublicProfile()
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const { isHelpful } = req.body;

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isHelpful must be a boolean'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.markHelpful(req.user._id, isHelpful);

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        isHelpful: review.isHelpful
      }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful'
    });
  }
});

// @route   POST /api/reviews/:id/images
// @desc    Upload review images
// @access  Private (Review Owner)
router.post('/:id/images', auth, upload.array('images', 5), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const imagePaths = req.files.map(file => file.path);
    review.images = [...review.images, ...imagePaths];
    await review.save();

    res.json({
      success: true,
      message: 'Review images uploaded successfully',
      data: { images: review.images }
    });
  } catch (error) {
    console.error('Upload review images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload review images'
    });
  }
});

// @route   GET /api/reviews/stats/:productId
// @desc    Get review statistics for a product
// @access  Public
router.get('/stats/:productId', async (req, res) => {
  try {
    const stats = await Review.getStats(req.params.productId);

    res.json({
      success: true,
      data: stats[0] || {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0
        }
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics'
    });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews by user
// @access  Private (User or Admin)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check if user is requesting their own reviews or is admin
    if (req.params.userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these reviews'
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { userId: req.params.userId };

    if (status) {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .populate('productId', 'name images')
      .populate('shopId', 'name logo')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalReviews = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNextPage: parseInt(page) * parseInt(limit) < totalReviews,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reviews'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private (Review Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const productId = review.productId;
    const shopId = review.shopId;

    await review.remove();

    // Update product and shop ratings
    await Product.findById(productId).then(product => product.updateRating());
    await Shop.findById(shopId).then(shop => shop.updateRating());

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// Admin routes for moderation
// @route   PUT /api/reviews/:id/moderate
// @desc    Moderate review (Admin only)
// @access  Private (Admin)
router.put('/:id/moderate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can moderate reviews'
      });
    }

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

// @route   GET /api/reviews/pending
// @desc    Get pending reviews for moderation (Admin only)
// @access  Private (Admin)
router.get('/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view pending reviews'
      });
    }

    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const reviews = await Review.find({ status: 'pending' })
      .populate('userId', 'name email')
      .populate('productId', 'name images')
      .populate('shopId', 'name logo')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
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

module.exports = router; 