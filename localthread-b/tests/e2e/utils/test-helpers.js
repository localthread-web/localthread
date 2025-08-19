const { test, expect } = require('@playwright/test');

/**
 * Test helper utilities for E2E tests
 */
class TestHelpers {
  /**
   * Login as a specific user type
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} userType - 'customer' or 'vendor'
   * @param {string} email - User email
   * @param {string} password - User password
   */
  static async login(page, userType = 'customer', email = null, password = null) {
    const defaultCredentials = {
      customer: { email: 'customer@example.com', password: 'password123' },
      vendor: { email: 'vendor@example.com', password: 'password123' }
    };

    const credentials = email && password 
      ? { email, password }
      : defaultCredentials[userType];

    await page.goto('/');
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', credentials.email);
    await page.fill('[data-testid="password-input"]', credentials.password);
    await page.click('[data-testid="login-button"]');

    // Wait for successful login
    if (userType === 'customer') {
      await expect(page).toHaveURL(/.*dashboard/);
    } else {
      await expect(page).toHaveURL(/.*vendor-dashboard/);
    }
  }

  /**
   * Register a new user
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} userData - User registration data
   */
  static async registerUser(page, userData) {
    await page.goto('/');
    await page.click('text=Sign Up');
    
    await page.fill('[data-testid="name-input"]', userData.name);
    await page.fill('[data-testid="email-input"]', userData.email);
    await page.fill('[data-testid="phone-input"]', userData.phone);
    await page.fill('[data-testid="password-input"]', userData.password);
    await page.fill('[data-testid="confirm-password-input"]', userData.password);
    await page.selectOption('[data-testid="role-select"]', userData.role);
    
    if (userData.role === 'vendor' && userData.storeName) {
      await page.fill('[data-testid="store-name-input"]', userData.storeName);
    }
    
    await page.click('[data-testid="register-button"]');
    
    // Wait for successful registration
    if (userData.role === 'customer') {
      await expect(page).toHaveURL(/.*dashboard/);
    } else {
      await expect(page).toHaveURL(/.*vendor-dashboard/);
    }
  }

  /**
   * Create a shop for vendor
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} shopData - Shop creation data
   */
  static async createShop(page, shopData) {
    await page.click('[data-testid="create-shop-button"]');
    
    await page.fill('[data-testid="shop-name"]', shopData.name);
    await page.fill('[data-testid="shop-description"]', shopData.description);
    await page.fill('[data-testid="street-address"]', shopData.street);
    await page.fill('[data-testid="city"]', shopData.city);
    await page.fill('[data-testid="state"]', shopData.state);
    await page.fill('[data-testid="zipcode"]', shopData.zipcode);
    await page.fill('[data-testid="phone"]', shopData.phone);
    await page.fill('[data-testid="email"]', shopData.email);
    await page.selectOption('[data-testid="categories"]', shopData.category);
    
    await page.click('[data-testid="create-shop-submit"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Shop created successfully');
  }

  /**
   * Add a product to shop
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} productData - Product data
   */
  static async addProduct(page, productData) {
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Manage Products');
    await page.click('[data-testid="add-product-button"]');
    
    await page.fill('[data-testid="product-name"]', productData.name);
    await page.fill('[data-testid="product-description"]', productData.description);
    await page.fill('[data-testid="product-price"]', productData.price.toString());
    await page.fill('[data-testid="product-stock"]', productData.stock.toString());
    await page.selectOption('[data-testid="product-category"]', productData.category);
    
    if (productData.brand) {
      await page.fill('[data-testid="product-brand"]', productData.brand);
    }
    
    if (productData.imagePath) {
      await page.setInputFiles('[data-testid="product-images"]', productData.imagePath);
    }
    
    await page.click('[data-testid="save-product"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Product added successfully');
  }

  /**
   * Add products to cart
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {number} count - Number of products to add
   */
  static async addProductsToCart(page, count = 1) {
    await page.click('text=Products');
    
    for (let i = 0; i < count; i++) {
      await page.click(`[data-testid="add-to-cart"]:nth-child(${i + 1})`);
      await page.waitForTimeout(500); // Wait for cart update
    }
    
    await expect(page.locator('[data-testid="cart-count"]')).toContainText(count.toString());
  }

