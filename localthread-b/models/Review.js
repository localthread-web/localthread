const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, 'Shop ID is required']
  },
  // Rating details
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  // Review content
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  // Review metadata
  isVerified: {
    type: Boolean,
    default: false
  },
  isHelpful: {
    type: Number,
    default: 0
  },
  helpfulVotes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isHelpful: {
      type: Boolean,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Moderation
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  moderationReason: {
    type: String,
    trim: true
  },
  // Review images
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Please provide valid image URLs'
    }
  }],
  // Review tags
  tags: [{
    type: String,
    enum: ['quality', 'fit', 'delivery', 'service', 'value', 'design', 'comfort', 'durability'],
    trim: true
  }],
  // Purchase verification
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ shopId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isVerifiedPurchase: 1 });
reviewSchema.index({ productId: 1, status: 1 }); // Compound index for product reviews
reviewSchema.index({ shopId: 1, status: 1 }); // Compound index for shop reviews

// Ensure one review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Pre-save middleware to update product rating
reviewSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('rating') || this.isModified('status')) {
    try {
      const Product = mongoose.model('Product');
      const Shop = mongoose.model('Shop');
      
      // Update product rating
      await this.updateProductRating();
      
      // Update shop rating
      await this.updateShopRating();
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Instance method to update product rating
reviewSchema.methods.updateProductRating = async function() {
  const Product = mongoose.model('Product');
  
  const stats = await mongoose.model('Review').aggregate([
    { $match: { productId: this.productId, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.productId, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].totalReviews
    });
  }
};

// Instance method to update shop rating
reviewSchema.methods.updateShopRating = async function() {
  const Shop = mongoose.model('Shop');
  
  const stats = await mongoose.model('Review').aggregate([
    { $match: { shopId: this.shopId, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Shop.findByIdAndUpdate(this.shopId, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].totalReviews
    });
  }
};

// Instance method to mark as helpful
reviewSchema.methods.markHelpful = function(userId, isHelpful) {
  // Remove existing vote by this user
  this.helpfulVotes = this.helpfulVotes.filter(vote => 
    vote.userId.toString() !== userId.toString()
  );
  
  // Add new vote
  this.helpfulVotes.push({
    userId,
    isHelpful,
    votedAt: new Date()
  });
  
  // Recalculate helpful count
  this.isHelpful = this.helpfulVotes.filter(vote => vote.isHelpful).length;
  
  return this.save();
};

// Instance method to get public profile
reviewSchema.methods.getPublicProfile = function() {
  const reviewObject = this.toObject();
  
  // Remove sensitive information
  delete reviewObject.moderatedBy;
  delete reviewObject.moderationReason;
  delete reviewObject.orderId;
  
  return reviewObject;
};

// Static method to find reviews by product
reviewSchema.statics.findByProduct = function(productId, options = {}) {
  const query = { productId, status: 'approved' };
  
  if (options.rating) {
    query.rating = options.rating;
  }
  
  if (options.verifiedOnly) {
    query.isVerifiedPurchase = true;
  }
  
  return this.find(query)
    .populate('userId', 'name avatar')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

// Static method to find reviews by shop
reviewSchema.statics.findByShop = function(shopId, options = {}) {
  const query = { shopId, status: 'approved' };
  
  if (options.rating) {
    query.rating = options.rating;
  }
  
  return this.find(query)
    .populate('userId', 'name avatar')
    .populate('productId', 'name images')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

// Static method to get review statistics
reviewSchema.statics.getStats = function(productId) {
  return this.aggregate([
    { $match: { productId, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $project: {
        averageRating: { $round: ['$averageRating', 1] },
        totalReviews: 1,
        ratingDistribution: {
          '1': { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } },
          '2': { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
          '3': { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
          '4': { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
          '5': { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } }
        }
      }
    }
  ]);
};

// Virtual for review summary
reviewSchema.virtual('summary').get(function() {
  if (this.comment.length > 100) {
    return this.comment.substring(0, 100) + '...';
  }
  return this.comment;
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema); 