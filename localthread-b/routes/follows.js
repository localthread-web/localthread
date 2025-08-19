const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const Shop = require('../models/Shop');
const { authenticate: auth } = require('../middleware/auth');

// @route   POST /api/follows/:shopId
// @desc    Follow a shop
// @access  Private
router.post('/:shopId', auth, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { notifications } = req.body;

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (!shop.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Shop is not active'
      });
    }

    // Check if already following
    const existingFollow = await Follow.isFollowing(req.user._id, shopId);
    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this shop'
      });
    }

    // Create follow relationship
    const follow = new Follow({
      followerId: req.user._id,
      shopId,
      notifications: notifications || {
        newProducts: true,
        offers: true,
        updates: true
      }
    });

    await follow.save();

    res.status(201).json({
      success: true,
      message: 'Successfully followed shop',
      data: {
        isFollowing: true,
        followersCount: shop.followersCount + 1
      }
    });
  } catch (error) {
    console.error('Follow shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to follow shop'
    });
  }
});

// @route   DELETE /api/follows/:shopId
// @desc    Unfollow a shop
// @access  Private
router.delete('/:shopId', auth, async (req, res) => {
  try {
    const { shopId } = req.params;

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Check if following
    const follow = await Follow.isFollowing(req.user._id, shopId);
    if (!follow) {
      return res.status(400).json({
        success: false,
        message: 'Not following this shop'
      });
    }

    // Remove follow relationship
    await follow.remove();

    res.json({
      success: true,
      message: 'Successfully unfollowed shop',
      data: {
        isFollowing: false,
        followersCount: shop.followersCount - 1
      }
    });
  } catch (error) {
    console.error('Unfollow shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow shop'
    });
  }
});

// @route   PUT /api/follows/:shopId
// @desc    Toggle follow status
// @access  Private
router.put('/:shopId', auth, async (req, res) => {
  try {
    const { shopId } = req.params;

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (!shop.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Shop is not active'
      });
    }

    // Check if following
    let follow = await Follow.isFollowing(req.user._id, shopId);
    
    if (follow) {
      // Unfollow
      await follow.remove();
      res.json({
        success: true,
        message: 'Successfully unfollowed shop',
        data: {
          isFollowing: false,
          followersCount: shop.followersCount - 1
        }
      });
    } else {
      // Follow
      follow = new Follow({
        followerId: req.user._id,
        shopId
      });
      await follow.save();
      
      res.json({
        success: true,
        message: 'Successfully followed shop',
        data: {
          isFollowing: true,
          followersCount: shop.followersCount + 1
        }
      });
    }
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle follow status'
    });
  }
});

// @route   GET /api/follows/check/:shopId
// @desc    Check if user follows a shop
// @access  Private
router.get('/check/:shopId', auth, async (req, res) => {
  try {
    const { shopId } = req.params;

    const follow = await Follow.isFollowing(req.user._id, shopId);

    res.json({
      success: true,
      data: {
        isFollowing: !!follow,
        follow: follow ? follow.getPublicProfile() : null
      }
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check follow status'
    });
  }
});

// @route   GET /api/follows/following
// @desc    Get user's followed shops
// @access  Private
router.get('/following', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'followedAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const followedShops = await Follow.getFollowedShops(req.user._id, options);
    const totalFollowing = await Follow.getFollowingCount(req.user._id);

    res.json({
      success: true,
      data: {
        followedShops,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalFollowing / parseInt(limit)),
          totalFollowing,
          hasNextPage: parseInt(page) * parseInt(limit) < totalFollowing,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get followed shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch followed shops'
    });
  }
});

// @route   GET /api/follows/shop/:shopId/followers
// @desc    Get shop followers (Shop Owner or Admin)
// @access  Private
router.get('/shop/:shopId/followers', auth, async (req, res) => {
  try {
    const { shopId } = req.params;

    // Check if shop exists
    const shop = await Shop.findById(shopId);
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
        message: 'Not authorized to view shop followers'
      });
    }

    const {
      page = 1,
      limit = 20,
      sortBy = 'followedAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const followers = await Follow.getShopFollowers(shopId, options);
    const totalFollowers = await Follow.getFollowersCount(shopId);

    res.json({
      success: true,
      data: {
        followers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalFollowers / parseInt(limit)),
          totalFollowers,
          hasNextPage: parseInt(page) * parseInt(limit) < totalFollowers,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get shop followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop followers'
    });
  }
});

