const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticate: auth } = require('../middleware/auth');

// Helper function for coupon validation
const validateCoupon = (code) => {
  const validCoupons = {
    'SAVE20': { discountAmount: 100, discountType: 'fixed' },
    'DISCOUNT10': { discountAmount: 10, discountType: 'percentage' },
    'FREESHIP': { discountAmount: 50, discountType: 'fixed' }
  };
  
  const couponData = validCoupons[code.toUpperCase()];
  if (!couponData) {
    return null;
  }
  
  return {
    code: code.toUpperCase(),
    ...couponData
  };
};

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user._id);
    
    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    res.json({
      success: true,
      data: cart.getPublicProfile()
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
});

// @route   POST /api/cart/items
// @desc    Add item to cart
// @access  Private
router.post('/items', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive || !product.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check stock availability
    if (product.hasVariants) {
      const variant = product.getVariant(size, color);
      if (!variant || variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Selected variant is out of stock'
        });
      }
    } else {
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
    }

    // Get or create cart
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Add item to cart
    await cart.addItem(
      productId,
      product.vendorId,
      quantity,
      product.price,
      size,
      color
    );

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart.getPublicProfile()
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// @route   PUT /api/cart/items/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/items/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.getOrCreateCart(req.user._id);

    // Find the item
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Check stock availability
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.hasVariants) {
      const variant = product.getVariant(item.size, item.color);
      if (!variant || variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for selected variant'
        });
      }
    } else {
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
    }

    // Update quantity
    await cart.updateItemQuantity(req.params.itemId, quantity);

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: cart.getPublicProfile()
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
    });
  }
});

// @route   DELETE /api/cart/items/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/items/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Check if item exists
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Remove item
    await cart.removeItem(req.params.itemId);

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart.getPublicProfile()
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// @route   POST /api/cart/coupons
// @desc    Apply coupon to cart
// @access  Private
router.post('/coupons', auth, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const couponData = validateCoupon(code);
    if (!couponData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon'
      });
    }

    const cart = await Cart.getOrCreateCart(req.user._id);

    // Apply coupon
    await cart.applyCoupon(
      couponData.code,
      couponData.discountAmount,
      couponData.discountType
    );

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        cart: cart.getPublicProfile(),
        summary: cart.getSummary()
      }
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply coupon'
    });
  }
});

// @route   DELETE /api/cart/coupons/:code
// @desc    Remove coupon from cart
// @access  Private
router.delete('/coupons/:code', auth, async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Remove coupon
    await cart.removeCoupon(req.params.code.toUpperCase());

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    res.json({
      success: true,
      message: 'Coupon removed successfully',
      data: {
        cart: cart.getPublicProfile(),
        summary: cart.getSummary()
      }
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove coupon'
    });
  }
});

// @route   POST /api/cart/check-availability
// @desc    Check cart items availability
// @access  Private
router.post('/check-availability', auth, async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Check availability
    await cart.checkAvailability();

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    // Check for unavailable items
    const unavailableItems = cart.items.filter(item => !item.isAvailable);

    res.json({
      success: true,
      data: {
        ...cart.getPublicProfile(),
        unavailableItems: unavailableItems.length > 0 ? unavailableItems : null
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability'
    });
  }
});

// @route   POST /api/cart/save-address
// @desc    Save shipping address to cart
// @access  Private
router.post('/save-address', auth, async (req, res) => {
  try {
    const { street, city, state, zipCode, country = 'India' } = req.body;

    if (!street || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required'
      });
    }

    const cart = await Cart.getOrCreateCart(req.user._id);

    cart.shippingAddress = {
      street,
      city,
      state,
      zipCode,
      country
    };

    await cart.save();

    res.json({
      success: true,
      message: 'Shipping address saved successfully',
      data: {
        shippingAddress: cart.shippingAddress
      }
    });
  } catch (error) {
    console.error('Save address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save shipping address'
    });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Clear cart
    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart.getPublicProfile()
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

// @route   GET /api/cart/summary
// @desc    Get cart summary
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user._id);

    res.json({
      success: true,
      data: cart.getSummary()
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart summary'
    });
  }
});

// Additional routes to match test expectations
// @route   POST /api/cart/add
// @desc    Add item to cart (alias for /items)
// @access  Private
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive || !product.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check stock availability
    if (product.hasVariants) {
      const variant = product.getVariant(size, color);
      if (!variant || variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Selected variant is out of stock'
        });
      }
    } else {
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
    }

    // Get or create cart
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Add item to cart
    await cart.addItem(
      productId,
      product.vendorId,
      quantity,
      product.price,
      size,
      color
    );

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart.getPublicProfile()
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// @route   PUT /api/cart/update/:itemId
// @desc    Update cart item quantity (alias for /items/:itemId)
// @access  Private
router.put('/update/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.getOrCreateCart(req.user._id);

    // Find the item
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Check stock availability
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.hasVariants) {
      const variant = product.getVariant(item.size, item.color);
      if (!variant || variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for selected variant'
        });
      }
    } else {
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
    }

    // Update quantity
    await cart.updateItemQuantity(req.params.itemId, quantity);

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: cart.getPublicProfile()
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
    });
  }
});

// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart (alias for /items/:itemId)
// @access  Private
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Check if item exists
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Remove item
    await cart.removeItem(req.params.itemId);

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart: cart.getPublicProfile(),
        summary: cart.getSummary()
      }
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// @route   POST /api/cart/clear
// @desc    Clear cart (alias for DELETE /)
// @access  Private
router.post('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Clear cart
    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart.getPublicProfile()
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

// @route   POST /api/cart/apply-coupon
// @desc    Apply coupon to cart (alias for /coupons)
// @access  Private
router.post('/apply-coupon', auth, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const couponData = validateCoupon(code);
    if (!couponData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon'
      });
    }

    const cart = await Cart.getOrCreateCart(req.user._id);

    // Apply coupon
    await cart.applyCoupon(
      couponData.code,
      couponData.discountAmount,
      couponData.discountType
    );

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        cart: cart.getPublicProfile(),
        summary: cart.getSummary()
      }
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply coupon'
    });
  }
});

// @route   POST /api/cart/remove-coupon
// @desc    Remove coupon from cart (alias for DELETE /coupons/:code)
// @access  Private
router.post('/remove-coupon', auth, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const cart = await Cart.getOrCreateCart(req.user._id);

    // Remove coupon
    await cart.removeCoupon(code.toUpperCase());

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock isActive isApproved',
      populate: {
        path: 'shopId',
        select: 'name logo'
      }
    });

    await cart.populate('items.vendorId', 'name storeName');

    res.json({
      success: true,
      message: 'Coupon removed successfully',
      data: {
        cart: cart.getPublicProfile(),
        summary: cart.getSummary()
      }
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove coupon'
    });
  }
});

module.exports = router; 