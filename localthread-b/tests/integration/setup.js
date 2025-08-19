const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup test database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Disconnect from existing connection if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Test data helpers
const createTestUser = async (userData = {}) => {
  const User = require('../../models/User');
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'customer',
    phone: '9876543210',
    address: '123 Test St, Test City',
    isActive: true,
    ...userData
  };
  
  return await User.create(defaultUser);
};

const createTestVendor = async (vendorData = {}) => {
  const User = require('../../models/User');
  const defaultVendor = {
    name: 'Test Vendor',
    email: 'vendor@example.com',
    password: 'password123',
    role: 'vendor',
    phone: '9876543211',
    address: '456 Vendor St, Vendor City',
    storeName: 'Test Store',
    storeDescription: 'Test store description',
    isActive: true,
    isApproved: true,
    ...vendorData
  };
  
  return await User.create(defaultVendor);
};

const createTestShop = async (shopData = {}) => {
  const Shop = require('../../models/Shop');
  const defaultShop = {
    name: 'Test Shop',
    description: 'Test shop description',
    ownerId: shopData.ownerId || '507f1f77bcf86cd799439011',
    address: {
      street: '123 Shop St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '123456'
    },
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Mumbai coordinates
    },
    categories: ['mens-wear'],
    contact: {
      phone: '9876543210',
      email: 'shop@example.com'
    },
    isActive: true,
    isVerified: true,
    ...shopData
  };
  
  return await Shop.create(defaultShop);
};

const createTestProduct = async (productData = {}) => {
  const Product = require('../../models/Product');
  const defaultProduct = {
    name: 'Test Product',
    description: 'Test product description',
    price: 999,
    category: 'clothing',
    stock: 50,
    vendorId: productData.vendorId || '507f1f77bcf86cd799439011',
    shopId: productData.shopId || '507f1f77bcf86cd799439012',
    images: ['https://example.com/image1.jpg'],
    isActive: true,
    isApproved: true,
    ...productData
  };
  
  return await Product.create(defaultProduct);
};

const createTestOrder = async (orderData = {}) => {
  const Order = require('../../models/Order');
  const defaultOrder = {
    customerId: orderData.customerId || '507f1f77bcf86cd799439011',
    items: [
      {
        productId: orderData.productId || '507f1f77bcf86cd799439013',
        quantity: 2,
        price: 999,
        name: 'Test Product',
        image: 'https://example.com/image1.jpg'
      }
    ],
    total: 1998,
    status: 'pending',
    shippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '123456'
    },
    ...orderData
  };
  
  return await Order.create(defaultOrder);
};

const generateAuthToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

module.exports = {
  createTestUser,
  createTestVendor,
  createTestShop,
  createTestProduct,
  createTestOrder,
  generateAuthToken
}; 