// @route   PUT /api/follows/:shopId/notifications
// @desc    Update notification preferences
// @access  Private
router.put('/:shopId/notifications', auth, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { notifications } = req.body;

    if (!notifications || typeof notifications !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Notification preferences are required'
      });
    }

    // Check if following
    const follow = await Follow.isFollowing(req.user._id, shopId);
    if (!follow) {
      return res.status(400).json({
        success: false,
        message: 'Not following this shop'
      });
    }

    // Update notification preferences
    await follow.updateNotifications(notifications);

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: follow.getPublicProfile()
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
});

// @route   GET /api/follows/trending
// @desc    Get trending shops (most followed)
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trendingShops = await Follow.getTrendingShops(parseInt(limit));

    res.json({
      success: true,
      data: trendingShops
    });
  } catch (error) {
    console.error('Get trending shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending shops'
    });
  }
});

// @route   GET /api/follows/analytics/:shopId
// @desc    Get follower analytics for a shop
// @access  Private (Shop Owner or Admin)
router.get('/analytics/:shopId', auth, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { days = 30 } = req.query;

    // Check if shop exists
    const shop = await Shop.findById(shopId);
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
        message: 'Not authorized to view analytics'
      });
    }

    const followerAnalytics = await Follow.getFollowerAnalytics(shopId, parseInt(days));
    const totalFollowers = await Follow.getFollowersCount(shopId);

    res.json({
      success: true,
      data: {
        totalFollowers,
        followerAnalytics,
        shop: shop.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get follower analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch follower analytics'
    });
  }
});

// @route   GET /api/follows/mutual/:shopId1/:shopId2
// @desc    Get mutual followers between two shops
// @access  Private (Shop Owners or Admin)
router.get('/mutual/:shopId1/:shopId2', auth, async (req, res) => {
  try {
    const { shopId1, shopId2 } = req.params;

    // Check if shops exist
    const shop1 = await Shop.findById(shopId1);
    const shop2 = await Shop.findById(shopId2);

    if (!shop1 || !shop2) {
      return res.status(404).json({
        success: false,
        message: 'One or both shops not found'
      });
    }

    // Check if user owns either shop or is admin
    const isOwner1 = shop1.ownerId.toString() === req.user._id.toString();
    const isOwner2 = shop2.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner1 && !isOwner2 && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view mutual followers'
      });
    }

    const mutualFollowers = await Follow.getMutualFollowers(shopId1, shopId2);

    res.json({
      success: true,
      data: {
        mutualFollowers,
        count: mutualFollowers.length,
        shop1: shop1.getPublicProfile(),
        shop2: shop2.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get mutual followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mutual followers'
    });
  }
});

// @route   GET /api/follows/notifications/:shopId
// @desc    Get followers for specific notification type
// @access  Private (Shop Owner or Admin)
router.get('/notifications/:shopId', auth, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { type } = req.query;

    if (!type || !['newProducts', 'offers', 'updates'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid notification type is required'
      });
    }

    // Check if shop exists
    const shop = await Shop.findById(shopId);
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
        message: 'Not authorized to view notification followers'
      });
    }

    const followers = await Follow.getFollowersForNotification(shopId, type);

    res.json({
      success: true,
      data: {
        followers,
        count: followers.length,
        notificationType: type
      }
    });
  } catch (error) {
    console.error('Get notification followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification followers'
    });
  }
});

// @route   GET /api/follows/stats
// @desc    Get user's following statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const totalFollowing = await Follow.getFollowingCount(req.user._id);

    // Get recent follows (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentFollows = await Follow.countDocuments({
      followerId: req.user._id,
      followedAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalFollowing,
        recentFollows,
        followingGrowth: recentFollows
      }
    });
  } catch (error) {
    console.error('Get following stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch following statistics'
    });
  }
});

module.exports = router; 