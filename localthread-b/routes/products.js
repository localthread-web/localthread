const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { authenticate, requireVendor, requireVendorOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   GET /api/products/vendor
// @desc    Get vendor's products
// @access  Private (Vendor)
router.get('/vendor', authenticate, requireVendor, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    
    const query = { vendorId: req.user._id };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total
        }
      }
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Vendor)
router.post('/', [
  authenticate,
  requireVendor,
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Product description must be between 10 and 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['clothing', 'accessories', 'footwear', 'jewelry', 'home', 'other'])
    .withMessage('Invalid category'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('sizes')
    .optional()
    .isArray()
    .withMessage('Sizes must be an array'),
  body('colors')
    .optional()
    .isArray()
    .withMessage('Colors must be an array')
], async (req, res) => {
  try {
    console.log('🚀 Product creation request received');
    console.log('📋 Request body:', req.body);
    console.log('🔑 User ID:', req.user._id);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    console.log('✅ Validation passed, creating product...');

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      stock,
      images,
      sizes,
      colors
    } = req.body;

    console.log('📊 Product data to create:', {
      name,
      description,
      price: `${price} (${typeof price})`,
      originalPrice: `${originalPrice} (${typeof originalPrice})`,
      category,
      stock: `${stock} (${typeof stock})`,
      images: `${images.length} images`,
      sizes: `${sizes?.length || 0} sizes`,
      colors: `${colors?.length || 0} colors`
    });

    // Create product
    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category,
      stock,
      vendorId: req.user._id,
      images,
      sizes,
      colors,
      isActive: true
    });

    console.log('💾 Saving product to database...');
    await product.save();
    console.log('✅ Product saved successfully, ID:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('💥 Create product error:', error);
    console.error('💥 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyValue: error.keyValue
    });
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Vendor)
router.put('/:id', [
  authenticate,
  requireVendor,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Product description must be between 10 and 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isIn(['clothing', 'accessories', 'footwear', 'jewelry', 'home', 'other'])
    .withMessage('Invalid category'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
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

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if vendor owns this product
    if (product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own products.'
      });
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Vendor)
router.delete('/:id', authenticate, requireVendor, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if vendor owns this product
    if (product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own products.'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/products/upload-image
// @desc    Upload product image
// @access  Private (Vendor)
router.post('/upload-image', authenticate, requireVendor, upload.single('image'), async (req, res) => {
  try {
    console.log('📸 Image upload request received');
    console.log('🔑 User ID:', req.user._id);
    console.log('📁 File field:', req.file?.fieldname);
    console.log('📁 File details:', req.file);
    
    if (!req.file) {
      console.log('❌ No file provided');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Log upload details for debugging
    console.log('✅ Image upload successful:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      destination: req.file.destination,
      path: req.file.path
    });

    const imageUrl = `/uploads/products/${req.file.filename}`;
    console.log('🔗 Generated image URL:', imageUrl);
    console.log('🔗 Full image URL:', `http://localhost:5000${imageUrl}`);

    res.json({
      success: true,
      data: { imageUrl }
    });
  } catch (error) {
    console.error('💥 Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/products/test-upload
// @desc    Test image upload (for debugging)
// @access  Private (Vendor)
router.post('/test-upload', authenticate, requireVendor, (req, res) => {
  res.json({
    success: true,
    message: 'Upload endpoint is accessible',
    data: {
      uploadsDir: 'uploads/products/',
      maxFileSize: '5MB',
      allowedTypes: ['jpeg', 'jpg', 'png', 'webp']
    }
  });
});

// @route   GET /api/products
// @desc    Get all products (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, vendorId } = req.query;
    
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (vendorId) {
      query.vendorId = vendorId;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('vendorId', 'name storeName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 