const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
    maxlength: [100, 'Shop name cannot be more than 100 characters']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Shop owner ID is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Shop description cannot be more than 1000 characters']
  },
  // Location details
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  // Location coordinates for distance calculation
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required']
    }
  },
  // Contact information
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  // Shop categories
  categories: [{
    type: String,
    enum: ['mens-wear', 'womens-wear', 'kids-wear', 'accessories', 'footwear', 'jewelry', 'home-decor', 'other'],
    required: [true, 'At least one category is required']
  }],
  // Operational hours
  operatingHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    sunday: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '16:00' },
      isOpen: { type: Boolean, default: false }
    }
  },
  // Media
  logo: {
    type: String,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  gallery: [{
    type: String
  }],
  // Social media
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  // Shop status and verification
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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
    }
  },
  // Followers count
  followersCount: {
    type: Number,
    default: 0
  },
  // Shop features
  features: [{
    type: String,
    enum: ['home-delivery', 'pickup', 'fitting-room', 'alterations', 'gift-wrapping', 'loyalty-program']
  }],
  // Business information
  businessInfo: {
    gstNumber: String,
    panNumber: String,
    businessType: {
      type: String,
      enum: ['individual', 'partnership', 'company', 'llp'],
      default: 'individual'
    },
    establishedYear: Number
  }
}, {
  timestamps: true
});

// Indexes for better query performance
shopSchema.index({ location: '2dsphere' }); // For geospatial queries
shopSchema.index({ ownerId: 1 });
shopSchema.index({ categories: 1 });
shopSchema.index({ isActive: 1 });
shopSchema.index({ isVerified: 1 });
shopSchema.index({ 'address.city': 1 });
shopSchema.index({ name: 'text', description: 'text' }); // Text search
shopSchema.index({ rating: -1 }); // For sorting by rating
shopSchema.index({ followersCount: -1 }); // For sorting by popularity

// Instance method to get public profile
shopSchema.methods.getPublicProfile = function() {
  const shopObject = this.toObject();
  
  // Remove sensitive business information
  delete shopObject.businessInfo;
  delete shopObject.verifiedBy;
  
  return shopObject;
};

// Instance method to check if shop is open
shopSchema.methods.isOpenNow = function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleLowerCase().slice(0, 3); // mon, tue, etc.
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.operatingHours[dayOfWeek];
  if (!todayHours || !todayHours.isOpen) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Static method to find shops by location
shopSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Static method to find shops by category
shopSchema.statics.findByCategory = function(category) {
  return this.find({
    categories: category,
    isActive: true
  });
};

// Virtual for full address
shopSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Ensure virtual fields are serialized
shopSchema.set('toJSON', { virtuals: true });
shopSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Shop', shopSchema); 