const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Mock the User model before importing auth middleware
jest.mock('../../models/User', () => ({
  findById: jest.fn()
}));

const { authenticate, authorize, requireCustomer, requireVendor, requireAdmin } = require('../../middleware/auth');
const User = require('../../models/User');

// Mock User model
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  role: 'customer',
  isActive: true,
  password: bcrypt.hashSync('password123', 10)
};

// User model is now mocked via jest.mock above

// Mock request and response objects
const createMockRequest = (headers = {}) => ({
  headers: {
    authorization: 'Bearer valid-token',
    ...headers
  },
  user: null
});

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockClear();
  });

  describe('authenticate middleware', () => {
    test('should authenticate user with valid token', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      // Mock JWT verify
      const decodedToken = { userId: mockUser._id };
      jest.spyOn(jwt, 'verify').mockReturnValue(decodedToken);

      // Mock User.findById with select method
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(User.findById().select).toHaveBeenCalledWith('-password');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('should reject request without authorization header', async () => {
      const req = createMockRequest({ authorization: undefined });
      const res = createMockResponse();
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token format', async () => {
      const req = createMockRequest({ authorization: 'InvalidToken' });
      const res = createMockResponse();
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid JWT token', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw jwtError;
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with expired token', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw expiredError;
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired. Please login again.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request when user not found', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      const decodedToken = { userId: mockUser._id };
      jest.spyOn(jwt, 'verify').mockReturnValue(decodedToken);
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token is not valid. User not found.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request for deactivated user', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      const deactivatedUser = { ...mockUser, isActive: false };
      const decodedToken = { userId: mockUser._id };
      jest.spyOn(jwt, 'verify').mockReturnValue(decodedToken);
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(deactivatedUser)
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    test('should authorize user with correct role', () => {
      const req = { user: { role: 'customer' } };
      const res = createMockResponse();
      const next = jest.fn();

      const customerAuth = authorize('customer');
      customerAuth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should authorize user with multiple roles', () => {
      const req = { user: { role: 'vendor' } };
      const res = createMockResponse();
      const next = jest.fn();

      const vendorOrAdminAuth = authorize('vendor', 'admin');
      vendorOrAdminAuth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should reject user without authentication', () => {
      const req = { user: null };
      const res = createMockResponse();
      const next = jest.fn();

      const customerAuth = authorize('customer');
      customerAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject user with incorrect role', () => {
      const req = { user: { role: 'customer' } };
      const res = createMockResponse();
      const next = jest.fn();

      const adminAuth = authorize('admin');
      adminAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. customer role is not authorized to access this resource.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Role-specific middleware', () => {
    test('requireCustomer should allow customer access', () => {
      const req = { user: { role: 'customer' } };
      const res = createMockResponse();
      const next = jest.fn();

      requireCustomer(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('requireVendor should allow vendor access', () => {
      const req = { user: { role: 'vendor' } };
      const res = createMockResponse();
      const next = jest.fn();

      requireVendor(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('requireAdmin should allow admin access', () => {
      const req = { user: { role: 'admin' } };
      const res = createMockResponse();
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('requireCustomer should reject vendor access', () => {
      const req = { user: { role: 'vendor' } };
      const res = createMockResponse();
      const next = jest.fn();

      requireCustomer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 