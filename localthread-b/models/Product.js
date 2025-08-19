const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  size: {
    type: String,
    trim: true,
    required: [true, 'Size is required']
  },
  color: {
    type: String,
    trim: true,
    required: [true, 'Color is required']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Product description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100']
  },
  
  // Product categorization
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['clothing', 'accessories', 'footwear', 'jewelry', 'home', 'other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  
  // Shop and vendor information
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor ID is required']
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: false // Made optional for now
  },
  
  // Product variants
  variants: [productVariantSchema],
  hasVariants: {
    type: Boolean,
    default: false
  },
  
  // Available sizes and colors
  availableSizes: [{
    type: String,
    trim: true
  }],
  availableColors: [{
    type: String,
    trim: true
  }],
  
  // Stock management
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  
  // Product images
  images: [{
    type: String,
    required: [true, 'At least one product image is required'],
    validate: {
      validator: function(v) {
        // Accept both full URLs and relative paths
        return /^(https?:\/\/.+\.(jpg|jpeg|png|gif|webp)|^\/uploads\/.+\.(jpg|jpeg|png|gif|webp))$/i.test(v);
      },
      message: 'Please provide valid image URLs or upload paths'
    }
  }],
  thumbnail: {
    type: String,
    default: function() {
      return this.images && this.images.length > 0 ? this.images[0] : null;
    }
  },
  
  // Product status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  
  // SEO and search
  tags: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Product specifications
  specifications: {
    type: Map,
    of: String
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number
  },
  material: {
    type: String,
    trim: true
  },
  careInstructions: {
    type: String,
    trim: true
  },
  
  // Ratings and reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      '1': { type: Number, default: 0 },
      '2': { type: Number, default: 0 },
      '3': { type: Number, default: 0 },
      '4': { type: Number, default: 0 },
      '5': { type: Number, default: 0 }
    }
  },
  
  // Sales and popularity
  salesCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  },
  
  // Shipping information
  weight: {
    type: Number,
    min: 0
  },
  shippingClass: {
    type: String,
    enum: ['light', 'medium', 'heavy'],
    default: 'medium'
  },
  isFreeShipping: {
    type: Boolean,
    default: false
  },
  
  // Return policy
  returnPolicy: {
    allowed: {
      type: Boolean,
      default: true
    },
    days: {
      type: Number,
      default: 7,
      min: 0
    },
    conditions: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ vendorId: 1 });
productSchema.index({ shopId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isApproved: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'variants.sku': 1 });

// Text search index
productSchema.index({
  name: 'text',
  description: 'text',
  shortDescription: 'text',
  brand: 'text',
  tags: 'text'
}, {
  weights: {
    name: 10,
    brand: 8,
    tags: 6,
    shortDescription: 4,
    description: 2
  }
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Add timestamp to ensure uniqueness
    this.slug = `${baseSlug}-${Date.now()}`;
  }
  
  // Set thumbnail if not provided
  if (!this.thumbnail && this.images && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }
  
  // Calculate discount percentage
  if (this.originalPrice && this.price) {
    this.discountPercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  
  // Check if product has variants
  this.hasVariants = this.variants && this.variants.length > 0;
  
  next();
});

// Instance method to get public profile
productSchema.methods.getPublicProfile = function() {
  const productObject = this.toObject();
  
  // Remove sensitive information
  delete productObject.approvedBy;
  delete productObject.vendorId;
  
  return productObject;
};

// Instance method to update stock
productSchema.methods.updateStock = function(quantity, operation = 'decrease') {
  if (operation === 'decrease') {
    this.stock = Math.max(0, this.stock - quantity);
  } else if (operation === 'increase') {
    this.stock += quantity;
  }
  
  return this.save();
};

// Instance method to check if product is in stock
productSchema.methods.isInStock = function() {
  if (this.hasVariants) {
    return this.variants.some(variant => variant.stock > 0 && variant.isActive);
  }
  return this.stock > 0;
};

// Instance method to get variant by size and color
productSchema.methods.getVariant = function(size, color) {
  if (!this.hasVariants) return null;
  
  return this.variants.find(variant => 
    variant.size === size && 
    variant.color === color && 
    variant.isActive
  );
};

// Instance method to update variant stock
productSchema.methods.updateVariantStock = function(size, color, quantity, operation = 'decrease') {
  const variant = this.getVariant(size, color);
  if (variant) {
    if (operation === 'decrease') {
      variant.stock = Math.max(0, variant.stock - quantity);
    } else if (operation === 'increase') {
      variant.stock += quantity;
    }
    return this.save();
  }
  return Promise.reject(new Error('Variant not found'));
};

// Instance method to increment view count
productSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to increment sales count
productSchema.methods.incrementSales = function(quantity = 1) {
  this.salesCount += quantity;
  return this.save();
};

// Instance method to update rating
productSchema.methods.updateRating = function(newRating, oldRating = null) {
  const Review = mongoose.model('Review');
  
  return Review.aggregate([
    { $match: { productId: this._id, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]).then(stats => {
    if (stats.length > 0) {
      const stat = stats[0];
      this.rating.average = Math.round(stat.averageRating * 10) / 10;
      this.rating.count = stat.totalReviews;
      
      // Calculate rating distribution
      this.rating.distribution = {
        '1': stat.ratingDistribution.filter(r => r === 1).length,
        '2': stat.ratingDistribution.filter(r => r === 2).length,
        '3': stat.ratingDistribution.filter(r => r === 3).length,
        '4': stat.ratingDistribution.filter(r => r === 4).length,
        '5': stat.ratingDistribution.filter(r => r === 5).length
      };
    }
    
    return this.save();
  });
};

// Static method to find products by shop
productSchema.statics.findByShop = function(shopId, options = {}) {
  const query = { shopId, isActive: true, isApproved: true };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.brand) {
    query.brand = options.brand;
  }
  
  if (options.minPrice) {
    query.price = { $gte: options.minPrice };
  }
  
  if (options.maxPrice) {
    query.price = { ...query.price, $lte: options.maxPrice };
  }
  
  return this.find(query)
    .populate('shopId', 'name logo')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to search products
productSchema.statics.search = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true,
    isApproved: true
  };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.minPrice) {
    query.price = { $gte: options.minPrice };
  }
  
  if (options.maxPrice) {
    query.price = { ...query.price, $lte: options.maxPrice };
  }
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('shopId', 'name logo rating')
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({
    isActive: true,
    isApproved: true,
    isFeatured: true
  })
    .populate('shopId', 'name logo rating')
    .sort({ rating: -1, salesCount: -1 })
    .limit(limit);
};

// Static method to get trending products
productSchema.statics.getTrending = function(limit = 10) {
  return this.find({
    isActive: true,
    isApproved: true
  })
    .populate('shopId', 'name logo rating')
    .sort({ viewCount: -1, salesCount: -1 })
    .limit(limit);
};

// Static method to get low stock products
productSchema.statics.getLowStock = function(vendorId = null) {
  const query = {
    isActive: true,
    $or: [
      { stock: { $lte: '$lowStockThreshold' } },
      { 'variants.stock': { $lte: '$lowStockThreshold' } }
    ]
  };
  
  if (vendorId) {
    query.vendorId = vendorId;
  }
  
  return this.find(query)
    .populate('shopId', 'name')
    .sort({ stock: 1 });
};

module.exports = mongoose.model('Product', productSchema); 