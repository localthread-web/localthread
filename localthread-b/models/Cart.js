const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  // Product variant information
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  // Metadata for tracking
  addedAt: {
    type: Date,
    default: Date.now
  },
  // Stock check timestamp
  lastStockCheck: {
    type: Date,
    default: Date.now
  },
  // Availability status
  isAvailable: {
    type: Boolean,
    default: true
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  items: [cartItemSchema],
  // Cart metadata
  totalItems: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  // Applied discounts/coupons
  appliedCoupons: [{
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Cart status
  isActive: {
    type: Boolean,
    default: true
  },
  // Last activity
  lastActivity: {
    type: Date,
    default: Date.now
  },
  // Shipping address (if saved)
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cartSchema.index({ userId: 1 });
cartSchema.index({ isActive: 1 });
cartSchema.index({ lastActivity: -1 });
cartSchema.index({ 'items.productId': 1 });
cartSchema.index({ 'items.vendorId': 1 });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  // Calculate total items
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Update last activity
  this.lastActivity = new Date();
  
  next();
});

// Instance method to add item to cart
cartSchema.methods.addItem = function(productId, vendorId, quantity, price, size = null, color = null) {
  // Check if item already exists
  const existingItemIndex = this.items.findIndex(item => 
    item.productId.toString() === productId.toString() &&
    item.size === size &&
    item.color === color
  );
  
  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price; // Update price in case it changed
    this.items[existingItemIndex].addedAt = new Date();
  } else {
    // Add new item
    this.items.push({
      productId,
      vendorId,
      quantity,
      price,
      size,
      color,
      addedAt: new Date(),
      lastStockCheck: new Date(),
      isAvailable: true
    });
  }
  
  return this.save();
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    item.quantity = Math.max(1, quantity);
    item.addedAt = new Date();
  }
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.appliedCoupons = [];
  return this.save();
};

// Instance method to apply coupon
cartSchema.methods.applyCoupon = function(couponCode, discountAmount, discountType) {
  // Remove existing coupon with same code
  this.appliedCoupons = this.appliedCoupons.filter(coupon => coupon.code !== couponCode);
  
  // Add new coupon
  this.appliedCoupons.push({
    code: couponCode,
    discountAmount,
    discountType,
    appliedAt: new Date()
  });
  
  return this.save();
};

// Instance method to remove coupon
cartSchema.methods.removeCoupon = function(couponCode) {
  this.appliedCoupons = this.appliedCoupons.filter(coupon => coupon.code !== couponCode);
  return this.save();
};

// Instance method to calculate total with discounts
cartSchema.methods.calculateTotal = function() {
  let total = this.subtotal;
  
  // Apply coupon discounts
  this.appliedCoupons.forEach(coupon => {
    if (coupon.discountType === 'percentage') {
      total -= (this.subtotal * coupon.discountAmount / 100);
    } else {
      total -= coupon.discountAmount;
    }
  });
  
  return Math.max(0, total);
};

// Instance method to get cart summary
cartSchema.methods.getSummary = function() {
  const totalDiscount = this.appliedCoupons.reduce((total, coupon) => {
    if (coupon.discountType === 'percentage') {
      return total + (this.subtotal * coupon.discountAmount / 100);
    } else {
      return total + coupon.discountAmount;
    }
  }, 0);
  
  return {
    totalItems: this.totalItems,
    subtotal: this.subtotal,
    totalDiscount,
    discountAmount: totalDiscount,
    shippingFee: 0, // Default shipping fee
    total: this.calculateTotal(),
    appliedCoupons: this.appliedCoupons,
    shippingAddress: this.shippingAddress
  };
};

// Instance method to get public profile (for API responses)
cartSchema.methods.getPublicProfile = function() {
  const summary = this.getSummary();
  return {
    _id: this._id,
    userId: this.userId,
    items: this.items.map(item => ({
      _id: item._id,
      productId: item.productId ? (typeof item.productId === 'object' ? item.productId._id : item.productId) : null,
      vendorId: item.vendorId ? (typeof item.vendorId === 'object' ? item.vendorId._id : item.vendorId) : null,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color,
      addedAt: item.addedAt,
      isAvailable: item.isAvailable
    })),
    totalItems: this.totalItems,
    subtotal: this.subtotal,
    appliedCoupons: this.appliedCoupons,
    shippingAddress: this.shippingAddress,
    isActive: this.isActive,
    lastActivity: this.lastActivity,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    // Include summary data
    totalDiscount: summary.totalDiscount,
    discountAmount: summary.discountAmount,
    shippingFee: summary.shippingFee,
    total: summary.total,
    finalTotal: summary.total // Alias for total
  };
};

// Instance method to check item availability
cartSchema.methods.checkAvailability = async function() {
  const Product = mongoose.model('Product');
  
  for (let item of this.items) {
    try {
      const product = await Product.findById(item.productId);
      if (product) {
        item.isAvailable = product.stock >= item.quantity && product.isActive;
        item.lastStockCheck = new Date();
      } else {
        item.isAvailable = false;
      }
    } catch (error) {
      console.error('Error checking product availability:', error);
      item.isAvailable = false;
    }
  }
  
  return this.save();
};

// Static method to find cart by user
cartSchema.statics.findByUser = function(userId) {
  return this.findOne({ userId, isActive: true });
};

// Static method to create or get user cart
cartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ userId, isActive: true });
  
  if (!cart) {
    cart = new this({ userId });
    await cart.save();
  }
  
  return cart;
};

module.exports = mongoose.model('Cart', cartSchema); 