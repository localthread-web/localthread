const { test, expect } = require('@playwright/test');

test.describe('Shopping Experience E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should browse shops and view products', async ({ page }) => {
    // Navigate to shops page
    await page.click('text=Shops');
    
    // Verify shops are displayed
    await expect(page.locator('[data-testid="shop-card"]')).toHaveCount(3);
    
    // Click on first shop
    await page.click('[data-testid="shop-card"]:first-child');
    
    // Verify shop details page
    await expect(page.locator('[data-testid="shop-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="shop-description"]')).toBeVisible();
    
    // Navigate to products tab
    await page.click('[data-testid="products-tab"]');
    
    // Verify products are displayed
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(5);
  });

  test('should search and filter products', async ({ page }) => {
    // Navigate to products page
    await page.click('text=Products');
    
    // Search for a specific product
    await page.fill('[data-testid="search-input"]', 'shirt');
    await page.click('[data-testid="search-button"]');
    
    // Verify search results
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(2);
    
    // Filter by category
    await page.selectOption('[data-testid="category-filter"]', 'clothing');
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(2);
    
    // Filter by price range
    await page.fill('[data-testid="min-price"]', '500');
    await page.fill('[data-testid="max-price"]', '1500');
    await page.click('[data-testid="apply-filters"]');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(1);
  });

  test('should add products to cart', async ({ page }) => {
    // Login as customer first
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to products
    await page.click('text=Products');
    
    // Add first product to cart
    await page.click('[data-testid="add-to-cart"]:first-child');
    
    // Verify cart notification
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    
    // Add second product to cart
    await page.click('[data-testid="add-to-cart"]:nth-child(2)');
    
    // Verify cart count updated
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('2');
  });

  test('should manage shopping cart', async ({ page }) => {
    // Login as customer
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Add products to cart
    await page.click('text=Products');
    await page.click('[data-testid="add-to-cart"]:first-child');
    await page.click('[data-testid="add-to-cart"]:nth-child(2)');
    
    // Navigate to cart
    await page.click('[data-testid="cart-icon"]');
    
    // Verify cart items
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);
    
    // Update quantity of first item
    await page.fill('[data-testid="quantity-input"]:first-child', '3');
    await page.click('[data-testid="update-quantity"]:first-child');
    
    // Verify total updated
    await expect(page.locator('[data-testid="cart-total"]')).toContainText('₹2,997');
    
    // Remove second item
    await page.click('[data-testid="remove-item"]:nth-child(2)');
    
    // Verify item removed
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test('should apply and remove coupons', async ({ page }) => {
    // Login as customer
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Add product to cart
    await page.click('text=Products');
    await page.click('[data-testid="add-to-cart"]:first-child');
    
    // Navigate to cart
    await page.click('[data-testid="cart-icon"]');
    
    // Apply coupon
    await page.fill('[data-testid="coupon-input"]', 'SAVE20');
    await page.click('[data-testid="apply-coupon"]');
    
    // Verify coupon applied
    await expect(page.locator('[data-testid="discount-amount"]')).toContainText('₹100');
    await expect(page.locator('[data-testid="final-total"]')).toContainText('₹899');
    
    // Remove coupon
    await page.click('[data-testid="remove-coupon"]');
    
    // Verify coupon removed
    await expect(page.locator('[data-testid="discount-amount"]')).toContainText('₹0');
  });

  test('should complete checkout process', async ({ page }) => {
    // Login as customer
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Add product to cart
    await page.click('text=Products');
    await page.click('[data-testid="add-to-cart"]:first-child');
    
    // Navigate to cart and checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-button"]');
    
    // Fill shipping address
    await page.fill('[data-testid="street-input"]', '123 Main Street');
    await page.fill('[data-testid="city-input"]', 'Mumbai');
    await page.fill('[data-testid="state-input"]', 'Maharashtra');
    await page.fill('[data-testid="zipcode-input"]', '400001');
    await page.fill('[data-testid="phone-input"]', '9876543210');
    
    // Select payment method
    await page.click('[data-testid="payment-method-cod"]');
    
    // Review order
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address"]')).toBeVisible();
    
    // Place order
    await page.click('[data-testid="place-order"]');
    
    // Verify order confirmation
    await expect(page).toHaveURL(/.*order-confirmation/);
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Order placed successfully');
  });

  test('should view order history', async ({ page }) => {
    // Login as customer
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to orders
    await page.click('[data-testid="user-menu"]');
    await page.click('text=My Orders');
    
    // Verify orders page
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    
    // Click on first order
    await page.click('[data-testid="order-item"]:first-child');
    
    // Verify order details
    await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
  });

  test('should track order status', async ({ page }) => {
    // Login as customer
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to orders
    await page.click('[data-testid="user-menu"]');
    await page.click('text=My Orders');
    
    // Click on first order
    await page.click('[data-testid="order-item"]:first-child');
    
    // Verify order status
    await expect(page.locator('[data-testid="order-status"]')).toContainText('Pending');
    
    // Check status timeline
    await expect(page.locator('[data-testid="status-timeline"]')).toBeVisible();
    await expect(page.locator('[data-testid="timeline-item"]')).toHaveCount(1);
  });

  test('should add products to wishlist', async ({ page }) => {
    // Login as customer
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to products
    await page.click('text=Products');
    
    // Add product to wishlist
    await page.click('[data-testid="wishlist-button"]:first-child');
    
    // Verify wishlist notification
    await expect(page.locator('[data-testid="wishlist-count"]')).toContainText('1');
    
    // Navigate to wishlist
    await page.click('[data-testid="wishlist-icon"]');
    
    // Verify wishlist items
    await expect(page.locator('[data-testid="wishlist-item"]')).toHaveCount(1);
    
    // Remove from wishlist
    await page.click('[data-testid="remove-wishlist"]');
    
    // Verify item removed
    await expect(page.locator('[data-testid="wishlist-item"]')).toHaveCount(0);
  });

  test('should filter shops by location', async ({ page }) => {
    // Navigate to shops page
    await page.click('text=Shops');
    
    // Use location filter
    await page.fill('[data-testid="location-input"]', 'Mumbai');
    await page.click('[data-testid="find-nearby"]');
    
    // Verify nearby shops
    await expect(page.locator('[data-testid="shop-card"]')).toHaveCount(2);
    
    // Check distance information
    await expect(page.locator('[data-testid="distance-info"]')).toBeVisible();
  });

  test('should view shop reviews and ratings', async ({ page }) => {
    // Navigate to shops
    await page.click('text=Shops');
    
    // Click on first shop
    await page.click('[data-testid="shop-card"]:first-child');
    
    // Navigate to reviews tab
    await page.click('[data-testid="reviews-tab"]');
    
    // Verify reviews are displayed
    await expect(page.locator('[data-testid="review-item"]')).toHaveCount(3);
    
    // Check rating display
    await expect(page.locator('[data-testid="shop-rating"]')).toBeVisible();
    await expect(page.locator('[data-testid="rating-stars"]')).toBeVisible();
  });
}); 