const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock business logic functions
const calculateOrderTotal = (items, shippingFee = 0, discountAmount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + shippingFee - discountAmount;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shippingFee: Math.round(shippingFee * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

const calculateRating = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return { average: 0, count: 0 };
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = Math.round((totalRating / reviews.length) * 10) / 10;
  
  return {
    average,
    count: reviews.length
  };
};

const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

const validateStockAvailability = (product, requestedQuantity, size = null, color = null) => {
  if (product.hasVariants && size && color) {
    const variant = product.variants.find(v => v.size === size && v.color === color);
    if (!variant) {
      return { available: false, message: 'Selected variant not found' };
    }
    if (variant.stock < requestedQuantity) {
      return { available: false, message: 'Insufficient stock for selected variant' };
    }
  } else {
    if (product.stock < requestedQuantity) {
      return { available: false, message: 'Insufficient stock' };
    }
  }
  
  return { available: true, message: 'Stock available' };
};

const calculateDiscount = (originalPrice, discountPercentage) => {
  if (discountPercentage <= 0 || discountPercentage > 100) {
    return { discountAmount: 0, finalPrice: originalPrice };
  }
  
  const discountAmount = (originalPrice * discountPercentage) / 100;
  const finalPrice = originalPrice - discountAmount;
  
  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100
  };
};

const formatAddress = (address) => {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country || 'India'
  ].filter(Boolean);
  
  return parts.join(', ');
};

const isShopOpen = (operatingHours, currentTime = new Date()) => {
  if (!operatingHours || !operatingHours.length) {
    return true; // Always open if no hours specified
  }
  
  const dayOfWeek = currentTime.getDay();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  const todayHours = operatingHours.find(hours => hours.day === dayOfWeek);
  if (!todayHours || !todayHours.open) {
    return false;
  }
  
  const openTimeInMinutes = todayHours.openTime.hours * 60 + todayHours.openTime.minutes;
  const closeTimeInMinutes = todayHours.closeTime.hours * 60 + todayHours.closeTime.minutes;
  
  return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
};

