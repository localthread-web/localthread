const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { authenticate, requireCustomer, requireVendor } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authenticate,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code cannot exceed 20 characters'),
  body('storeName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Store name cannot exceed 100 characters'),
  body('storeLocation')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Store location cannot exceed 200 characters'),
  body('storeDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Store description cannot exceed 500 characters')
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

    const {
      name,
      phone,
      address,
      storeName,
      storeLocation,
      storeDescription
    } = req.body;

    // Update basic fields
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (address) req.user.address = { ...req.user.address, ...address };

    // Update vendor-specific fields (only if user is vendor)
    if (req.user.role === 'vendor') {
      if (storeName) req.user.storeName = storeName;
      if (storeLocation) req.user.storeLocation = storeLocation;
      if (storeDescription) req.user.storeDescription = storeDescription;
    }

    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.put('/avatar', [
  authenticate,
  upload.single('avatar')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Delete old avatar if exists
    if (req.user.avatar) {
      const oldAvatarPath = path.join(process.env.UPLOAD_PATH || './uploads', req.user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user avatar
    req.user.avatar = req.file.filename;
    await req.user.save();

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: req.file.filename,
        avatarUrl: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/store-image
// @desc    Upload store image (vendors only)
// @access  Private
router.put('/store-image', [
  authenticate,
  requireVendor,
  upload.single('storeImage')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Delete old store image if exists
    if (req.user.storeImage) {
      const oldImagePath = path.join(process.env.UPLOAD_PATH || './uploads', req.user.storeImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update store image
    req.user.storeImage = req.file.filename;
    await req.user.save();

    res.json({
      success: true,
      message: 'Store image updated successfully',
      data: {
        storeImage: req.file.filename,
        storeImageUrl: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Store image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put('/password', [
  authenticate,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password for comparison
    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Deactivate account
// @access  Private
router.delete('/account', [
  authenticate,
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deactivation')
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

    const { password } = req.body;

    // Get user with password for verification
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Deactivate account
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/vendors
// @desc    Get all vendors (public)
// @access  Public
router.get('/vendors', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const query = {
      role: 'vendor',
      isActive: true
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } },
        { storeLocation: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await User.find(query)
      .select('name storeName storeLocation storeImage storeDescription')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalVendors: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
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

// @route   GET /api/users/vendors/:id
// @desc    Get vendor profile by ID
// @access  Public
router.get('/vendors/:id', async (req, res) => {
  try {
    const vendor = await User.findOne({
      _id: req.params.id,
      role: 'vendor',
      isActive: true
    }).select('name storeName storeLocation storeImage storeDescription createdAt');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: {
        vendor
      }
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 