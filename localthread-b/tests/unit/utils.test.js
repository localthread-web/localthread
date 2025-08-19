const path = require('path');
const fs = require('fs');

// Mock utility functions
const generateUniqueFilename = (originalName, fieldName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const ext = path.extname(originalName);
  return `${fieldName}-${timestamp}-${random}${ext}`;
};

const validateFileType = (file, allowedTypes) => {
  if (!file || !file.mimetype) {
    return { valid: false, message: 'No file provided' };
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, message: 'Invalid file type' };
  }
  
  return { valid: true, message: 'File type valid' };
};

const validateFileSize = (file, maxSize) => {
  if (!file || !file.size) {
    return { valid: false, message: 'No file provided' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, message: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` };
  }
  
  return { valid: true, message: 'File size valid' };
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const formatCurrency = (amount, currency = 'INR') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) {
    return '';
  }
  
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year);
};

const generateSlug = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const paginateResults = (items, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / limit);
  const hasNextPage = endIndex < items.length;
  const hasPrevPage = page > 1;
  
  return {
    items: paginatedItems,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: items.length,
      hasNextPage,
      hasPrevPage,
      limit
    }
  };
};

const createErrorResponse = (message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (details) {
    response.details = details;
  }
  
  return { response, statusCode };
};

const createSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

describe('Utility Functions', () => {
  describe('File Operations', () => {
    test('should generate unique filename', () => {
      const originalName = 'image.jpg';
      const fieldName = 'product';
      
      const filename1 = generateUniqueFilename(originalName, fieldName);
      const filename2 = generateUniqueFilename(originalName, fieldName);
      
      expect(filename1).not.toBe(filename2);
      expect(filename1).toMatch(/^product-\d{13}-\d{1,4}\.jpg$/);
      expect(filename2).toMatch(/^product-\d{13}-\d{1,4}\.jpg$/);
    });

    test('should validate file type correctly', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      
      const validFile = { mimetype: 'image/jpeg' };
      const invalidFile = { mimetype: 'text/plain' };
      const noFile = null;
      
      expect(validateFileType(validFile, allowedTypes)).toEqual({
        valid: true,
        message: 'File type valid'
      });
      
      expect(validateFileType(invalidFile, allowedTypes)).toEqual({
        valid: false,
        message: 'Invalid file type'
      });
      
      expect(validateFileType(noFile, allowedTypes)).toEqual({
        valid: false,
        message: 'No file provided'
      });
    });

    test('should validate file size correctly', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      const validFile = { size: 1024 * 1024 }; // 1MB
      const invalidFile = { size: 10 * 1024 * 1024 }; // 10MB
      const noFile = null;
      
      expect(validateFileSize(validFile, maxSize)).toEqual({
        valid: true,
        message: 'File size valid'
      });
      
      expect(validateFileSize(invalidFile, maxSize)).toEqual({
        valid: false,
        message: 'File size exceeds 5MB limit'
      });
      
      expect(validateFileSize(noFile, maxSize)).toEqual({
        valid: false,
        message: 'No file provided'
      });
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize HTML input', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toBe('scriptalert(&quot;xss&quot;)&#x2F;scriptHello World');
    });

    test('should sanitize special characters', () => {
      const input = 'Test & "quotes" and \'apostrophes\'';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toBe('Test &amp; &quot;quotes&quot; and &#x27;apostrophes&#x27;');
    });

    test('should handle non-string input', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });

    test('should trim whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toBe('Hello World');
    });
  });

  describe('Currency Formatting', () => {
    test('should format INR currency correctly', () => {
      expect(formatCurrency(1000)).toBe('₹1,000.00');
      expect(formatCurrency(1000.50)).toBe('₹1,000.50');
      expect(formatCurrency(1000000)).toBe('₹10,00,000.00');
    });

    test('should handle zero and negative amounts', () => {
      expect(formatCurrency(0)).toBe('₹0.00');
      expect(formatCurrency(-100)).toBe('-₹100.00');
    });

    test('should handle invalid amounts', () => {
      expect(formatCurrency('invalid')).toBe('₹0');
      expect(formatCurrency(NaN)).toBe('₹0');
      expect(formatCurrency(null)).toBe('₹0');
    });

    test('should format USD currency', () => {
      expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
    });
  });

  describe('Date Formatting', () => {
    test('should format date in DD/MM/YYYY format', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('15/01/2024');
    });

    test('should handle custom date format', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date, 'MM/DD/YYYY')).toBe('01/15/2024');
    });

    test('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    test('should handle single digit day and month', () => {
      const date = new Date('2024-01-05');
      expect(formatDate(date)).toBe('05/01/2024');
    });
  });

  describe('Slug Generation', () => {
    test('should generate valid slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Product Name 123')).toBe('product-name-123');
      expect(generateSlug('Special@Characters!')).toBe('specialcharacters');
    });

    test('should handle multiple spaces and special characters', () => {
      expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(generateSlug('Product_Name_With_Underscores')).toBe('product-name-with-underscores');
    });

    test('should handle edge cases', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug(null)).toBe('');
      expect(generateSlug(123)).toBe('');
    });

    test('should remove leading and trailing hyphens', () => {
      expect(generateSlug('---Hello World---')).toBe('hello-world');
    });
  });

  describe('Distance Calculation', () => {
    test('should calculate distance between two points', () => {
      // Mumbai coordinates
      const lat1 = 19.0760;
      const lon1 = 72.8777;
      
      // Delhi coordinates
      const lat2 = 28.7041;
      const lon2 = 77.1025;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      
      expect(distance).toBeGreaterThan(1000); // Should be around 1150 km
      expect(distance).toBeLessThan(1200);
    });

    test('should calculate zero distance for same point', () => {
      const lat = 19.0760;
      const lon = 72.8777;
      
      const distance = calculateDistance(lat, lon, lat, lon);
      
      expect(distance).toBe(0);
    });

    test('should handle negative coordinates', () => {
      const distance = calculateDistance(-19.0760, -72.8777, 19.0760, 72.8777);
      
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    test('should paginate results correctly', () => {
      const items = Array.from({ length: 25 }, (_, i) => `Item ${i + 1}`);
      
      const result = paginateResults(items, 2, 10);
      
      expect(result.items).toHaveLength(10);
      expect(result.items[0]).toBe('Item 11');
      expect(result.items[9]).toBe('Item 20');
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.totalItems).toBe(25);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPrevPage).toBe(true);
    });

    test('should handle first page', () => {
      const items = Array.from({ length: 15 }, (_, i) => `Item ${i + 1}`);
      
      const result = paginateResults(items, 1, 10);
      
      expect(result.items).toHaveLength(10);
      expect(result.pagination.hasPrevPage).toBe(false);
      expect(result.pagination.hasNextPage).toBe(true);
    });

    test('should handle last page', () => {
      const items = Array.from({ length: 15 }, (_, i) => `Item ${i + 1}`);
      
      const result = paginateResults(items, 2, 10);
      
      expect(result.items).toHaveLength(5);
      expect(result.pagination.hasNextPage).toBe(false);
    });

    test('should handle empty items', () => {
      const result = paginateResults([], 1, 10);
      
      expect(result.items).toHaveLength(0);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('Response Helpers', () => {
    test('should create error response', () => {
      const error = createErrorResponse('Something went wrong', 400, { field: 'email' });
      
      expect(error.response.success).toBe(false);
      expect(error.response.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(400);
      expect(error.response.details).toEqual({ field: 'email' });
      expect(error.response.timestamp).toBeDefined();
    });

    test('should create success response', () => {
      const data = { id: 1, name: 'Test' };
      const response = createSuccessResponse(data, 'Created successfully');
      
      expect(response.success).toBe(true);
      expect(response.message).toBe('Created successfully');
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeDefined();
    });

    test('should create success response with default message', () => {
      const data = { id: 1 };
      const response = createSuccessResponse(data);
      
      expect(response.message).toBe('Success');
    });
  });

  describe('String Utilities', () => {
    test('should capitalize first letter', () => {
      const capitalize = (str) => {
        if (!str || typeof str !== 'string') return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };
      
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('')).toBe('');
      expect(capitalize(null)).toBe(null);
    });

    test('should truncate text', () => {
      const truncate = (text, length = 100, suffix = '...') => {
        if (!text || text.length <= length) return text;
        return text.substring(0, length) + suffix;
      };
      
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncate(longText, 20)).toBe('This is a very long ...');
      expect(truncate('Short text', 20)).toBe('Short text');
    });

    test('should generate random string', () => {
      const generateRandomString = (length = 8) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
      
      const random1 = generateRandomString(10);
      const random2 = generateRandomString(10);
      
      expect(random1).toHaveLength(10);
      expect(random2).toHaveLength(10);
      expect(random1).not.toBe(random2);
    });
  });
}); 