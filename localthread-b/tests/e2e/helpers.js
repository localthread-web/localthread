const { test, expect } = require('@playwright/test');

/**
 * Helper class for E2E test operations
 */
class E2EHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Generate test user data
   */
  generateUserData(role = 'customer') {
    const timestamp = Date.now();
    return {
      name: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: role
    };
  }

  /**
   * Register a new user
   */
  async registerUser(userData) {
    await this.page.goto('/auth');
    
    // Select role tab
    if (userData.role === 'vendor') {
      await this.page.click('text=Vendor');
    } else {
      await this.page.click('text=Customer');
    }
    
    // Switch to registration mode
    await this.page.click('text=Register');
    
    // Fill registration form using actual selectors
    await this.page.fill('input[name="name"]', userData.name);
    await this.page.fill('input[name="email"]', userData.email);
    await this.page.fill('input[name="password"]', userData.password);
    await this.page.fill('input[name="confirmPassword"]', userData.confirmPassword);
    
    // Fill additional fields for vendor
    if (userData.role === 'vendor') {
      await this.page.fill('input[name="storeName"]', `Test Store ${Date.now()}`);
      await this.page.fill('input[name="storeDescription"]', 'Test store description');
    }
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation or success message
    await this.page.waitForTimeout(2000);
  }

  /**
   * Login user
   */
  async loginUser(email, password) {
    await this.page.goto('/auth');
    
    // Select customer tab (default)
    await this.page.click('text=Customer');
    
    // Switch to login mode
    await this.page.click('text=Login');
    
    // Fill login form using actual selectors
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation
    await this.page.waitForTimeout(2000);
  }

  /**
   * Create a shop
   */
  async createShop(shopData) {
    await this.page.goto('/vendor/dashboard');
    
    // Click create shop button (assuming it exists)
    await this.page.click('text=Create Shop');
    
    // Fill shop form
    await this.page.fill('#shopName', shopData.name);
    await this.page.fill('#description', shopData.description);
    await this.page.fill('#address', shopData.address);
    await this.page.fill('#phone', shopData.phone);
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Add product to shop
   */
  async addProduct(productData) {
    await this.page.goto('/vendor/products');
    
    // Click add product button
    await this.page.click('text=Add Product');
    
    // Fill product form
    await this.page.fill('#productName', productData.name);
    await this.page.fill('#description', productData.description);
    await this.page.fill('#price', productData.price.toString());
    await this.page.fill('#stock', productData.stock.toString());
    
    // Select category
    await this.page.selectOption('#category', productData.category);
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Add product to cart
   */
  async addToCart(productId, quantity = 1) {
    await this.page.goto(`/product/${productId}`);
    
    // Set quantity if more than 1
    if (quantity > 1) {
      await this.page.fill('#quantity', quantity.toString());
    }
    
    // Click add to cart button
    await this.page.click('text=Add to Cart');
    
    await this.page.waitForTimeout(1000);
  }

  /**
   * Complete checkout process
   */
  async completeCheckout(shippingAddress) {
    await this.page.goto('/cart');
    
    // Click checkout button
    await this.page.click('text=Checkout');
    
    // Fill shipping address
    await this.page.fill('#street', shippingAddress.street);
    await this.page.fill('#city', shippingAddress.city);
    await this.page.fill('#state', shippingAddress.state);
    await this.page.fill('#zipCode', shippingAddress.zipCode);
    await this.page.fill('#phone', shippingAddress.phone);
    
    // Continue to payment
    await this.page.click('text=Continue to Payment');
    
    // Fill payment details (simplified for testing)
    await this.page.fill('#cardNumber', '4242424242424242');
    await this.page.fill('#expiryDate', '12/25');
    await this.page.fill('#cvv', '123');
    
    // Complete order
    await this.page.click('text=Place Order');
    
    await this.page.waitForTimeout(3000);
  }

  /**
   * Search for products
   */
  async searchProducts(query) {
    await this.page.fill('#searchInput', query);
    await this.page.press('#searchInput', 'Enter');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Filter products
   */
  async filterProducts(category, priceRange) {
    if (category) {
      await this.page.selectOption('#categoryFilter', category);
    }
    
    if (priceRange) {
      await this.page.fill('#minPrice', priceRange.min.toString());
      await this.page.fill('#maxPrice', priceRange.max.toString());
    }
    
    await this.page.click('text=Apply Filters');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Follow a shop
   */
  async followShop(shopId) {
    await this.page.goto(`/shop/${shopId}`);
    await this.page.click('text=Follow');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Add review to product
   */
  async addReview(productId, rating, comment) {
    await this.page.goto(`/product/${productId}`);
    await this.page.click('text=Write a Review');
    
    // Select rating
    await this.page.click(`[data-rating="${rating}"]`);
    
    // Fill comment
    await this.page.fill('#reviewComment', comment);
    
    // Submit review
    await this.page.click('text=Submit Review');
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return await this.page.isVisible(selector);
    } catch {
      return false;
    }
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}

module.exports = { E2EHelper }; 