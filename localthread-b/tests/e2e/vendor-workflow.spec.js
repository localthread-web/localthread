const { test, expect } = require('@playwright/test');
const { E2EHelper } = require('./helpers');

test.describe('Vendor Workflow E2E Tests', () => {
  let helper;

  test.beforeEach(async ({ page }) => {
    helper = new E2EHelper(page);
  });

  test('complete vendor onboarding - register, create shop, add products', async ({ page }) => {
    // Register as vendor
    const vendorData = helper.generateUserData('vendor');
    await helper.registerUser(vendorData);
    await helper.loginUser(vendorData.email, vendorData.password);

    // Should be redirected to vendor onboarding
    await expect(page).toHaveURL(/\/vendor\/onboarding/);

    // Create shop
    const shopData = {
      name: 'Fashion Paradise',
      description: 'Premium fashion store offering trendy clothing and accessories',
      address: {
        street: '123 Fashion Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001'
      },
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.0760]
      },
      contact: {
        phone: '9876543210',
        email: 'contact@fashionparadise.com'
      },
      categories: ['mens-wear', 'womens-wear']
    };

    await page.fill('[data-testid="shop-name-input"]', shopData.name);
    await page.fill('[data-testid="shop-description-input"]', shopData.description);
    await page.fill('[data-testid="shop-street-input"]', shopData.address.street);
    await page.fill('[data-testid="shop-city-input"]', shopData.address.city);
    await page.fill('[data-testid="shop-state-input"]', shopData.address.state);
    await page.fill('[data-testid="shop-zipcode-input"]', shopData.address.zipCode);
    await page.fill('[data-testid="shop-phone-input"]', shopData.contact.phone);
    await page.fill('[data-testid="shop-email-input"]', shopData.contact.email);

    // Select categories
    await page.check('[data-testid="category-mens-wear"]');
    await page.check('[data-testid="category-womens-wear"]');

    // Submit shop creation
    await page.click('[data-testid="create-shop-submit"]');
    await expect(page.locator('[data-testid="shop-created-success"]')).toBeVisible();

    // Should be redirected to vendor dashboard
    await expect(page).toHaveURL(/\/vendor\/dashboard/);

    // Add first product
    await page.click('[data-testid="add-product-button"]');
    
    const productData = {
      name: 'Premium Cotton T-Shirt',
      description: 'High-quality cotton t-shirt with modern design',
      price: 999,
      stock: 50,
      category: 'clothing'
    };

    await page.fill('[data-testid="product-name-input"]', productData.name);
    await page.fill('[data-testid="product-description-input"]', productData.description);
    await page.fill('[data-testid="product-price-input"]', productData.price.toString());
    await page.fill('[data-testid="product-stock-input"]', productData.stock.toString());
    await page.selectOption('[data-testid="product-category-select"]', productData.category);

    // Upload product image
    await page.setInputFiles('[data-testid="product-image-input"]', 'tests/e2e/fixtures/product-image.jpg');

    await page.click('[data-testid="add-product-submit"]');
    await expect(page.locator('[data-testid="product-added-success"]')).toBeVisible();

    // Verify product in inventory
    await page.goto('/vendor/products');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator(`[data-testid="product-${productData.name}"]`)).toBeVisible();
  });

  test('should manage product inventory', async ({ page }) => {
    // Register and login as vendor
    const vendorData = helper.generateUserData('vendor');
    await helper.registerUser(vendorData);
    await helper.loginUser(vendorData.email, vendorData.password);

    // Create shop first
    const shopData = {
      name: 'Test Shop',
      description: 'Test shop description',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '123456'
      },
      contact: {
        phone: '9876543210',
        email: 'test@shop.com'
      },
      categories: ['mens-wear']
    };

    await helper.createShop(shopData);

    // Add multiple products
    const products = [
      {
        name: 'Product 1',
        description: 'First product',
        price: 500,
        stock: 25,
        category: 'clothing'
      },
      {
        name: 'Product 2',
        description: 'Second product',
        price: 750,
        stock: 30,
        category: 'clothing'
      }
    ];

    for (const product of products) {
      await helper.addProduct(product);
    }

    // View inventory
    await page.goto('/vendor/products');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-item"]')).toHaveCount(2);

    // Edit first product
    await page.click('[data-testid="edit-product-Product 1"]');
    await page.fill('[data-testid="product-price-input"]', '600');
    await page.fill('[data-testid="product-stock-input"]', '30');
    await page.click('[data-testid="update-product-button"]');
    await expect(page.locator('[data-testid="product-updated-success"]')).toBeVisible();

    // Deactivate product
    await page.click('[data-testid="deactivate-product-Product 2"]');
    await expect(page.locator('[data-testid="product-deactivated-success"]')).toBeVisible();

    // Filter products by status
    await page.selectOption('[data-testid="status-filter-select"]', 'active');
    await expect(page.locator('[data-testid="product-item"]')).toHaveCount(1);

    // Search products
    await page.fill('[data-testid="product-search-input"]', 'Product 1');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="product-item"]')).toHaveCount(1);
  });

  test('should handle order management', async ({ page }) => {
    // Register and login as vendor
    const vendorData = helper.generateUserData('vendor');
    await helper.registerUser(vendorData);
    await helper.loginUser(vendorData.email, vendorData.password);

    // Create shop and add product
    const shopData = {
      name: 'Order Test Shop',
      description: 'Shop for testing orders',
      address: {
        street: '123 Order St',
        city: 'Order City',
        state: 'Order State',
        zipCode: '123456'
      },
      contact: {
        phone: '9876543210',
        email: 'order@shop.com'
      },
      categories: ['mens-wear']
    };

    await helper.createShop(shopData);

    const productData = {
      name: 'Test Product for Orders',
      description: 'Product for testing order management',
      price: 1000,
      stock: 10,
      category: 'clothing'
    };

    await helper.addProduct(productData);

    // View orders
    await page.goto('/vendor/orders');
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();

    // Filter orders by status
    await page.selectOption('[data-testid="order-status-filter"]', 'pending');
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();

    // View order details (if any orders exist)
    const orderItems = await page.locator('[data-testid="order-item"]').count();
    if (orderItems > 0) {
      await page.click('[data-testid="view-order-details"]:first-child');
      await expect(page.locator('[data-testid="order-details"]')).toBeVisible();

      // Update order status
      await page.selectOption('[data-testid="order-status-select"]', 'processing');
      await page.click('[data-testid="update-order-status"]');
      await expect(page.locator('[data-testid="status-updated-success"]')).toBeVisible();
    }
  });

  test('should manage shop profile and settings', async ({ page }) => {
    // Register and login as vendor
    const vendorData = helper.generateUserData('vendor');
    await helper.registerUser(vendorData);
    await helper.loginUser(vendorData.email, vendorData.password);

    // Create shop
    const shopData = {
      name: 'Profile Test Shop',
      description: 'Shop for testing profile management',
      address: {
        street: '123 Profile St',
        city: 'Profile City',
        state: 'Profile State',
        zipCode: '123456'
      },
      contact: {
        phone: '9876543210',
        email: 'profile@shop.com'
      },
      categories: ['mens-wear']
    };

    await helper.createShop(shopData);

    // Edit shop profile
    await page.goto('/vendor/shop/profile');
    await expect(page.locator('[data-testid="shop-profile-form"]')).toBeVisible();

    // Update shop information
    await page.fill('[data-testid="shop-description-input"]', 'Updated shop description');
    await page.fill('[data-testid="shop-phone-input"]', '9876543211');
    await page.fill('[data-testid="shop-email-input"]', 'updated@shop.com');

    // Update operating hours
    await page.click('[data-testid="monday-open-time"]');
    await page.selectOption('[data-testid="monday-open-time"]', '08:00');
    await page.selectOption('[data-testid="monday-close-time"]', '20:00');

    // Save changes
    await page.click('[data-testid="save-shop-profile"]');
    await expect(page.locator('[data-testid="profile-updated-success"]')).toBeVisible();

    // Upload shop logo
    await page.setInputFiles('[data-testid="shop-logo-input"]', 'tests/e2e/fixtures/shop-logo.png');
    await page.click('[data-testid="upload-logo-button"]');
    await expect(page.locator('[data-testid="logo-uploaded-success"]')).toBeVisible();

    // Upload shop banner
    await page.setInputFiles('[data-testid="shop-banner-input"]', 'tests/e2e/fixtures/shop-banner.jpg');
    await page.click('[data-testid="upload-banner-button"]');
    await expect(page.locator('[data-testid="banner-uploaded-success"]')).toBeVisible();
  });

  test('should handle analytics and reporting', async ({ page }) => {
    // Register and login as vendor
    const vendorData = helper.generateUserData('vendor');
    await helper.registerUser(vendorData);
    await helper.loginUser(vendorData.email, vendorData.password);

    // Create shop
    const shopData = {
      name: 'Analytics Test Shop',
      description: 'Shop for testing analytics',
      address: {
        street: '123 Analytics St',
        city: 'Analytics City',
        state: 'Analytics State',
        zipCode: '123456'
      },
      contact: {
        phone: '9876543210',
        email: 'analytics@shop.com'
      },
      categories: ['mens-wear']
    };

    await helper.createShop(shopData);

    // View analytics dashboard
    await page.goto('/vendor/analytics');
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();

    // Check sales metrics
    await expect(page.locator('[data-testid="total-sales"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-products"]')).toBeVisible();

    // View sales chart
    await expect(page.locator('[data-testid="sales-chart"]')).toBeVisible();

    // Filter by date range
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.fill('[data-testid="end-date-input"]', '2024-12-31');
    await page.click('[data-testid="apply-date-filter"]');
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();

    // View product performance
    await page.click('[data-testid="product-performance-tab"]');
    await expect(page.locator('[data-testid="product-performance-list"]')).toBeVisible();

    // Export reports
    await page.click('[data-testid="export-sales-report"]');
    await expect(page.locator('[data-testid="report-downloaded-success"]')).toBeVisible();
  });

  test('should handle customer interactions and reviews', async ({ page }) => {
    // Register and login as vendor
    const vendorData = helper.generateUserData('vendor');
    await helper.registerUser(vendorData);
    await helper.loginUser(vendorData.email, vendorData.password);

    // Create shop
    const shopData = {
      name: 'Customer Test Shop',
      description: 'Shop for testing customer interactions',
      address: {
        street: '123 Customer St',
        city: 'Customer City',
        state: 'Customer State',
        zipCode: '123456'
      },
      contact: {
        phone: '9876543210',
        email: 'customer@shop.com'
      },
      categories: ['mens-wear']
    };

    await helper.createShop(shopData);

    // View customer reviews
    await page.goto('/vendor/reviews');
    await expect(page.locator('[data-testid="reviews-list"]')).toBeVisible();

    // Filter reviews by rating
    await page.selectOption('[data-testid="rating-filter-select"]', '5');
    await expect(page.locator('[data-testid="reviews-list"]')).toBeVisible();

    // Respond to review (if any reviews exist)
    const reviewItems = await page.locator('[data-testid="review-item"]').count();
    if (reviewItems > 0) {
      await page.click('[data-testid="respond-to-review"]:first-child');
      await page.fill('[data-testid="review-response-input"]', 'Thank you for your feedback!');
      await page.click('[data-testid="submit-response"]');
      await expect(page.locator('[data-testid="response-submitted-success"]')).toBeVisible();
    }

    // View customer messages
    await page.goto('/vendor/messages');
    await expect(page.locator('[data-testid="messages-list"]')).toBeVisible();

    // Send message to customer (if any customers exist)
    const messageItems = await page.locator('[data-testid="message-item"]').count();
    if (messageItems > 0) {
      await page.click('[data-testid="reply-to-message"]:first-child');
      await page.fill('[data-testid="message-input"]', 'Thank you for contacting us!');
      await page.click('[data-testid="send-message"]');
      await expect(page.locator('[data-testid="message-sent-success"]')).toBeVisible();
    }
  });
}); 