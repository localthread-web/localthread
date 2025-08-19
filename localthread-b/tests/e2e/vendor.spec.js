const { test, expect } = require('@playwright/test');

test.describe('Vendor Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should register as vendor and create shop', async ({ page }) => {
    // Navigate to registration page
    await page.click('text=Sign Up');
    
    // Fill vendor registration form
    await page.fill('[data-testid="name-input"]', 'Vendor Owner');
    await page.fill('[data-testid="email-input"]', 'vendor.owner@example.com');
    await page.fill('[data-testid="phone-input"]', '9876543210');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.selectOption('[data-testid="role-select"]', 'vendor');
    await page.fill('[data-testid="store-name-input"]', 'Fashion Paradise');
    
    // Submit registration
    await page.click('[data-testid="register-button"]');
    
    // Verify redirect to vendor dashboard
    await expect(page).toHaveURL(/.*vendor-dashboard/);
    
    // Create shop
    await page.click('[data-testid="create-shop-button"]');
    
    // Fill shop details
    await page.fill('[data-testid="shop-name"]', 'Fashion Paradise');
    await page.fill('[data-testid="shop-description"]', 'Premium fashion store');
    await page.fill('[data-testid="street-address"]', '123 Fashion Street');
    await page.fill('[data-testid="city"]', 'Mumbai');
    await page.fill('[data-testid="state"]', 'Maharashtra');
    await page.fill('[data-testid="zipcode"]', '400001');
    await page.fill('[data-testid="phone"]', '9876543210');
    await page.fill('[data-testid="email"]', 'shop@fashionparadise.com');
    await page.selectOption('[data-testid="categories"]', 'mens-wear');
    
    // Submit shop creation
    await page.click('[data-testid="create-shop-submit"]');
    
    // Verify shop created
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Shop created successfully');
  });

  test('should add products to shop', async ({ page }) => {
    // Login as vendor
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to products management
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Manage Products');
    
    // Add new product
    await page.click('[data-testid="add-product-button"]');
    
    // Fill product details
    await page.fill('[data-testid="product-name"]', 'Premium T-Shirt');
    await page.fill('[data-testid="product-description"]', 'High-quality cotton t-shirt');
    await page.fill('[data-testid="product-price"]', '999');
    await page.fill('[data-testid="product-stock"]', '50');
    await page.selectOption('[data-testid="product-category"]', 'clothing');
    await page.fill('[data-testid="product-brand"]', 'Fashion Brand');
    
    // Upload product image
    await page.setInputFiles('[data-testid="product-images"]', 'tests/fixtures/product-image.jpg');
    
    // Submit product
    await page.click('[data-testid="save-product"]');
    
    // Verify product added
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Product added successfully');
    await expect(page.locator('[data-testid="product-item"]')).toContainText('Premium T-Shirt');
  });

  test('should edit product details', async ({ page }) => {
    // Login as vendor
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to products
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Manage Products');
    
    // Click on first product to edit
    await page.click('[data-testid="edit-product"]:first-child');
    
    // Update product details
    await page.fill('[data-testid="product-name"]', 'Updated Premium T-Shirt');
    await page.fill('[data-testid="product-price"]', '1299');
    await page.fill('[data-testid="product-stock"]', '75');
    
    // Save changes
    await page.click('[data-testid="save-product"]');
    
    // Verify product updated
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Product updated successfully');
    await expect(page.locator('[data-testid="product-item"]')).toContainText('Updated Premium T-Shirt');
  });

  test('should manage product inventory', async ({ page }) => {
    // Login as vendor
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to inventory
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Inventory');
    
    // Update stock for first product
    await page.fill('[data-testid="stock-input"]:first-child', '100');
    await page.click('[data-testid="update-stock"]:first-child');
    
    // Verify stock updated
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Stock updated successfully');
    
    // Check low stock alerts
    await page.click('[data-testid="low-stock-tab"]');
    await expect(page.locator('[data-testid="low-stock-item"]')).toHaveCount(2);
  });

  test('should view and manage orders', async ({ page }) => {
    // Login as vendor
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to orders
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Orders');
    
    // Verify orders list
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-item"]')).toHaveCount(3);
    
    // Click on first order
    await page.click('[data-testid="order-item"]:first-child');
    
    // Verify order details
    await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
    
    // Update order status
    await page.selectOption('[data-testid="order-status"]', 'processing');
    await page.click('[data-testid="update-status"]');
    
    // Verify status updated
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Order status updated');
  });

  test('should process order fulfillment', async ({ page }) => {
    // Login as vendor
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to orders
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Orders');
    
    // Click on pending order
    await page.click('[data-testid="order-item"]:first-child');
    
    // Process order
    await page.click('[data-testid="process-order"]');
    
    // Fill shipping details
    await page.fill('[data-testid="tracking-number"]', 'TRK123456789');
    await page.fill('[data-testid="shipping-carrier"]', 'Express Delivery');
    await page.click('[data-testid="confirm-shipping"]');
    
    // Verify order processed
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Order processed successfully');
    await expect(page.locator('[data-testid="order-status"]')).toContainText('Shipped');
  });

  test('should view shop analytics', async ({ page }) => {
    // Login as vendor
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to analytics
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Analytics');
    
    // Verify analytics dashboard
    await expect(page.locator('[data-testid="sales-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-stats"]')).toBeVisible();
    
    // Check sales metrics
    await expect(page.locator('[data-testid="total-sales"]')).toContainText('₹15,000');
    await expect(page.locator('[data-testid="total-orders"]')).toContainText('25');
    await expect(page.locator('[data-testid="average-order"]')).toContainText('₹600');
  });

  test('should manage shop settings', async ({ page }) => {
    // Login as vendor
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to shop settings
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Shop Settings');
    
    // Update shop information
    await page.fill('[data-testid="shop-description"]', 'Updated shop description');
    await page.fill('[data-testid="shop-phone"]', '9876543211');
    await page.selectOption('[data-testid="shop-categories"]', 'womens-wear');
    
    // Save changes
    await page.click('[data-testid="save-settings"]');
    
    // Verify settings updated
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Settings updated successfully');
  });

  test('should handle customer reviews', async ({ page }) => {
    // Login as vendor
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to reviews
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Reviews');
    
    // Verify reviews list
    await expect(page.locator('[data-testid="reviews-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-item"]')).toHaveCount(5);
    
    // Reply to a review
    await page.click('[data-testid="reply-review"]:first-child');
    await page.fill('[data-testid="reply-text"]', 'Thank you for your feedback!');
    await page.click('[data-testid="submit-reply"]');
    
    // Verify reply posted
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Reply posted successfully');
  });

  test('should manage shop operating hours', async ({ page }) => {
    // Login as vendor
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to shop settings
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Shop Settings');
    
    // Update operating hours
    await page.click('[data-testid="operating-hours-tab"]');
    
    // Set Monday hours
    await page.fill('[data-testid="monday-open"]', '09:00');
    await page.fill('[data-testid="monday-close"]', '18:00');
    await page.check('[data-testid="monday-open-checkbox"]');
    
    // Set Tuesday hours
    await page.fill('[data-testid="tuesday-open"]', '10:00');
    await page.fill('[data-testid="tuesday-close"]', '19:00');
    await page.check('[data-testid="tuesday-open-checkbox"]');
    
    // Save operating hours
    await page.click('[data-testid="save-hours"]');
    
    // Verify hours saved
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Operating hours updated');
  });

  test('should manage product categories and variants', async ({ page }) => {
    // Login as vendor
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to products
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Manage Products');
    
    // Add product with variants
    await page.click('[data-testid="add-product-button"]');
    
    // Fill basic product info
    await page.fill('[data-testid="product-name"]', 'Multi-Variant Shirt');
    await page.fill('[data-testid="product-description"]', 'Shirt with multiple sizes and colors');
    await page.fill('[data-testid="product-price"]', '799');
    await page.selectOption('[data-testid="product-category"]', 'clothing');
    
    // Enable variants
    await page.check('[data-testid="has-variants"]');
    
    // Add size variants
    await page.click('[data-testid="add-size-variant"]');
    await page.fill('[data-testid="variant-size"]', 'S');
    await page.fill('[data-testid="variant-stock"]', '20');
    await page.fill('[data-testid="variant-price"]', '799');
    
    await page.click('[data-testid="add-size-variant"]');
    await page.fill('[data-testid="variant-size"]:nth-child(2)', 'M');
    await page.fill('[data-testid="variant-stock"]:nth-child(2)', '25');
    await page.fill('[data-testid="variant-price"]:nth-child(2)', '799');
    
    // Add color variants
    await page.click('[data-testid="add-color-variant"]');
    await page.fill('[data-testid="variant-color"]', 'Blue');
    await page.fill('[data-testid="variant-stock"]:nth-child(3)', '15');
    
    // Save product
    await page.click('[data-testid="save-product"]');
    
    // Verify product with variants created
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Product added successfully');
    await expect(page.locator('[data-testid="variant-info"]')).toContainText('3 variants');
  });
}); 