describe('Business Logic Functions', () => {
  describe('Order Total Calculation', () => {
    test('should calculate order total correctly', () => {
      const items = [
        { price: 100, quantity: 2 },
        { price: 50, quantity: 1 }
      ];
      
      const result = calculateOrderTotal(items, 20, 10);
      
      expect(result.subtotal).toBe(250);
      expect(result.shippingFee).toBe(20);
      expect(result.discountAmount).toBe(10);
      expect(result.total).toBe(260);
    });

    test('should handle zero items', () => {
      const items = [];
      
      const result = calculateOrderTotal(items, 20, 10);
      
      expect(result.subtotal).toBe(0);
      expect(result.total).toBe(10); // shipping - discount
    });

    test('should handle decimal prices', () => {
      const items = [
        { price: 99.99, quantity: 1 },
        { price: 50.50, quantity: 2 }
      ];
      
      const result = calculateOrderTotal(items);
      
      expect(result.subtotal).toBe(200.99);
      expect(result.total).toBe(200.99);
    });

    test('should handle large discount', () => {
      const items = [{ price: 100, quantity: 1 }];
      
      const result = calculateOrderTotal(items, 20, 50);
      
      expect(result.total).toBe(70); // 100 + 20 - 50
    });
  });

  describe('Rating Calculation', () => {
    test('should calculate average rating correctly', () => {
      const reviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 3 },
        { rating: 5 }
      ];
      
      const result = calculateRating(reviews);
      
      expect(result.average).toBe(4.3);
      expect(result.count).toBe(4);
    });

    test('should handle empty reviews', () => {
      const reviews = [];
      
      const result = calculateRating(reviews);
      
      expect(result.average).toBe(0);
      expect(result.count).toBe(0);
    });

    test('should handle single review', () => {
      const reviews = [{ rating: 5 }];
      
      const result = calculateRating(reviews);
      
      expect(result.average).toBe(5);
      expect(result.count).toBe(1);
    });

    test('should round average to one decimal place', () => {
      const reviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 4 }
      ];
      
      const result = calculateRating(reviews);
      
      expect(result.average).toBe(4.3);
    });
  });

  describe('Order Number Generation', () => {
    test('should generate unique order numbers', () => {
      const orderNumber1 = generateOrderNumber();
      const orderNumber2 = generateOrderNumber();
      
      expect(orderNumber1).not.toBe(orderNumber2);
      expect(orderNumber1).toMatch(/^ORD-\d{13}-\d{3}$/);
      expect(orderNumber2).toMatch(/^ORD-\d{13}-\d{3}$/);
    });

    test('should include timestamp in order number', () => {
      const before = Date.now();
      const orderNumber = generateOrderNumber();
      const after = Date.now();
      
      const timestamp = parseInt(orderNumber.split('-')[1]);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('Stock Availability Validation', () => {
    test('should validate stock for simple product', () => {
      const product = {
        stock: 10,
        hasVariants: false
      };
      
      const result = validateStockAvailability(product, 5);
      
      expect(result.available).toBe(true);
      expect(result.message).toBe('Stock available');
    });

    test('should reject insufficient stock for simple product', () => {
      const product = {
        stock: 5,
        hasVariants: false
      };
      
      const result = validateStockAvailability(product, 10);
      
      expect(result.available).toBe(false);
      expect(result.message).toBe('Insufficient stock');
    });

    test('should validate stock for product with variants', () => {
      const product = {
        hasVariants: true,
        variants: [
          { size: 'M', color: 'Blue', stock: 10 },
          { size: 'L', color: 'Red', stock: 5 }
        ]
      };
      
      const result = validateStockAvailability(product, 3, 'M', 'Blue');
      
      expect(result.available).toBe(true);
      expect(result.message).toBe('Stock available');
    });

    test('should reject insufficient stock for variant', () => {
      const product = {
        hasVariants: true,
        variants: [
          { size: 'M', color: 'Blue', stock: 5 },
          { size: 'L', color: 'Red', stock: 10 }
        ]
      };
      
      const result = validateStockAvailability(product, 10, 'M', 'Blue');
      
      expect(result.available).toBe(false);
      expect(result.message).toBe('Insufficient stock for selected variant');
    });

    test('should reject non-existent variant', () => {
      const product = {
        hasVariants: true,
        variants: [
          { size: 'M', color: 'Blue', stock: 10 }
        ]
      };
      
      const result = validateStockAvailability(product, 5, 'L', 'Red');
      
      expect(result.available).toBe(false);
      expect(result.message).toBe('Selected variant not found');
    });
  });

  describe('Discount Calculation', () => {
    test('should calculate discount correctly', () => {
      const result = calculateDiscount(100, 20);
      
      expect(result.discountAmount).toBe(20);
      expect(result.finalPrice).toBe(80);
    });

    test('should handle zero discount', () => {
      const result = calculateDiscount(100, 0);
      
      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(100);
    });

    test('should handle 100% discount', () => {
      const result = calculateDiscount(100, 100);
      
      expect(result.discountAmount).toBe(100);
      expect(result.finalPrice).toBe(0);
    });

    test('should handle invalid discount percentage', () => {
      const result = calculateDiscount(100, 150);
      
      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(100);
    });

    test('should handle negative discount percentage', () => {
      const result = calculateDiscount(100, -10);
      
      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(100);
    });

    test('should round decimal results', () => {
      const result = calculateDiscount(99.99, 15.5);
      
      expect(result.discountAmount).toBe(15.5);
      expect(result.finalPrice).toBe(84.49);
    });
  });

  describe('Address Formatting', () => {
    test('should format complete address', () => {
      const address = {
        street: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      };
      
      const result = formatAddress(address);
      
      expect(result).toBe('123 Main St, Mumbai, Maharashtra, 400001, India');
    });

    test('should format address without country', () => {
      const address = {
        street: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001'
      };
      
      const result = formatAddress(address);
      
      expect(result).toBe('123 Main St, Mumbai, Maharashtra, 400001, India');
    });

    test('should handle missing fields', () => {
      const address = {
        street: '123 Main St',
        city: 'Mumbai',
        zipCode: '400001'
      };
      
      const result = formatAddress(address);
      
      expect(result).toBe('123 Main St, Mumbai, 400001, India');
    });

    test('should handle empty address', () => {
      const address = {};
      
      const result = formatAddress(address);
      
      expect(result).toBe('India');
    });
  });

  describe('Shop Operating Hours', () => {
    test('should return true when shop is open', () => {
      const operatingHours = [
        {
          day: 1, // Monday
          open: true,
          openTime: { hours: 9, minutes: 0 },
          closeTime: { hours: 18, minutes: 0 }
        }
      ];
      
      const currentTime = new Date('2024-01-01T12:00:00'); // Monday 12 PM
      currentTime.getDay = () => 1; // Mock Monday
      
      const result = isShopOpen(operatingHours, currentTime);
      
      expect(result).toBe(true);
    });

    test('should return false when shop is closed', () => {
      const operatingHours = [
        {
          day: 1, // Monday
          open: true,
          openTime: { hours: 9, minutes: 0 },
          closeTime: { hours: 18, minutes: 0 }
        }
      ];
      
      const currentTime = new Date('2024-01-01T20:00:00'); // Monday 8 PM
      currentTime.getDay = () => 1; // Mock Monday
      
      const result = isShopOpen(operatingHours, currentTime);
      
      expect(result).toBe(false);
    });

    test('should return false when shop is closed for the day', () => {
      const operatingHours = [
        {
          day: 1, // Monday
          open: false
        }
      ];
      
      const currentTime = new Date('2024-01-01T12:00:00'); // Monday 12 PM
      currentTime.getDay = () => 1; // Mock Monday
      
      const result = isShopOpen(operatingHours, currentTime);
      
      expect(result).toBe(false);
    });

    test('should return true when no operating hours specified', () => {
      const result = isShopOpen(null);
      
      expect(result).toBe(true);
    });

    test('should return true when empty operating hours', () => {
      const result = isShopOpen([]);
      
      expect(result).toBe(true);
    });
  });

  describe('Password Hashing and Comparison', () => {
    test('should hash password correctly', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    });

    test('should compare password correctly', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Operations', () => {
    test('should generate JWT token', () => {
      const payload = { userId: '123', role: 'customer' };
      const token = jwt.sign(payload, 'test-secret', { expiresIn: '1h' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    test('should verify valid JWT token', () => {
      const payload = { userId: '123', role: 'customer' };
      const token = jwt.sign(payload, 'test-secret', { expiresIn: '1h' });
      
      const decoded = jwt.verify(token, 'test-secret');
      
      expect(decoded.userId).toBe('123');
      expect(decoded.role).toBe('customer');
    });

    test('should reject invalid JWT token', () => {
      expect(() => {
        jwt.verify('invalid-token', 'test-secret');
      }).toThrow();
    });
  });
}); 