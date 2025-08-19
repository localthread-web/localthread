const request = require('supertest');
const app = require('../../test-server');
const { createTestUser, createTestVendor, generateAuthToken } = require('./setup');

describe('Authentication Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new customer successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        phone: '9876543210',
        address: '123 Main St, City',
        role: 'customer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should register a new vendor successfully', async () => {
      const vendorData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        phone: '9876543211',
        address: '456 Business Ave, City',
        storeName: 'Jane\'s Fashion Store',
        storeDescription: 'Premium fashion items',
        role: 'vendor'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(vendorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(vendorData.email);
      expect(response.body.data.user.role).toBe('vendor');
      expect(response.body.data.user.isVerified).toBe(false); // Vendors need verification
    });

    test('should reject registration with existing email', async () => {
      // Create a user first
      await createTestUser({ email: 'existing@example.com' });

      const userData = {
        name: 'Another User',
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'customer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should reject registration with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'customer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should reject registration with mismatched passwords', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
        role: 'customer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(error => error.msg.includes('Password confirmation does not match'))).toBe(true);
    });

    test('should reject registration with weak password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123',
        role: 'customer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login customer successfully', async () => {
      const user = await createTestUser({
        email: 'customer@example.com',
        password: 'password123'
      });

      const loginData = {
        email: 'customer@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should login vendor successfully', async () => {
      const vendor = await createTestVendor({
        email: 'vendor@example.com',
        password: 'password123'
      });

      const loginData = {
        email: 'vendor@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.role).toBe('vendor');
    });

    test('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should reject login with wrong password', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: 'password123'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should reject login for deactivated account', async () => {
      const user = await createTestUser({
        email: 'deactivated@example.com',
        password: 'password123',
        isActive: false
      });

      const loginData = {
        email: 'deactivated@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account is deactivated. Please contact support.');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should send password reset email for existing user', async () => {
      await createTestUser({ email: 'reset@example.com' });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('If an account with that email exists, a password reset link has been sent.');
    });

    test('should handle non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('If an account with that email exists, a password reset link has been sent.');
    });

    test('should reject request without email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('should reset password with valid token', async () => {
      const user = await createTestUser({ email: 'reset@example.com' });
      
      // Create a valid reset token
      const resetToken = 'valid-reset-token';
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
      await user.save();
      
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password reset successful');
    });

    test('should reject reset with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'newpassword123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    test('should reject reset with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-token',
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/auth/me', () => {
    test('should get user profile with valid token', async () => {
      const user = await createTestUser({ email: 'profile@example.com' });
      const token = generateAuthToken(user);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // Note: Profile update and change password endpoints are not implemented in the current API
  // These tests are commented out until the endpoints are implemented
  /*
  describe('PUT /api/auth/profile', () => {
    test('should update user profile with valid token', async () => {
      const user = await createTestUser({ email: 'update@example.com' });
      const token = generateAuthToken(user);

      const updateData = {
        name: 'Updated Name',
        phone: '9876543210',
        address: 'Updated Address'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.phone).toBe(updateData.phone);
    });

    test('should reject update without token', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    test('should change password with valid current password', async () => {
      const user = await createTestUser({ 
        email: 'changepass@example.com',
        password: 'oldpassword'
      });
      const token = generateAuthToken(user);

      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');
    });

    test('should reject change with wrong current password', async () => {
      const user = await createTestUser({ 
        email: 'wrongpass@example.com',
        password: 'oldpassword'
      });
      const token = generateAuthToken(user);

      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Current password is incorrect');
    });
  });
  */
}); 