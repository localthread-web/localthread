const { body, validationResult } = require('express-validator');

// Mock validation functions
const validateUserRegistration = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  body('phone').optional().isMobilePhone('en-IN').withMessage('Please provide a valid phone number'),
  body('role').isIn(['customer', 'vendor']).withMessage('Role must be either customer or vendor')
];

const validateProductCreation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['mens-wear', 'womens-wear', 'kids-wear', 'accessories', 'footwear', 'jewelry', 'bags']).withMessage('Invalid category'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL')
];

const validateShopCreation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Shop name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('address.street').trim().isLength({ min: 5, max: 200 }).withMessage('Street address must be between 5 and 200 characters'),
  body('address.city').trim().isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters'),
  body('address.state').trim().isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters'),
  body('address.zipCode').isPostalCode('IN').withMessage('Please provide a valid Indian postal code'),
  body('categories').isArray({ min: 1 }).withMessage('At least one category is required'),
  body('categories.*').isIn(['mens-wear', 'womens-wear', 'kids-wear', 'accessories', 'footwear', 'jewelry', 'bags']).withMessage('Invalid category'),
  body('contact.phone').isMobilePhone('en-IN').withMessage('Please provide a valid phone number'),
  body('contact.email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

describe('Data Validation', () => {
  describe('User Registration Validation', () => {
    test('should validate correct user registration data', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        phone: '9876543210',
        role: 'customer'
      };

      const req = { body: validData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      // Run validation
      for (const validation of validateUserRegistration) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    test('should reject user registration with invalid email', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'customer'
      };

      const req = { body: invalidData };

      for (const validation of validateUserRegistration) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toHaveLength(1);
      expect(errors.array()[0].msg).toBe('Please provide a valid email');
    });

    test('should reject user registration with short password', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
        confirmPassword: '123',
        role: 'customer'
      };

      const req = { body: invalidData };

      for (const validation of validateUserRegistration) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Password must be at least 6 characters long');
    });

    test('should reject user registration with mismatched passwords', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
        role: 'customer'
      };

      const req = { body: invalidData };

      for (const validation of validateUserRegistration) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Password confirmation does not match password');
    });

    test('should reject user registration with invalid role', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'invalid-role'
      };

      const req = { body: invalidData };

      for (const validation of validateUserRegistration) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Role must be either customer or vendor');
    });

    test('should reject user registration with invalid phone number', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        phone: 'invalid-phone',
        role: 'customer'
      };

      const req = { body: invalidData };

      for (const validation of validateUserRegistration) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Please provide a valid phone number');
    });
  });

  describe('Product Creation Validation', () => {
    test('should validate correct product data', async () => {
      const validData = {
        name: 'Premium T-Shirt',
        description: 'High-quality cotton t-shirt with excellent comfort and durability',
        price: 999.99,
        category: 'mens-wear',
        stock: 50,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
      };

      const req = { body: validData };

      for (const validation of validateProductCreation) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    test('should reject product with invalid price', async () => {
      const invalidData = {
        name: 'Premium T-Shirt',
        description: 'High-quality cotton t-shirt',
        price: -100,
        category: 'mens-wear',
        stock: 50
      };

      const req = { body: invalidData };

      for (const validation of validateProductCreation) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Price must be a positive number');
    });

    test('should reject product with invalid category', async () => {
      const invalidData = {
        name: 'Premium T-Shirt',
        description: 'High-quality cotton t-shirt',
        price: 999,
        category: 'invalid-category',
        stock: 50
      };

      const req = { body: invalidData };

      for (const validation of validateProductCreation) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Invalid category');
    });

    test('should reject product with negative stock', async () => {
      const invalidData = {
        name: 'Premium T-Shirt',
        description: 'High-quality cotton t-shirt',
        price: 999,
        category: 'mens-wear',
        stock: -10
      };

      const req = { body: invalidData };

      for (const validation of validateProductCreation) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Stock must be a non-negative integer');
    });

    test('should reject product with invalid image URLs', async () => {
      const invalidData = {
        name: 'Premium T-Shirt',
        description: 'High-quality cotton t-shirt',
        price: 999,
        category: 'mens-wear',
        stock: 50,
        images: ['invalid-url', 'https://example.com/image2.jpg']
      };

      const req = { body: invalidData };

      for (const validation of validateProductCreation) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Each image must be a valid URL');
    });
  });

  describe('Shop Creation Validation', () => {
    test('should validate correct shop data', async () => {
      const validData = {
        name: 'Fashion Paradise',
        description: 'Premium fashion store offering the latest trends in clothing and accessories',
        address: {
          street: '123 Fashion Street, Downtown',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        },
        categories: ['mens-wear', 'womens-wear'],
        contact: {
          phone: '9876543210',
          email: 'contact@fashionparadise.com'
        }
      };

      const req = { body: validData };

      for (const validation of validateShopCreation) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    test('should reject shop with invalid postal code', async () => {
      const invalidData = {
        name: 'Fashion Paradise',
        description: 'Premium fashion store',
        address: {
          street: '123 Fashion Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: 'invalid-zip'
        },
        categories: ['mens-wear'],
        contact: {
          phone: '9876543210',
          email: 'contact@fashionparadise.com'
        }
      };

      const req = { body: invalidData };

      for (const validation of validateShopCreation) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Please provide a valid Indian postal code');
    });

    test('should reject shop with empty categories', async () => {
      const invalidData = {
        name: 'Fashion Paradise',
        description: 'Premium fashion store',
        address: {
          street: '123 Fashion Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        },
        categories: [],
        contact: {
          phone: '9876543210',
          email: 'contact@fashionparadise.com'
        }
      };

      const req = { body: invalidData };

      for (const validation of validateShopCreation) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('At least one category is required');
    });

    test('should reject shop with invalid category', async () => {
      const invalidData = {
        name: 'Fashion Paradise',
        description: 'Premium fashion store',
        address: {
          street: '123 Fashion Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        },
        categories: ['invalid-category'],
        contact: {
          phone: '9876543210',
          email: 'contact@fashionparadise.com'
        }
      };

      const req = { body: invalidData };

      for (const validation of validateShopCreation) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe('Invalid category');
    });
  });

  describe('Custom Validation Functions', () => {
    test('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com'
      ];

      validEmails.forEach(email => {
        expect(require('validator').isEmail(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(require('validator').isEmail(email)).toBe(false);
      });
    });

    test('should validate phone number format', () => {
      const validPhones = [
        '9876543210',
        '+919876543210',
        '09876543210'
      ];

      const invalidPhones = [
        '123',
        'abcdefghij',
        '987654321'
      ];

      validPhones.forEach(phone => {
        expect(require('validator').isMobilePhone(phone, 'en-IN')).toBe(true);
      });

      invalidPhones.forEach(phone => {
        expect(require('validator').isMobilePhone(phone, 'en-IN')).toBe(false);
      });
    });

    test('should validate postal code format', () => {
      const validPostalCodes = [
        '400001',
        '110001',
        '700001'
      ];

      const invalidPostalCodes = [
        '123',
        '1234567',
        'abcdef'
      ];

      validPostalCodes.forEach(code => {
        expect(require('validator').isPostalCode(code, 'IN')).toBe(true);
      });

      invalidPostalCodes.forEach(code => {
        expect(require('validator').isPostalCode(code, 'IN')).toBe(false);
      });
    });
  });
}); 