const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Follower ID is required']
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, 'Shop ID is required']
  },
  // Follow metadata
  followedAt: {
    type: Date,
    default: Date.now
  },
  // Notification preferences
  notifications: {
    newProducts: {
      type: Boolean,
      default: true
    },
    offers: {
      type: Boolean,
      default: true
    },
    updates: {
      type: Boolean,
      default: true
    }
  },
  // Follow status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
followSchema.index({ followerId: 1, shopId: 1 }, { unique: true });
followSchema.index({ shopId: 1 });
followSchema.index({ followerId: 1 });
followSchema.index({ followedAt: -1 });
followSchema.index({ isActive: 1 });

// Pre-save middleware to update shop followers count
followSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('isActive')) {
    try {
      const Shop = mongoose.model('Shop');
      
      if (this.isActive) {
        // Increment followers count
        await Shop.findByIdAndUpdate(this.shopId, {
          $inc: { followersCount: 1 }
        });
      } else {
        // Decrement followers count
        await Shop.findByIdAndUpdate(this.shopId, {
          $inc: { followersCount: -1 }
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Pre-remove middleware to update shop followers count
followSchema.pre('remove', async function(next) {
  try {
    const Shop = mongoose.model('Shop');
    
    // Decrement followers count
    await Shop.findByIdAndUpdate(this.shopId, {
      $inc: { followersCount: -1 }
    });
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to toggle follow
followSchema.methods.toggleFollow = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Instance method to update notification preferences
followSchema.methods.updateNotifications = function(preferences) {
  this.notifications = { ...this.notifications, ...preferences };
  return this.save();
};

// Static method to check if user follows shop
followSchema.statics.isFollowing = function(followerId, shopId) {
  return this.findOne({ followerId, shopId, isActive: true });
};

// Static method to get user's followed shops
followSchema.statics.getFollowedShops = function(followerId, options = {}) {
  return this.find({ followerId, isActive: true })
    .populate('shopId', 'name description logo banner rating followersCount')
    .sort(options.sort || { followedAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to get shop followers
followSchema.statics.getShopFollowers = function(shopId, options = {}) {
  return this.find({ shopId, isActive: true })
    .populate('followerId', 'name email')
    .sort(options.sort || { followedAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to get followers count
followSchema.statics.getFollowersCount = function(shopId) {
  return this.countDocuments({ shopId, isActive: true });
};

// Static method to get following count
followSchema.statics.getFollowingCount = function(followerId) {
  return this.countDocuments({ followerId, isActive: true });
};

// Static method to get mutual followers
followSchema.statics.getMutualFollowers = function(shopId1, shopId2) {
  return this.aggregate([
    {
      $match: {
        shopId: { $in: [shopId1, shopId2] },
        isActive: true
      }
    },
    {
      $group: {
        _id: '$followerId',
        shopCount: { $sum: 1 }
      }
    },
    {
      $match: {
        shopCount: 2
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        followerId: '$_id',
        name: '$user.name',
        email: '$user.email',
        avatar: '$user.avatar'
      }
    }
  ]);
};

// Static method to get followers for notifications
followSchema.statics.getFollowersForNotification = function(shopId, notificationType) {
  const query = { shopId, isActive: true };
  
  if (notificationType === 'newProducts') {
    query['notifications.newProducts'] = true;
  } else if (notificationType === 'offers') {
    query['notifications.offers'] = true;
  } else if (notificationType === 'updates') {
    query['notifications.updates'] = true;
  }
  
  return this.find(query)
    .populate('followerId', 'name email')
    .select('followerId notifications');
};

// Static method to get trending shops (most followed)
followSchema.statics.getTrendingShops = function(limit = 10) {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$shopId',
        followersCount: { $sum: 1 },
        recentFollowers: {
          $sum: {
            $cond: [
              { $gte: ['$followedAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'shops',
        localField: '_id',
        foreignField: '_id',
        as: 'shop'
      }
    },
    {
      $unwind: '$shop'
    },
    {
      $match: {
        'shop.isActive': true
      }
    },
    {
      $project: {
        shopId: '$_id',
        name: '$shop.name',
        description: '$shop.description',
        logo: '$shop.logo',
        rating: '$shop.rating',
        followersCount: 1,
        recentFollowers: 1
      }
    },
    {
      $sort: { followersCount: -1, recentFollowers: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Static method to get follower analytics
followSchema.statics.getFollowerAnalytics = function(shopId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        shopId: shopId,
        followedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$followedAt'
          }
        },
        newFollowers: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

module.exports = mongoose.model('Follow', followSchema); 