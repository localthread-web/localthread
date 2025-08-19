const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, 'Shop ID is required']
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
  // Product snapshot at time of order
  productSnapshot: {
    name: String,
    images: [String],
    category: String,
    size: String,
    color: String
  },
  // Vendor snapshot at time of order
  vendorSnapshot: {
    name: String,
    storeName: String,
    storeLocation: String
  },
  // Item-specific status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  // Shipping details
  trackingNumber: String,
  trackingUrl: String,
  shippedAt: Date,
  deliveredAt: Date,
  // Refund information
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundReason: String,
  refundedAt: Date
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  items: [orderItemSchema],
  
  // Order totals
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Shipping information
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      default: 'India'
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    }
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'upi', 'netbanking', 'wallet'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentId: String, // External payment gateway ID
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paytm', 'cod'],
    default: 'cod'
  },
  paymentDetails: {
    transactionId: String,
    gatewayResponse: mongoose.Schema.Types.Mixed,
    capturedAt: Date
  },
  
  // Order metadata
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  // Coupon/discount information
  appliedCoupons: [{
    code: String,
    discountAmount: Number,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  }],
  
  // Audit trail
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String,
    notes: String
  }],
  
  // Vendor-specific information
  vendorOrders: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop'
    },
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      price: Number
    }],
    subtotal: Number,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date
  }],
  
  // Invoice information
  invoiceNumber: String,
  invoiceUrl: String,
  
  // Customer feedback
  customerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  customerReview: String,
  reviewSubmittedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.vendorId': 1 });
orderSchema.index({ 'items.productId': 1 });
orderSchema.index({ 'vendorOrders.vendorId': 1 });
orderSchema.index({ 'vendorOrders.shopId': 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate order number: ORD-YYYYMMDD-XXXXX
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
                   (date.getMonth() + 1).toString().padStart(2, '0') +
                   date.getDate().toString().padStart(2, '0');
    const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.orderNumber = `ORD-${dateStr}-${randomStr}`;
  }
  next();
});

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, changedBy, reason = '', notes = '') {
  this.status = newStatus;
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    changedBy,
    changedAt: new Date(),
    reason,
    notes
  });
  
  // Update item statuses if order is cancelled
  if (newStatus === 'cancelled') {
    this.items.forEach(item => {
      item.status = 'cancelled';
    });
  }
  
  return this.save();
};

// Instance method to update item status
orderSchema.methods.updateItemStatus = function(itemId, newStatus, changedBy, reason = '') {
  const item = this.items.id(itemId);
  if (item) {
    item.status = newStatus;
    
    // Update vendor order status
    const vendorOrder = this.vendorOrders.find(vo => 
      vo.vendorId.toString() === item.vendorId.toString()
    );
    if (vendorOrder) {
      const vendorItem = vendorOrder.items.find(vi => 
        vi.productId.toString() === item.productId.toString()
      );
      if (vendorItem) {
        vendorItem.status = newStatus;
      }
    }
    
    // Add to status history
    this.statusHistory.push({
      status: newStatus,
      changedBy,
      changedAt: new Date(),
      reason: `Item ${item.productSnapshot.name}: ${reason}`
    });
  }
  
  return this.save();
};

// Instance method to add tracking information
orderSchema.methods.addTracking = function(itemId, trackingNumber, trackingUrl) {
  const item = this.items.id(itemId);
  if (item) {
    item.trackingNumber = trackingNumber;
    item.trackingUrl = trackingUrl;
    item.shippedAt = new Date();
    item.status = 'shipped';
  }
  
  return this.save();
};

// Instance method to mark as delivered
orderSchema.methods.markDelivered = function(itemId) {
  const item = this.items.id(itemId);
  if (item) {
    item.deliveredAt = new Date();
    item.status = 'delivered';
  }
  
  return this.save();
};

// Instance method to process refund
orderSchema.methods.processRefund = function(itemId, refundAmount, reason) {
  const item = this.items.id(itemId);
  if (item) {
    item.refundAmount = refundAmount;
    item.refundReason = reason;
    item.refundedAt = new Date();
    item.status = 'refunded';
  }
  
  return this.save();
};

// Instance method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate tax (example: 18% GST)
  this.taxAmount = this.subtotal * 0.18;
  
  // Calculate shipping fee
  this.shippingFee = this.subtotal > 1000 ? 0 : 100; // Free shipping above ₹1000
  
  // Calculate discount
  this.discountAmount = this.appliedCoupons.reduce((total, coupon) => {
    if (coupon.discountType === 'percentage') {
      return total + (this.subtotal * coupon.discountAmount / 100);
    } else {
      return total + coupon.discountAmount;
    }
  }, 0);
  
  // Calculate total
  this.totalAmount = this.subtotal + this.taxAmount + this.shippingFee - this.discountAmount;
  
  return this.save();
};

// Instance method to get public profile
orderSchema.methods.getPublicProfile = function() {
  const orderObject = this.toObject();
  
  // Remove sensitive information
  delete orderObject.paymentDetails;
  delete orderObject.statusHistory;
  
  return orderObject;
};

// Static method to find orders by customer
orderSchema.statics.findByCustomer = function(customerId, options = {}) {
  const query = { customerId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('items.productId', 'name images')
    .populate('items.vendorId', 'name storeName')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

// Static method to find orders by vendor
orderSchema.statics.findByVendor = function(vendorId, options = {}) {
  const query = { 'items.vendorId': vendorId };
  
  if (options.status) {
    query['items.status'] = options.status;
  }
  
  return this.find(query)
    .populate('customerId', 'name email phone')
    .populate('items.productId', 'name images')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

// Static method to get order statistics
orderSchema.statics.getStats = function(vendorId = null) {
  const matchStage = vendorId ? { 'items.vendorId': vendorId } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        statusDistribution: {
          $push: '$status'
        }
      }
    },
    {
      $project: {
        totalOrders: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        averageOrderValue: { $round: ['$averageOrderValue', 2] },
        statusDistribution: {
          pending: { $size: { $filter: { input: '$statusDistribution', cond: { $eq: ['$$this', 'pending'] } } } },
          confirmed: { $size: { $filter: { input: '$statusDistribution', cond: { $eq: ['$$this', 'confirmed'] } } } },
          processing: { $size: { $filter: { input: '$statusDistribution', cond: { $eq: ['$$this', 'processing'] } } } },
          shipped: { $size: { $filter: { input: '$statusDistribution', cond: { $eq: ['$$this', 'shipped'] } } } },
          delivered: { $size: { $filter: { input: '$statusDistribution', cond: { $eq: ['$$this', 'delivered'] } } } },
          cancelled: { $size: { $filter: { input: '$statusDistribution', cond: { $eq: ['$$this', 'cancelled'] } } } }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema); 