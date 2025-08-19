const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer'
  },
  // Vendor-specific fields
  storeName: {
    type: String,
    trim: true,
    maxlength: [100, 'Store name cannot be more than 100 characters']
  },
  storeLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Store location cannot be more than 200 characters']
  },
  storeImage: {
    type: String,
    default: null
  },
  storeDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Store description cannot be more than 500 characters']
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Vendor verification
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
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  // Password reset fields
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Profile fields
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]+$/, 'Please enter a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  avatar: {
    type: String,
    default: null
  },
  // Customer-specific fields
  addresses: [{
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Address label cannot exceed 50 characters']
    },
    street: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Street address cannot exceed 100 characters']
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{6}$/, 'Zip code must be 6 digits']
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // Timestamps
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  
  return userObject;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for isVendor
userSchema.virtual('isVendor').get(function() {
  return this.role === 'vendor';
});

// Virtual for isCustomer
userSchema.virtual('isCustomer').get(function() {
  return this.role === 'customer';
});

// Virtual for isAdmin
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 