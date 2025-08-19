const { test, expect } = require('@playwright/test');

test.describe('Complete User Journey E2E Tests', () => {
  test('Complete customer journey: registration to order completion', async ({ page }) => {
    // Step 1: Customer Registration
    await page.goto('/');
    await page.click('text=Sign Up');
    
    await page.fill('[data-testid="name-input"]', 'John Customer');
    await page.fill('[data-testid="email-input"]', 'john.customer@example.com');
    await page.fill('[data-testid="phone-input"]', '9876543210');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.selectOption('[data-testid="role-select"]', 'customer');
    
    await page.click('[data-testid="register-button"]');
    
    // Verify successful registration
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('[data-testid="user-name"]')).toContainText('John Customer');
    
    // Step 2: Browse Shops
    await page.click('text=Shops');
    await expect(page.locator('[data-testid="shop-card"]')).toHaveCount(3);
    
    // Step 3: View Shop Details
    await page.click('[data-testid="shop-card"]:first-child');
    await expect(page.locator('[data-testid="shop-name"]')).toBeVisible();
    
    // Step 4: Browse Products
    await page.click('[data-testid="products-tab"]');
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(5);
    
    // Step 5: Add Products to Cart
    await page.click('[data-testid="add-to-cart"]:first-child');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    
    await page.click('[data-testid="add-to-cart"]:nth-child(2)');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('2');
    
    // Step 6: View Cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);
    
    // Step 7: Apply Coupon
    await page.fill('[data-testid="coupon-input"]', 'SAVE20');
    await page.click('[data-testid="apply-coupon"]');
    await expect(page.locator('[data-testid="discount-amount"]')).toContainText('₹100');
    
    // Step 8: Proceed to Checkout
    await page.click('[data-testid="checkout-button"]');
    
    // Step 9: Fill Shipping Address
    await page.fill('[data-testid="street-input"]', '123 Customer Street');
    await page.fill('[data-testid="city-input"]', 'Mumbai');
    await page.fill('[data-testid="state-input"]', 'Maharashtra');
    await page.fill('[data-testid="zipcode-input"]', '400001');
    await page.fill('[data-testid="phone-input"]', '9876543210');
    
    // Step 10: Select Payment Method
    await page.click('[data-testid="payment-method-cod"]');
    
    // Step 11: Place Order
    await page.click('[data-testid="place-order"]');
    
    // Step 12: Verify Order Confirmation
    await expect(page).toHaveURL(/.*order-confirmation/);
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Order placed successfully');
    
    // Step 13: View Order History
    await page.click('[data-testid="user-menu"]');
    await page.click('text=My Orders');
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-item"]')).toHaveCount(1);
  });

  test('Complete vendor journey: registration to order fulfillment', async ({ page }) => {
    // Step 1: Vendor Registration
    await page.goto('/');
    await page.click('text=Sign Up');
    
    await page.fill('[data-testid="name-input"]', 'Jane Vendor');
    await page.fill('[data-testid="email-input"]', 'jane.vendor@example.com');
    await page.fill('[data-testid="phone-input"]', '9876543211');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.selectOption('[data-testid="role-select"]', 'vendor');
    await page.fill('[data-testid="store-name-input"]', 'Jane\'s Fashion Store');
    
    await page.click('[data-testid="register-button"]');
    
    // Verify successful registration
    await expect(page).toHaveURL(/.*vendor-dashboard/);
    await expect(page.locator('[data-testid="vendor-name"]')).toContainText('Jane Vendor');
    
    // Step 2: Create Shop
    await page.click('[data-testid="create-shop-button"]');
    
    await page.fill('[data-testid="shop-name"]', 'Jane\'s Fashion Store');
    await page.fill('[data-testid="shop-description"]', 'Premium fashion store');
    await page.fill('[data-testid="street-address"]', '456 Vendor Street');
    await page.fill('[data-testid="city"]', 'Mumbai');
    await page.fill('[data-testid="state"]', 'Maharashtra');
    await page.fill('[data-testid="zipcode"]', '400002');
    await page.fill('[data-testid="phone"]', '9876543211');
    await page.fill('[data-testid="email"]', 'shop@janesfashion.com');
    await page.selectOption('[data-testid="categories"]', 'womens-wear');
    
    await page.click('[data-testid="create-shop-submit"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Shop created successfully');
    
    // Step 3: Add Products
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Manage Products');
    
    await page.click('[data-testid="add-product-button"]');
    
    await page.fill('[data-testid="product-name"]', 'Elegant Dress');
    await page.fill('[data-testid="product-description"]', 'Beautiful evening dress');
    await page.fill('[data-testid="product-price"]', '2499');
    await page.fill('[data-testid="product-stock"]', '30');
    await page.selectOption('[data-testid="product-category"]', 'clothing');
    await page.fill('[data-testid="product-brand"]', 'Jane\'s Collection');
    
    await page.setInputFiles('[data-testid="product-images"]', 'tests/fixtures/product-image.jpg');
    
    await page.click('[data-testid="save-product"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Product added successfully');
    
    // Step 4: View Orders (simulate customer order)
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Orders');
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    
    // Step 5: Process Order
    await page.click('[data-testid="order-item"]:first-child');
    await page.click('[data-testid="process-order"]');
    
    await page.fill('[data-testid="tracking-number"]', 'TRK987654321');
    await page.fill('[data-testid="shipping-carrier"]', 'Express Delivery');
    await page.click('[data-testid="confirm-shipping"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Order processed successfully');
    
    // Step 6: View Analytics
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Analytics');
    await expect(page.locator('[data-testid="sales-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-stats"]')).toBeVisible();
  });

  test('Complete shopping experience with search and filters', async ({ page }) => {
    // Step 1: Login as Customer
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Step 2: Search for Products
    await page.click('text=Products');
    await page.fill('[data-testid="search-input"]', 'shirt');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(2);
    
    // Step 3: Apply Filters
    await page.selectOption('[data-testid="category-filter"]', 'clothing');
    await page.fill('[data-testid="min-price"]', '500');
    await page.fill('[data-testid="max-price"]', '1500');
    await page.click('[data-testid="apply-filters"]');
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(1);
    
    // Step 4: View Product Details
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
    
    // Step 5: Add to Wishlist
    await page.click('[data-testid="wishlist-button"]');
    await expect(page.locator('[data-testid="wishlist-count"]')).toContainText('1');
    
    // Step 6: Add to Cart
    await page.click('[data-testid="add-to-cart-button"]');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    
    // Step 7: View Cart and Checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-button"]');
    
    // Step 8: Complete Purchase
    await page.fill('[data-testid="street-input"]', '123 Purchase Street');
    await page.fill('[data-testid="city-input"]', 'Mumbai');
    await page.fill('[data-testid="state-input"]', 'Maharashtra');
    await page.fill('[data-testid="zipcode-input"]', '400003');
    await page.fill('[data-testid="phone-input"]', '9876543212');
    
    await page.click('[data-testid="payment-method-cod"]');
    await page.click('[data-testid="place-order"]');
    
    await expect(page).toHaveURL(/.*order-confirmation/);
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });

  test('Complete shop discovery and following experience', async ({ page }) => {
    // Step 1: Browse Shops
    await page.goto('/');
    await page.click('text=Shops');
    await expect(page.locator('[data-testid="shop-card"]')).toHaveCount(3);
    
    // Step 2: Filter Shops by Category
    await page.selectOption('[data-testid="category-filter"]', 'mens-wear');
    await expect(page.locator('[data-testid="shop-card"]')).toHaveCount(1);
    
    // Step 3: Search Shops
    await page.fill('[data-testid="search-input"]', 'fashion');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="shop-card"]')).toHaveCount(1);
    
    // Step 4: View Shop Details
    await page.click('[data-testid="shop-card"]:first-child');
    await expect(page.locator('[data-testid="shop-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="shop-description"]')).toBeVisible();
    
    // Step 5: View Shop Products
    await page.click('[data-testid="products-tab"]');
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(5);
    
    // Step 6: View Shop Reviews
    await page.click('[data-testid="reviews-tab"]');
    await expect(page.locator('[data-testid="review-item"]')).toHaveCount(3);
    
    // Step 7: Follow Shop (if logged in)
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/shops');
    await page.click('[data-testid="shop-card"]:first-child');
    await page.click('[data-testid="follow-shop"]');
    await expect(page.locator('[data-testid="following-status"]')).toContainText('Following');
    
    // Step 8: View Followed Shops
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Followed Shops');
    await expect(page.locator('[data-testid="followed-shop"]')).toHaveCount(1);
  });

  test('Complete order tracking and review experience', async ({ page }) => {
    // Step 1: Login and View Orders
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.click('[data-testid="user-menu"]');
    await page.click('text=My Orders');
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    
    // Step 2: View Order Details
    await page.click('[data-testid="order-item"]:first-child');
    await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    
    // Step 3: Track Order Status
    await expect(page.locator('[data-testid="status-timeline"]')).toBeVisible();
    await expect(page.locator('[data-testid="timeline-item"]')).toHaveCount(1);
    
    // Step 4: Write Review (for delivered orders)
    await page.click('[data-testid="write-review"]:first-child');
    await page.fill('[data-testid="review-title"]', 'Great Product!');
    await page.fill('[data-testid="review-comment"]', 'Excellent quality and fast delivery');
    await page.click('[data-testid="rating-5"]');
    await page.click('[data-testid="submit-review"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Review submitted successfully');
    
    // Step 5: View My Reviews
    await page.click('[data-testid="user-menu"]');
    await page.click('text=My Reviews');
    await expect(page.locator('[data-testid="my-review"]')).toHaveCount(1);
  });

  test('Complete vendor analytics and reporting experience', async ({ page }) => {
    // Step 1: Login as Vendor
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Step 2: View Analytics Dashboard
    await page.click('[data-testid="vendor-menu"]');
    await page.click('text=Analytics');
    await expect(page.locator('[data-testid="sales-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-stats"]')).toBeVisible();
    
    // Step 3: View Sales Metrics
    await expect(page.locator('[data-testid="total-sales"]')).toContainText('₹15,000');
    await expect(page.locator('[data-testid="total-orders"]')).toContainText('25');
    await expect(page.locator('[data-testid="average-order"]')).toContainText('₹600');
    
    // Step 4: View Top Products
    await page.click('[data-testid="top-products-tab"]');
    await expect(page.locator('[data-testid="top-product"]')).toHaveCount(5);
    
    // Step 5: View Customer Insights
    await page.click('[data-testid="customers-tab"]');
    await expect(page.locator('[data-testid="customer-metrics"]')).toBeVisible();
    
    // Step 6: Generate Report
    await page.click('[data-testid="generate-report"]');
    await page.selectOption('[data-testid="report-period"]', 'month');
    await page.click('[data-testid="download-report"]');
    
    // Step 7: View Order Analytics
    await page.click('[data-testid="orders-tab"]');
    await expect(page.locator('[data-testid="order-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-metrics"]')).toBeVisible();
  });
}); 