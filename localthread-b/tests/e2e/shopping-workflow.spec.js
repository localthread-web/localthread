const { test, expect } = require('@playwright/test');
const { E2EHelper } = require('./helpers');

test.describe('Shopping Workflow E2E Tests', () => {
  let helper;

  test.beforeEach(async ({ page }) => {
    helper = new E2EHelper(page);
  });

  test('complete shopping journey - browse, add to cart, checkout', async ({ page }) => {
    // Register and login as customer
    const customerData = helper.generateUserData('customer');
    await helper.registerUser(customerData);
    await helper.loginUser(customerData.email, customerData.password);

    // Browse shops
    await page.goto('/shops');
    await expect(page.locator('[data-testid="shop-list"]')).toBeVisible();

    // Search for a specific shop
    await page.fill('[data-testid="shop-search-input"]', 'Fashion');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="shop-results"]')).toBeVisible();

    // Click on first shop
    await page.click('[data-testid="shop-card"]:first-child');
    await expect(page).toHaveURL(/\/shop\/\w+/);

    // Browse products in shop
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();

    // Click on first product
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page).toHaveURL(/\/product\/\w+/);

    // Add product to cart
    await page.fill('[data-testid="quantity-input"]', '2');
    await page.click('[data-testid="add-to-cart-button"]');
    await expect(page.locator('[data-testid="added-to-cart-success"]')).toBeVisible();

    // View cart
    await page.click('[data-testid="view-cart-button"]');
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.locator('[data-testid="cart-items"]')).toBeVisible();

    // Verify cart contents
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="cart-total"]')).toContainText('₹');

    // Apply coupon
    await page.fill('[data-testid="coupon-input"]', 'SAVE20');
    await page.click('[data-testid="apply-coupon-button"]');
    await expect(page.locator('[data-testid="coupon-applied-success"]')).toBeVisible();

    // Proceed to checkout
    await page.click('[data-testid="proceed-to-checkout-button"]');
    await expect(page).toHaveURL(/\/checkout/);

    // Fill shipping address
    const shippingAddress = {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '123456'
    };

    await page.fill('[data-testid="shipping-street-input"]', shippingAddress.street);
    await page.fill('[data-testid="shipping-city-input"]', shippingAddress.city);
    await page.fill('[data-testid="shipping-state-input"]', shippingAddress.state);
    await page.fill('[data-testid="shipping-zipcode-input"]', shippingAddress.zipCode);

    // Fill payment details
    await page.fill('[data-testid="card-number-input"]', '4111111111111111');
    await page.fill('[data-testid="card-expiry-input"]', '12/25');
    await page.fill('[data-testid="card-cvv-input"]', '123');
    await page.fill('[data-testid="card-name-input"]', customerData.name);

    // Place order
    await page.click('[data-testid="place-order-button"]');

    // Verify order confirmation
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    await expect(page).toHaveURL(/\/order\/\w+/);

    // Verify order details
    await expect(page.locator('[data-testid="order-status"]')).toContainText('Pending');
    await expect(page.locator('[data-testid="order-total"]')).toContainText('₹');
  });

  test('should handle cart operations - add, update, remove items', async ({ page }) => {
    // Register and login
    const customerData = helper.generateUserData('customer');
    await helper.registerUser(customerData);
    await helper.loginUser(customerData.email, customerData.password);

    // Add first product to cart
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart-button"]');
    await expect(page.locator('[data-testid="added-to-cart-success"]')).toBeVisible();

    // Add second product to cart
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:nth-child(2)');
    await page.click('[data-testid="add-to-cart-button"]');
    await expect(page.locator('[data-testid="added-to-cart-success"]')).toBeVisible();

    // View cart
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);

    // Update quantity of first item
    await page.locator('[data-testid="cart-item"]:first-child [data-testid="quantity-input"]').fill('3');
    await page.locator('[data-testid="cart-item"]:first-child [data-testid="update-quantity-button"]').click();
    await expect(page.locator('[data-testid="quantity-updated-success"]')).toBeVisible();

    // Remove second item
    await page.locator('[data-testid="cart-item"]:nth-child(2) [data-testid="remove-item-button"]').click();
    await expect(page.locator('[data-testid="item-removed-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

    // Clear cart
    await page.click('[data-testid="clear-cart-button"]');
    await expect(page.locator('[data-testid="cart-cleared-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
  });

  test('should handle shop browsing and filtering', async ({ page }) => {
    // Browse shops
    await page.goto('/shops');
    await expect(page.locator('[data-testid="shop-list"]')).toBeVisible();

    // Filter by category
    await page.selectOption('[data-testid="category-filter-select"]', 'mens-wear');
    await expect(page.locator('[data-testid="shop-results"]')).toBeVisible();

    // Filter by city
    await page.fill('[data-testid="city-filter-input"]', 'Mumbai');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="shop-results"]')).toBeVisible();

    // Sort by rating
    await page.selectOption('[data-testid="sort-select"]', 'rating');
    await expect(page.locator('[data-testid="shop-results"]')).toBeVisible();

    // Search by name
    await page.fill('[data-testid="search-input"]', 'Fashion');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="shop-results"]')).toBeVisible();

    // Clear filters
    await page.click('[data-testid="clear-filters-button"]');
    await expect(page.locator('[data-testid="shop-list"]')).toBeVisible();
  });

  test('should handle product browsing and search', async ({ page }) => {
    // Browse products
    await page.goto('/products');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();

    // Filter by category
    await page.selectOption('[data-testid="category-filter-select"]', 'clothing');
    await expect(page.locator('[data-testid="product-results"]')).toBeVisible();

    // Filter by price range
    await page.fill('[data-testid="min-price-input"]', '500');
    await page.fill('[data-testid="max-price-input"]', '2000');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="product-results"]')).toBeVisible();

    // Search products
    await page.fill('[data-testid="search-input"]', 'shirt');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="product-results"]')).toBeVisible();

    // Sort by price
    await page.selectOption('[data-testid="sort-select"]', 'price-asc');
    await expect(page.locator('[data-testid="product-results"]')).toBeVisible();
  });

  test('should handle product details and reviews', async ({ page }) => {
    // Register and login
    const customerData = helper.generateUserData('customer');
    await helper.registerUser(customerData);
    await helper.loginUser(customerData.email, customerData.password);

    // View product details
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();

    // View product images
    await page.click('[data-testid="product-image"]:first-child');
    await expect(page.locator('[data-testid="image-modal"]')).toBeVisible();
    await page.click('[data-testid="close-modal-button"]');

    // View product reviews
    await page.click('[data-testid="reviews-tab"]');
    await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible();

    // Write a review
    await page.click('[data-testid="write-review-button"]');
    await page.fill('[data-testid="review-title-input"]', 'Great Product!');
    await page.fill('[data-testid="review-comment-input"]', 'This is an excellent product. Highly recommended!');
    await page.selectOption('[data-testid="review-rating-select"]', '5');
    await page.click('[data-testid="submit-review-button"]');
    await expect(page.locator('[data-testid="review-submitted-success"]')).toBeVisible();

    // Add to wishlist
    await page.click('[data-testid="add-to-wishlist-button"]');
    await expect(page.locator('[data-testid="added-to-wishlist-success"]')).toBeVisible();
  });

  test('should handle shop following and notifications', async ({ page }) => {
    // Register and login
    const customerData = helper.generateUserData('customer');
    await helper.registerUser(customerData);
    await helper.loginUser(customerData.email, customerData.password);

    // Browse shops
    await page.goto('/shops');
    await page.click('[data-testid="shop-card"]:first-child');

    // Follow shop
    await page.click('[data-testid="follow-shop-button"]');
    await expect(page.locator('[data-testid="followed-success"]')).toBeVisible();

    // Check following status
    await expect(page.locator('[data-testid="following-status"]')).toContainText('Following');

    // Unfollow shop
    await page.click('[data-testid="unfollow-shop-button"]');
    await expect(page.locator('[data-testid="unfollowed-success"]')).toBeVisible();

    // View followed shops
    await page.goto('/profile/following');
    await expect(page.locator('[data-testid="followed-shops-list"]')).toBeVisible();
  });

  test('should handle order tracking and history', async ({ page }) => {
    // Register and login
    const customerData = helper.generateUserData('customer');
    await helper.registerUser(customerData);
    await helper.loginUser(customerData.email, customerData.password);

    // Place an order (simplified)
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart-button"]');
    await page.goto('/cart');
    await page.click('[data-testid="proceed-to-checkout-button"]');
    
    // Fill minimal checkout info
    await page.fill('[data-testid="shipping-street-input"]', '123 Test St');
    await page.fill('[data-testid="shipping-city-input"]', 'Test City');
    await page.fill('[data-testid="shipping-state-input"]', 'Test State');
    await page.fill('[data-testid="shipping-zipcode-input"]', '123456');
    await page.fill('[data-testid="card-number-input"]', '4111111111111111');
    await page.fill('[data-testid="card-expiry-input"]', '12/25');
    await page.fill('[data-testid="card-cvv-input"]', '123');
    await page.fill('[data-testid="card-name-input"]', customerData.name);
    await page.click('[data-testid="place-order-button"]');

    // Get order number
    const orderNumber = await page.locator('[data-testid="order-number"]').textContent();

    // View order history
    await page.goto('/orders');
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    await expect(page.locator(`[data-testid="order-${orderNumber}"]`)).toBeVisible();

    // Track order
    await page.click(`[data-testid="track-order-${orderNumber}"]`);
    await expect(page.locator('[data-testid="order-tracking"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toContainText('Pending');
  });
}); 