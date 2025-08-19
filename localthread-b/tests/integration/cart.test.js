const request = require('supertest');
const app = require('../../test-server');
const { createTestUser, createTestVendor, createTestShop, createTestProduct, generateAuthToken } = require('./setup');

describe('Shopping Cart Integration Tests', () => {
  describe('GET /api/cart', () => {
    test('should get user cart with items', async () => {
      const user = await createTestUser({ email: 'cartuser@example.com' });
      const token = generateAuthToken(user);

      // Create cart with items
      const Cart = require('../../models/Cart');
      const vendor = await createTestVendor({ email: 'cartvendor@example.com' });
      const cart = await Cart.create({
        userId: user._id,
        items: [
          {
            productId: '507f1f77bcf86cd799439013',
            vendorId: vendor._id,
            quantity: 2,
            price: 999,
            name: 'Test Product',
            image: 'https://example.com/image1.jpg'
          }
        ],
        totalItems: 2,
        subtotal: 1998
      });

      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.totalItems).toBe(2);
      expect(response.body.data.subtotal).toBe(1998);
    });

    test('should return empty cart for new user', async () => {
      const user = await createTestUser({ email: 'newuser@example.com' });
      const token = generateAuthToken(user);

      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.totalItems).toBe(0);
      expect(response.body.data.subtotal).toBe(0);
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/cart')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/cart/add', () => {
    test('should add item to cart successfully', async () => {
      const user = await createTestUser({ email: 'adduser@example.com' });
      const vendor = await createTestVendor({ email: 'addvendor@example.com' });
      const shop = await createTestShop({ ownerId: vendor._id });
      const product = await createTestProduct({ 
        vendorId: vendor._id, 
        shopId: shop._id,
        stock: 10
      });
      const token = generateAuthToken(user);

      const cartItem = {
        productId: product._id,
        quantity: 2,
        size: 'M',
        color: 'Blue'
      };

      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send(cartItem)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Item added to cart successfully');
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].productId).toBe(product._id.toString());
      expect(response.body.data.items[0].quantity).toBe(2);
    });

    test('should update quantity if item already exists', async () => {
      const user = await createTestUser({ email: 'updateuser@example.com' });
      const vendor = await createTestVendor({ email: 'updatevendor@example.com' });
      const shop = await createTestShop({ ownerId: vendor._id });
      const product = await createTestProduct({ 
        vendorId: vendor._id, 
        shopId: shop._id,
        stock: 10
      });
      const token = generateAuthToken(user);

      // Add item first time
      const cartItem = {
        productId: product._id,
        quantity: 1
      };

      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send(cartItem)
        .expect(200);

      // Add same item again
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send(cartItem)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items[0].quantity).toBe(2);
    });

    test('should reject adding item with insufficient stock', async () => {
      const user = await createTestUser({ email: 'stockuser@example.com' });
      const vendor = await createTestVendor({ email: 'stockvendor@example.com' });
      const shop = await createTestShop({ ownerId: vendor._id });
      const product = await createTestProduct({ 
        vendorId: vendor._id, 
        shopId: shop._id,
        stock: 1
      });
      const token = generateAuthToken(user);

      const cartItem = {
        productId: product._id,
        quantity: 5 // More than available stock
      };

      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send(cartItem)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient stock');
    });

    test('should reject adding non-existent product', async () => {
      const user = await createTestUser({ email: 'nonexistentuser@example.com' });
      const token = generateAuthToken(user);

      const cartItem = {
        productId: '507f1f77bcf86cd799439999', // Non-existent product ID
        quantity: 1
      };

      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send(cartItem)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });

    test('should reject adding inactive product', async () => {
      const user = await createTestUser({ email: 'inactiveuser@example.com' });
      const vendor = await createTestVendor({ email: 'inactivevendor@example.com' });
      const shop = await createTestShop({ ownerId: vendor._id });
      const product = await createTestProduct({ 
        vendorId: vendor._id, 
        shopId: shop._id,
        isActive: false
      });
      const token = generateAuthToken(user);

      const cartItem = {
        productId: product._id,
        quantity: 1
      };

      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send(cartItem)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not available');
    });
  });

  describe('PUT /api/cart/update/:itemId', () => {
    test('should update cart item quantity', async () => {
      const user = await createTestUser({ email: 'updatequantityuser@example.com' });
      const token = generateAuthToken(user);

      // Create cart with item
      const Cart = require('../../models/Cart');
      const Product = require('../../models/Product');
      const Shop = require('../../models/Shop');
      const vendor = await createTestVendor({ email: 'updatevendor@example.com' });
      
      // Create a shop first
      const shop = await Shop.create({
        name: 'Test Shop for Update',
        ownerId: vendor._id,
        description: 'Test shop description',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '123456'
        },
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Delhi coordinates
        },
        contact: {
          phone: '1234567890',
          email: 'test@example.com'
        },
        categories: ['mens-wear'],
        isActive: true,
        isVerified: true
      });
      
      // Create a real product first
      const product = await Product.create({
        name: 'Test Product for Update',
        description: 'Test product description',
        price: 999,
        category: 'clothing',
        vendorId: vendor._id,
        shopId: shop._id,
        stock: 10,
        isActive: true,
        isApproved: true
      });
      
      const cart = await Cart.create({
        userId: user._id,
        items: [
          {
            productId: product._id,
            vendorId: vendor._id,
            quantity: 1,
            price: 999
          }
        ],
        totalItems: 1,
        subtotal: 999
      });

      const itemId = cart.items[0]._id;

      const updateData = {
        quantity: 3
      };

      const response = await request(app)
        .put(`/api/cart/update/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cart item updated successfully');
      expect(response.body.data.items[0].quantity).toBe(3);
      expect(response.body.data.totalItems).toBe(3);
    });

    test('should reject update for non-existent item', async () => {
      const user = await createTestUser({ email: 'nonexistentitemuser@example.com' });
      const token = generateAuthToken(user);

      const fakeItemId = '507f1f77bcf86cd799439999';
      const updateData = {
        quantity: 3
      };

      const response = await request(app)
        .put(`/api/cart/update/${fakeItemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cart item not found');
    });

    test('should reject update with invalid quantity', async () => {
      const user = await createTestUser({ email: 'invalidquantityuser@example.com' });
      const token = generateAuthToken(user);

      // Create cart with item
      const Cart = require('../../models/Cart');
      const Product = require('../../models/Product');
      const Shop = require('../../models/Shop');
      const vendor = await createTestVendor({ email: 'invalidquantityvendor@example.com' });
      
      // Create a shop first
      const shop = await Shop.create({
        name: 'Test Shop for Invalid Quantity',
        ownerId: vendor._id,
        description: 'Test shop description',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '123456'
        },
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Delhi coordinates
        },
        contact: {
          phone: '1234567890',
          email: 'test@example.com'
        },
        categories: ['mens-wear'],
        isActive: true,
        isVerified: true
      });
      
      // Create a real product first
      const product = await Product.create({
        name: 'Test Product for Invalid Quantity',
        description: 'Test product description',
        price: 999,
        category: 'clothing',
        vendorId: vendor._id,
        shopId: shop._id,
        stock: 10,
        isActive: true,
        isApproved: true
      });
      
      const cart = await Cart.create({
        userId: user._id,
        items: [
          {
            productId: product._id,
            vendorId: vendor._id,
            quantity: 1,
            price: 999
          }
        ],
        totalItems: 1,
        subtotal: 999
      });

      const itemId = cart.items[0]._id;

      const updateData = {
        quantity: 0 // Invalid quantity
      };

      const response = await request(app)
        .put(`/api/cart/update/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Quantity must be at least 1');
    });
  });

  describe('DELETE /api/cart/remove/:itemId', () => {
    test('should remove item from cart', async () => {
      const user = await createTestUser({ email: 'removeuser@example.com' });
      const token = generateAuthToken(user);

      // Create cart with item
      const Cart = require('../../models/Cart');
      const vendor = await createTestVendor({ email: 'removevendor@example.com' });
      const cart = await Cart.create({
        userId: user._id,
        items: [
          {
            productId: '507f1f77bcf86cd799439013',
            vendorId: vendor._id,
            quantity: 2,
            price: 999,
            name: 'Test Product',
            image: 'https://example.com/image1.jpg'
          }
        ],
        totalItems: 2,
        subtotal: 1998
      });

      const itemId = cart.items[0]._id;

      const response = await request(app)
        .delete(`/api/cart/remove/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Item removed from cart successfully');
      expect(response.body.data.cart.items).toHaveLength(0);
      expect(response.body.data.cart.totalItems).toBe(0);
      expect(response.body.data.cart.subtotal).toBe(0);
    });

    test('should reject removal of non-existent item', async () => {
      const user = await createTestUser({ email: 'removenonexistentuser@example.com' });
      const token = generateAuthToken(user);

      const fakeItemId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .delete(`/api/cart/remove/${fakeItemId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cart item not found');
    });
  });

  describe('POST /api/cart/clear', () => {
    test('should clear all items from cart', async () => {
      const user = await createTestUser({ email: 'clearuser@example.com' });
      const token = generateAuthToken(user);

      // Create cart with items
      const Cart = require('../../models/Cart');
      const vendor = await createTestVendor({ email: 'clearvendor@example.com' });
      await Cart.create({
        userId: user._id,
        items: [
          {
            productId: '507f1f77bcf86cd799439013',
            vendorId: vendor._id,
            quantity: 2,
            price: 999,
            name: 'Test Product 1',
            image: 'https://example.com/image1.jpg'
          },
          {
            productId: '507f1f77bcf86cd799439014',
            vendorId: vendor._id,
            quantity: 1,
            price: 1499,
            name: 'Test Product 2',
            image: 'https://example.com/image2.jpg'
          }
        ],
        totalItems: 3,
        subtotal: 3497
      });

      const response = await request(app)
        .post('/api/cart/clear')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cart cleared successfully');
      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.totalItems).toBe(0);
      expect(response.body.data.subtotal).toBe(0);
    });
  });

  describe('POST /api/cart/apply-coupon', () => {
    test('should apply valid coupon to cart', async () => {
      const user = await createTestUser({ email: 'couponuser@example.com' });
      const token = generateAuthToken(user);

      // Create cart with items
      const Cart = require('../../models/Cart');
      const vendor = await createTestVendor({ email: 'couponvendor@example.com' });
      await Cart.create({
        userId: user._id,
        items: [
          {
            productId: '507f1f77bcf86cd799439013',
            vendorId: vendor._id,
            quantity: 2,
            price: 999,
            name: 'Test Product',
            image: 'https://example.com/image1.jpg'
          }
        ],
        totalItems: 2,
        subtotal: 1998
      });

      const couponData = {
        code: 'SAVE20'
      };

      const response = await request(app)
        .post('/api/cart/apply-coupon')
        .set('Authorization', `Bearer ${token}`)
        .send(couponData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Coupon applied successfully');
      expect(response.body.data.summary).toHaveProperty('discountAmount');
      expect(response.body.data.summary).toHaveProperty('total');
    });

    test('should reject invalid coupon', async () => {
      const user = await createTestUser({ email: 'invalidcouponuser@example.com' });
      const token = generateAuthToken(user);

      const couponData = {
        code: 'INVALID'
      };

      const response = await request(app)
        .post('/api/cart/apply-coupon')
        .set('Authorization', `Bearer ${token}`)
        .send(couponData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired coupon');
    });
  });

  describe('POST /api/cart/remove-coupon', () => {
    test('should remove applied coupon from cart', async () => {
      const user = await createTestUser({ email: 'removecouponuser@example.com' });
      const token = generateAuthToken(user);

      // Create cart with applied coupon
      const Cart = require('../../models/Cart');
      const vendor = await createTestVendor({ email: 'removecouponvendor@example.com' });
      await Cart.create({
        userId: user._id,
        items: [
          {
            productId: '507f1f77bcf86cd799439013',
            vendorId: vendor._id,
            quantity: 2,
            price: 999,
            name: 'Test Product',
            image: 'https://example.com/image1.jpg'
          }
        ],
        totalItems: 2,
        subtotal: 1998,
        appliedCoupons: [{
          code: 'SAVE20',
          discountAmount: 399.6,
          discountType: 'percentage',
          appliedAt: new Date()
        }],
        discountAmount: 399.6
      });

      const response = await request(app)
        .post('/api/cart/remove-coupon')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'SAVE20' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Coupon removed successfully');
      expect(response.body.data.summary.discountAmount).toBe(0);
      expect(response.body.data.summary.appliedCoupons).toHaveLength(0);
    });
  });

  describe('GET /api/cart/summary', () => {
    test('should get cart summary', async () => {
      const user = await createTestUser({ email: 'summaryuser@example.com' });
      const token = generateAuthToken(user);

      // Create cart with items
      const Cart = require('../../models/Cart');
      const vendor = await createTestVendor({ email: 'summaryvendor@example.com' });
      await Cart.create({
        userId: user._id,
        items: [
          {
            productId: '507f1f77bcf86cd799439013',
            vendorId: vendor._id,
            quantity: 2,
            price: 999,
            name: 'Test Product',
            image: 'https://example.com/image1.jpg'
          }
        ],
        totalItems: 2,
        subtotal: 1998,
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '123456'
        }
      });

      const response = await request(app)
        .get('/api/cart/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('subtotal');
      expect(response.body.data).toHaveProperty('shippingFee');
      expect(response.body.data).toHaveProperty('discountAmount');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('totalItems');
      expect(response.body.data).toHaveProperty('shippingAddress');
    });
  });
}); 