  /**
   * Complete checkout process
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} addressData - Shipping address data
   */
  static async completeCheckout(page, addressData) {
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-button"]');
    
    await page.fill('[data-testid="street-input"]', addressData.street);
    await page.fill('[data-testid="city-input"]', addressData.city);
    await page.fill('[data-testid="state-input"]', addressData.state);
    await page.fill('[data-testid="zipcode-input"]', addressData.zipcode);
    await page.fill('[data-testid="phone-input"]', addressData.phone);
    
    await page.click('[data-testid="payment-method-cod"]');
    await page.click('[data-testid="place-order"]');
    
    await expect(page).toHaveURL(/.*order-confirmation/);
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  }

  /**
   * Apply coupon to cart
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} couponCode - Coupon code to apply
   */
  static async applyCoupon(page, couponCode) {
    await page.click('[data-testid="cart-icon"]');
    await page.fill('[data-testid="coupon-input"]', couponCode);
    await page.click('[data-testid="apply-coupon"]');
    await expect(page.locator('[data-testid="discount-amount"]')).not.toContainText('₹0');
  }

  /**
   * Search for products
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} searchTerm - Search term
   */
  static async searchProducts(page, searchTerm) {
    await page.click('text=Products');
    await page.fill('[data-testid="search-input"]', searchTerm);
    await page.click('[data-testid="search-button"]');
  }

  /**
   * Filter products
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} filters - Filter options
   */
  static async filterProducts(page, filters) {
    if (filters.category) {
      await page.selectOption('[data-testid="category-filter"]', filters.category);
    }
    
    if (filters.minPrice) {
      await page.fill('[data-testid="min-price"]', filters.minPrice.toString());
    }
    
    if (filters.maxPrice) {
      await page.fill('[data-testid="max-price"]', filters.maxPrice.toString());
    }
    
    await page.click('[data-testid="apply-filters"]');
  }

  /**
   * Wait for page load and verify element
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} selector - Element selector
   * @param {string} expectedText - Expected text content
   */
  static async waitAndVerify(page, selector, expectedText) {
    await page.waitForSelector(selector);
    await expect(page.locator(selector)).toContainText(expectedText);
  }

  /**
   * Generate random email
   * @returns {string} Random email
   */
  static generateRandomEmail() {
    const timestamp = Date.now();
    return `test.user.${timestamp}@example.com`;
  }

  /**
   * Generate random phone number
   * @returns {string} Random phone number
   */
  static generateRandomPhone() {
    const timestamp = Date.now().toString().slice(-6);
    return `98765${timestamp}`;
  }

  /**
   * Create test data for user registration
   * @param {string} role - User role
   * @returns {Object} User data
   */
  static createTestUserData(role = 'customer') {
    const timestamp = Date.now();
    const baseData = {
      name: `Test User ${timestamp}`,
      email: this.generateRandomEmail(),
      phone: this.generateRandomPhone(),
      password: 'Password123!'
    };

    if (role === 'vendor') {
      return {
        ...baseData,
        role: 'vendor',
        storeName: `Test Store ${timestamp}`
      };
    }

    return {
      ...baseData,
      role: 'customer'
    };
  }

  /**
   * Create test data for shop creation
   * @returns {Object} Shop data
   */
  static createTestShopData() {
    const timestamp = Date.now();
    return {
      name: `Test Shop ${timestamp}`,
      description: 'Test shop description',
      street: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipcode: '400001',
      phone: this.generateRandomPhone(),
      email: this.generateRandomEmail(),
      category: 'mens-wear'
    };
  }

  /**
   * Create test data for product creation
   * @returns {Object} Product data
   */
  static createTestProductData() {
    const timestamp = Date.now();
    return {
      name: `Test Product ${timestamp}`,
      description: 'Test product description',
      price: 999,
      stock: 50,
      category: 'clothing',
      brand: 'Test Brand'
    };
  }
}

module.exports = TestHelpers; 