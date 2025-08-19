const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticate, requireCustomer } = require('../middleware/auth');

// 1️⃣ View Profile - GET /api/customers/profile
router.get('/profile', authenticate, requireCustomer, async (req, res) => {
  try {
    const customer = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires')
      .populate('wishlist', 'name price images category');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get order count
    const orderCount = await Order.countDocuments({ customerId: req.user._id });

    res.json({
      success: true,
      data: {
        customer,
        orderCount
      }
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 2️⃣ Edit Personal Details - PUT /api/customers/profile
router.put('/profile', [
  authenticate,
  requireCustomer,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters')
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

    const { name, phone, address } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const customer = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 3️⃣ View Order History - GET /api/customers/orders
router.get('/orders', authenticate, requireCustomer, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { customerId: req.user._id };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.productId', 'name price images')
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
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 4️⃣ Save Shipping Addresses - POST /api/customers/addresses
router.post('/addresses', [
  authenticate,
  requireCustomer,
  body('label')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Address label must be between 2 and 50 characters'),
  body('street')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('zipCode')
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('Zip code must be 6 digits'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
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

    const { label, street, city, state, zipCode, isDefault = false } = req.body;

    // If this is the first address, make it default
    const customer = await User.findById(req.user._id);
    if (!customer.addresses || customer.addresses.length === 0) {
      isDefault = true;
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await User.updateMany(
        { _id: req.user._id, 'addresses.isDefault': true },
        { $set: { 'addresses.$.isDefault': false } }
      );
    }

    const newAddress = {
      label,
      street,
      city,
      state,
      zipCode,
      isDefault
    };

    const updatedCustomer = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { addresses: newAddress } },
      { new: true }
    ).select('-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires');

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { addresses: updatedCustomer.addresses }
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 4️⃣ Get Shipping Addresses - GET /api/customers/addresses
router.get('/addresses', authenticate, requireCustomer, async (req, res) => {
  try {
    const customer = await User.findById(req.user._id)
      .select('addresses');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: { addresses: customer.addresses || [] }
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 4️⃣ Update Shipping Address - PUT /api/customers/addresses/:addressId
router.put('/addresses/:addressId', [
  authenticate,
  requireCustomer,
  body('label')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Address label must be between 2 and 50 characters'),
  body('street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('zipCode')
    .optional()
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('Zip code must be 6 digits'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
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

    const { addressId } = req.params;
    const updateData = req.body;

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await User.updateMany(
        { _id: req.user._id, 'addresses.isDefault': true },
        { $set: { 'addresses.$.isDefault': false } }
      );
    }

    const customer = await User.findOneAndUpdate(
      { 
        _id: req.user._id,
        'addresses._id': addressId 
      },
      { 
        $set: {
          'addresses.$': { ...updateData, _id: addressId }
        }
      },
      { new: true }
    ).select('-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { addresses: customer.addresses }
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 4️⃣ Delete Shipping Address - DELETE /api/customers/addresses/:addressId
router.delete('/addresses/:addressId', authenticate, requireCustomer, async (req, res) => {
  try {
    const { addressId } = req.params;

    const customer = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).select('-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: { addresses: customer.addresses }
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 5️⃣ Add to Wishlist - POST /api/customers/wishlist
router.post('/wishlist', [
  authenticate,
  requireCustomer,
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID')
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

    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if already in wishlist
    const customer = await User.findById(req.user._id);
    if (customer.wishlist && customer.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    const updatedCustomer = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate('wishlist', 'name price images category');

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: { wishlist: updatedCustomer.wishlist }
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 5️⃣ Get Wishlist - GET /api/customers/wishlist
router.get('/wishlist', authenticate, requireCustomer, async (req, res) => {
  try {
    const customer = await User.findById(req.user._id)
      .populate('wishlist', 'name price images category vendorId')
      .select('wishlist');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: { wishlist: customer.wishlist || [] }
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 5️⃣ Remove from Wishlist - DELETE /api/customers/wishlist/:productId
router.delete('/wishlist/:productId', authenticate, requireCustomer, async (req, res) => {
  try {
    const { productId } = req.params;

    const customer = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate('wishlist', 'name price images category');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: { wishlist: customer.wishlist }
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 