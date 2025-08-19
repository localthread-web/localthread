const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Follow = require('../models/Follow');
const { authenticate: auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// @route   GET /api/shops
// @desc    Get all shops with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      city,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      isVerified,
      isActive = true
    } = req.query;

    const query = { isActive: isActive === 'false' ? false : true };

    // Category filter
    if (category) {
      query.categories = category;
    }

    // City filter
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    // Rating filter
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }

    // Verification filter
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const shops = await Shop.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('ownerId', 'name email phone')
      .lean();

    const total = await Shop.countDocuments(query);

    res.json({
      success: true,
      data: {
        shops,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shops'
    });
  }
});

// @route   GET /api/shops/nearby
// @desc    Get shops near a location
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000, limit = 20 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const shops = await Shop.findNearby(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(maxDistance)
    )
    .populate('ownerId', 'name email phone')
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        shops,
        total: shops.length
      }
    });
  } catch (error) {
    console.error('Get nearby shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby shops'
    });
  }
});

// @route   GET /api/shops/trending
// @desc    Get trending shops (most followed)
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trendingShops = await Follow.getTrendingShops(parseInt(limit));

    res.json({
      success: true,
      data: {
        shops: trendingShops,
        total: trendingShops.length
      }
    });
  } catch (error) {
    console.error('Get trending shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending shops'
    });
  }
});

// @route   GET /api/shops/:id
// @desc    Get shop by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('ownerId', 'name email phone avatar')
      .populate('verifiedBy', 'name');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Get shop products count
    const productsCount = await Product.countDocuments({
      shopId: shop._id,
      isActive: true,
      isApproved: true
    });

    // Get shop reviews count
    const reviewsCount = await Review.countDocuments({
      shopId: shop._id,
      status: 'approved'
    });

    // Check if current user follows this shop
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.isFollowing(req.user._id, shop._id);
      isFollowing = !!follow;
    }

    const shopData = shop.getPublicProfile();
    shopData.productsCount = productsCount;
    shopData.reviewsCount = reviewsCount;
    shopData.isFollowing = isFollowing;

    res.json({
      success: true,
      data: shopData
    });
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop'
    });
  }
});

// @route   GET /api/shops/:id/products
// @desc    Get products by shop
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const products = await Product.findByShop(req.params.id, options);

    const totalProducts = await Product.countDocuments({
      shopId: req.params.id,
      isActive: true,
      isApproved: true
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / parseInt(limit)),
          totalProducts,
          hasNextPage: parseInt(page) * parseInt(limit) < totalProducts,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get shop products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop products'
    });
  }
});

// @route   GET /api/shops/:id/reviews
// @desc    Get reviews by shop
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      rating: rating ? parseInt(rating) : undefined,
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const reviews = await Review.findByShop(req.params.id, options);

    const totalReviews = await Review.countDocuments({
      shopId: req.params.id,
      status: 'approved'
    });

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
    console.error('Get shop reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop reviews'
    });
  }
});

// @route   POST /api/shops
// @desc    Create a new shop
// @access  Private (Vendor)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Only vendors can create shops'
      });
    }

    // Check if vendor already has a shop
    const existingShop = await Shop.findOne({ ownerId: req.user._id });
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: 'Vendor already has a shop'
      });
    }

    const {
      name,
      description,
      address,
      location,
      contact,
      categories,
      operatingHours,
      features,
      businessInfo
    } = req.body;

    const shop = new Shop({
      name,
      description,
      ownerId: req.user._id,
      address,
      location,
      contact,
      categories,
      operatingHours,
      features,
      businessInfo
    });

    await shop.save();

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: shop.getPublicProfile()
    });
  } catch (error) {
    console.error('Create shop error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create shop'
    });
  }
});

// @route   PUT /api/shops/:id
// @desc    Update shop
// @access  Private (Shop Owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Check if user owns the shop
    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shop'
      });
    }

    const updateFields = [
      'name',
      'description',
      'address',
      'location',
      'contact',
      'categories',
      'operatingHours',
      'features',
      'socialMedia',
      'businessInfo'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        shop[field] = req.body[field];
      }
    });

    await shop.save();

    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: shop.getPublicProfile()
    });
  } catch (error) {
    console.error('Update shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shop'
    });
  }
});

// @route   POST /api/shops/:id/logo
// @desc    Upload shop logo
// @access  Private (Shop Owner)
router.post('/:id/logo', auth, upload.single('logo'), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shop'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    shop.logo = req.file.path;
    await shop.save();

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logo: shop.logo }
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo'
    });
  }
});

// @route   POST /api/shops/:id/banner
// @desc    Upload shop banner
// @access  Private (Shop Owner)
router.post('/:id/banner', auth, upload.single('banner'), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shop'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    shop.banner = req.file.path;
    await shop.save();

    res.json({
      success: true,
      message: 'Banner uploaded successfully',
      data: { banner: shop.banner }
    });
  } catch (error) {
    console.error('Upload banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload banner'
    });
  }
});

// @route   POST /api/shops/:id/gallery
// @desc    Upload shop gallery images
// @access  Private (Shop Owner)
router.post('/:id/gallery', auth, upload.array('images', 10), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shop'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const imagePaths = req.files.map(file => file.path);
    shop.gallery = [...shop.gallery, ...imagePaths];
    await shop.save();

    res.json({
      success: true,
      message: 'Gallery images uploaded successfully',
      data: { gallery: shop.gallery }
    });
  } catch (error) {
    console.error('Upload gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload gallery images'
    });
  }
});

// @route   DELETE /api/shops/:id/gallery/:imageIndex
// @desc    Remove image from shop gallery
// @access  Private (Shop Owner)
router.delete('/:id/gallery/:imageIndex', auth, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shop'
      });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= shop.gallery.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image index'
      });
    }

    shop.gallery.splice(imageIndex, 1);
    await shop.save();

    res.json({
      success: true,
      message: 'Image removed from gallery',
      data: { gallery: shop.gallery }
    });
  } catch (error) {
    console.error('Remove gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove image from gallery'
    });
  }
});

// @route   GET /api/shops/:id/analytics
// @desc    Get shop analytics
// @access  Private (Shop Owner)
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics'
      });
    }

    // Get products count
    const productsCount = await Product.countDocuments({
      shopId: shop._id,
      isActive: true
    });

    // Get reviews count
    const reviewsCount = await Review.countDocuments({
      shopId: shop._id,
      status: 'approved'
    });

    // Get followers analytics
    const followerAnalytics = await Follow.getFollowerAnalytics(shop._id, 30);

    // Get total sales (from orders)
    const Order = require('../models/Order');
    const salesStats = await Order.getStats(shop._id);

    res.json({
      success: true,
      data: {
        shop: shop.getPublicProfile(),
        productsCount,
        reviewsCount,
        followerAnalytics,
        salesStats: salesStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          statusDistribution: {}
        }
      }
    });
  } catch (error) {
    console.error('Get shop analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop analytics'
    });
  }
});

// @route   DELETE /api/shops/:id
// @desc    Delete shop
// @access  Private (Shop Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Check if user owns the shop or is admin
    if (shop.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this shop'
      });
    }

    // Deactivate shop instead of deleting
    shop.isActive = false;
    await shop.save();

    res.json({
      success: true,
      message: 'Shop deactivated successfully'
    });
  } catch (error) {
    console.error('Delete shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shop'
    });
  }
});

module.exports = router; 