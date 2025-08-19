const request = require('supertest');
const app = require('../../test-server');
const { createTestUser, createTestVendor, createTestShop, generateAuthToken } = require('./setup');

describe('Shop Management Integration Tests', () => {
  describe('POST /api/shops', () => {
    test('should create shop successfully for vendor', async () => {
      const vendor = await createTestVendor({ email: 'shopvendor@example.com' });
      const token = generateAuthToken(vendor);

      const shopData = {
        name: 'Fashion Paradise',
        description: 'Premium fashion store offering the latest trends',
        address: {
          street: '123 Fashion Street, Downtown',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // Mumbai coordinates
        },
        categories: ['mens-wear', 'womens-wear'],
        contact: {
          phone: '9876543210',
          email: 'contact@fashionparadise.com'
        }
      };

      const response = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send(shopData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Shop created successfully');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(shopData.name);
      expect(response.body.data.ownerId).toBe(vendor._id.toString());
      expect(response.body.data.isActive).toBe(true);
    });

    test('should reject shop creation for non-vendor', async () => {
      const customer = await createTestUser({ email: 'customer@example.com' });
      const token = generateAuthToken(customer);

      const shopData = {
        name: 'Customer Shop',
        description: 'Customer trying to create shop'
      };

      const response = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send(shopData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Only vendors can create shops');
    });

    test('should reject shop creation without authentication', async () => {
      const shopData = {
        name: 'Unauthorized Shop',
        description: 'Shop without auth'
      };

      const response = await request(app)
        .post('/api/shops')
        .send(shopData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject shop creation with invalid data', async () => {
      const vendor = await createTestVendor({ email: 'invalidvendor@example.com' });
      const token = generateAuthToken(vendor);

      const invalidShopData = {
        name: '', // Invalid: empty name
        description: 'Test description'
      };

      const response = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidShopData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should reject duplicate shop for vendor', async () => {
      const vendor = await createTestVendor({ email: 'duplicatevendor@example.com' });
      const token = generateAuthToken(vendor);

      // Create first shop
      const shopData = {
        name: 'First Shop',
        description: 'First shop description',
        address: {
          street: '123 First St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // Mumbai coordinates
        },
        categories: ['mens-wear'],
        contact: {
          phone: '9876543210',
          email: 'first@shop.com'
        }
      };

      await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send(shopData)
        .expect(201);

      // Try to create second shop
      const secondShopData = {
        name: 'Second Shop',
        description: 'Second shop description',
        address: {
          street: '456 Second St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400002'
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // Mumbai coordinates
        },
        categories: ['womens-wear'],
        contact: {
          phone: '9876543211',
          email: 'second@shop.com'
        }
      };

      const response = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send(secondShopData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already has a shop');
    });
  });

  describe('GET /api/shops', () => {
    test('should get all shops with pagination', async () => {
      // Create multiple shops
      const vendor1 = await createTestVendor({ email: 'vendor1@example.com' });
      const vendor2 = await createTestVendor({ email: 'vendor2@example.com' });

      await createTestShop({ 
        name: 'Shop 1', 
        ownerId: vendor1._id,
        categories: ['mens-wear']
      });
      await createTestShop({ 
        name: 'Shop 2', 
        ownerId: vendor2._id,
        categories: ['womens-wear']
      });

      const response = await request(app)
        .get('/api/shops')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('shops');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.shops).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
    });

    test('should filter shops by category', async () => {
      const vendor1 = await createTestVendor({ email: 'mensvendor@example.com' });
      const vendor2 = await createTestVendor({ email: 'womensvendor@example.com' });

      await createTestShop({ 
        name: 'Mens Shop', 
        ownerId: vendor1._id,
        categories: ['mens-wear']
      });
      await createTestShop({ 
        name: 'Womens Shop', 
        ownerId: vendor2._id,
        categories: ['womens-wear']
      });

      const response = await request(app)
        .get('/api/shops')
        .query({ category: 'mens-wear' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shops).toHaveLength(1);
      expect(response.body.data.shops[0].name).toBe('Mens Shop');
    });

    test('should filter shops by city', async () => {
      const vendor1 = await createTestVendor({ email: 'mumbaivendor@example.com' });
      const vendor2 = await createTestVendor({ email: 'delhivendor@example.com' });

      await createTestShop({ 
        name: 'Mumbai Shop', 
        ownerId: vendor1._id,
        address: { 
          street: '123 Mumbai St',
          city: 'Mumbai', 
          state: 'Maharashtra', 
          zipCode: '400001' 
        }
      });
      await createTestShop({ 
        name: 'Delhi Shop', 
        ownerId: vendor2._id,
        address: { 
          street: '456 Delhi St',
          city: 'Delhi', 
          state: 'Delhi', 
          zipCode: '110001' 
        }
      });

      const response = await request(app)
        .get('/api/shops')
        .query({ city: 'Mumbai' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shops).toHaveLength(1);
      expect(response.body.data.shops[0].name).toBe('Mumbai Shop');
    });

    test('should search shops by name', async () => {
      const vendor1 = await createTestVendor({ email: 'fashionvendor@example.com' });
      const vendor2 = await createTestVendor({ email: 'techvendor@example.com' });

      await createTestShop({ 
        name: 'Fashion Paradise', 
        ownerId: vendor1._id
      });
      await createTestShop({ 
        name: 'Tech Store', 
        ownerId: vendor2._id
      });

      const response = await request(app)
        .get('/api/shops')
        .query({ search: 'fashion' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shops).toHaveLength(1);
      expect(response.body.data.shops[0].name).toBe('Fashion Paradise');
    });

    test('should get nearby shops', async () => {
      const vendor1 = await createTestVendor({ email: 'nearvendor@example.com' });
      const vendor2 = await createTestVendor({ email: 'farvendor@example.com' });

      await createTestShop({ 
        name: 'Near Shop', 
        ownerId: vendor1._id,
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // Mumbai coordinates
        }
      });
      await createTestShop({ 
        name: 'Far Shop', 
        ownerId: vendor2._id,
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041] // Delhi coordinates
        }
      });

      const response = await request(app)
        .get('/api/shops/nearby')
        .query({ 
          longitude: 72.8777, 
          latitude: 19.0760, 
          maxDistance: 10000 
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shops).toHaveLength(1);
      expect(response.body.data.shops[0].name).toBe('Near Shop');
    });
  });

  describe('GET /api/shops/:id', () => {
    test('should get shop by ID with details', async () => {
      const vendor = await createTestVendor({ email: 'detailvendor@example.com' });
      const shop = await createTestShop({ 
        name: 'Detail Shop', 
        ownerId: vendor._id,
        description: 'Detailed shop description'
      });

      const response = await request(app)
        .get(`/api/shops/${shop._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe('Detail Shop');
      expect(response.body.data.description).toBe('Detailed shop description');
      expect(response.body.data).toHaveProperty('productsCount');
      expect(response.body.data).toHaveProperty('reviewsCount');
      expect(response.body.data).toHaveProperty('followersCount');
    });

    test('should return 404 for non-existent shop', async () => {
      const fakeId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/api/shops/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Shop not found');
    });

    test('should get shop with products and reviews count', async () => {
      const vendor = await createTestVendor({ email: 'countvendor@example.com' });
      const shop = await createTestShop({ 
        name: 'Count Shop', 
        ownerId: vendor._id
      });

      const response = await request(app)
        .get(`/api/shops/${shop._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('productsCount');
      expect(response.body.data).toHaveProperty('reviewsCount');
      expect(response.body.data).toHaveProperty('followersCount');
    });
  });

  describe('PUT /api/shops/:id', () => {
    test('should update shop details by owner', async () => {
      const vendor = await createTestVendor({ email: 'updatevendor@example.com' });
      const shop = await createTestShop({ 
        name: 'Update Shop', 
        ownerId: vendor._id
      });
      const token = generateAuthToken(vendor);

      const updateData = {
        name: 'Updated Shop Name',
        description: 'Updated shop description'
      };

      const response = await request(app)
        .put(`/api/shops/${shop._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Shop updated successfully');
      expect(response.body.data.name).toBe('Updated Shop Name');
      expect(response.body.data.description).toBe('Updated shop description');
    });

    test('should reject update by non-owner', async () => {
      const vendor1 = await createTestVendor({ email: 'owner@example.com' });
      const vendor2 = await createTestVendor({ email: 'nonowner@example.com' });
      const shop = await createTestShop({ 
        name: 'Owner Shop', 
        ownerId: vendor1._id
      });
      const token = generateAuthToken(vendor2);

      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/shops/${shop._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to update this shop');
    });

    test('should reject update without authentication', async () => {
      const vendor = await createTestVendor({ email: 'noauthvendor@example.com' });
      const shop = await createTestShop({ 
        name: 'No Auth Shop', 
        ownerId: vendor._id
      });

      const updateData = {
        name: 'No Auth Update'
      };

      const response = await request(app)
        .put(`/api/shops/${shop._id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/shops/:id/products', () => {
    test('should get shop products', async () => {
      const vendor = await createTestVendor({ email: 'productvendor@example.com' });
      const shop = await createTestShop({ 
        name: 'Product Shop', 
        ownerId: vendor._id
      });

      // Create products for this shop
      const Product = require('../../models/Product');
      await Product.create([
        {
          name: 'Product 1',
          description: 'First product',
          price: 999,
          category: 'clothing',
          stock: 10,
          vendorId: vendor._id,
          shopId: shop._id,
          isActive: true,
          isApproved: true
        },
        {
          name: 'Product 2',
          description: 'Second product',
          price: 1499,
          category: 'clothing',
          stock: 15,
          vendorId: vendor._id,
          shopId: shop._id,
          isActive: true,
          isApproved: true
        }
      ]);

      const response = await request(app)
        .get(`/api/shops/${shop._id}/products`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should filter shop products by category', async () => {
      const vendor = await createTestVendor({ email: 'filtervendor@example.com' });
      const shop = await createTestShop({ 
        name: 'Filter Shop', 
        ownerId: vendor._id
      });

      // Create products for this shop
      const Product = require('../../models/Product');
      await Product.create([
        {
          name: 'Mens Product',
          description: 'Mens category product',
          price: 999,
          category: 'clothing',
          stock: 10,
          vendorId: vendor._id,
          shopId: shop._id,
          isActive: true,
          isApproved: true
        },
        {
          name: 'Womens Product',
          description: 'Womens category product',
          price: 1499,
          category: 'clothing',
          stock: 15,
          vendorId: vendor._id,
          shopId: shop._id,
          isActive: true,
          isApproved: true
        }
      ]);

      const response = await request(app)
        .get(`/api/shops/${shop._id}/products`)
        .query({ category: 'clothing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.products.some(p => p.name === 'Mens Product')).toBe(true);
      expect(response.body.data.products.some(p => p.name === 'Womens Product')).toBe(true);
    });
  });

  describe('GET /api/shops/trending', () => {
    test('should get trending shops', async () => {
      const vendor1 = await createTestVendor({ email: 'trending1@example.com' });
      const vendor2 = await createTestVendor({ email: 'trending2@example.com' });
      const user1 = await createTestUser({ email: 'follower1@example.com' });
      const user2 = await createTestUser({ email: 'follower2@example.com' });
      const user3 = await createTestUser({ email: 'follower3@example.com' });

      const shop1 = await createTestShop({ 
        name: 'Trending Shop 1', 
        ownerId: vendor1._id
      });
      const shop2 = await createTestShop({ 
        name: 'Trending Shop 2', 
        ownerId: vendor2._id
      });

      // Create Follow records to make shops trending
      const Follow = require('../../models/Follow');
      await Follow.create([
        { followerId: user1._id, shopId: shop1._id },
        { followerId: user2._id, shopId: shop1._id },
        { followerId: user3._id, shopId: shop1._id },
        { followerId: user1._id, shopId: shop2._id }
      ]);

      const response = await request(app)
        .get('/api/shops/trending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shops).toHaveLength(2);
      // Should be sorted by followers count (descending)
      expect(response.body.data.shops[0].followersCount).toBeGreaterThanOrEqual(
        response.body.data.shops[1].followersCount
      );
    });
  });
}); 