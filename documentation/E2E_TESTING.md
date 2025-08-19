# End-to-End (E2E) Testing Documentation

## Overview

This document describes the E2E testing setup for the LocalThread marketplace platform using Playwright. E2E tests validate complete user journeys and workflows from a real user's perspective.

## 🏗️ Test Architecture

### Test Structure
```
tests/e2e/
├── helpers.js                 # E2E test helper functions
├── user-registration.spec.js  # User registration workflows
├── shopping-workflow.spec.js  # Complete shopping journeys
├── vendor-workflow.spec.js    # Vendor management workflows
└── fixtures/                  # Test fixtures (images, data)
    ├── product-image.jpg
    ├── shop-logo.png
    ├── shop-banner.jpg
    └── README.md
```

### Test Categories

1. **User Registration Tests** (`user-registration.spec.js`)
   - Customer registration
   - Vendor registration
   - Validation errors
   - Form interactions

2. **Shopping Workflow Tests** (`shopping-workflow.spec.js`)
   - Complete shopping journey
   - Cart operations
   - Shop browsing and filtering
   - Product browsing and search
   - Order placement and tracking

3. **Vendor Workflow Tests** (`vendor-workflow.spec.js`)
   - Vendor onboarding
   - Shop creation and management
   - Product inventory management
   - Order management
   - Analytics and reporting

## 🚀 Setup and Installation

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- Frontend application running on `http://localhost:3000`
- Backend API running on `http://localhost:5000`

### Installation
```bash
# Install Playwright
npm install --save-dev @playwright/test playwright

# Install browsers
npx playwright install
```

### Test Fixtures
Create the required test fixtures:
```bash
# Create fixtures directory
mkdir -p tests/e2e/fixtures

# Add sample images (any JPG/PNG files)
cp path/to/image.jpg tests/e2e/fixtures/product-image.jpg
cp path/to/logo.png tests/e2e/fixtures/shop-logo.png
cp path/to/banner.jpg tests/e2e/fixtures/shop-banner.jpg
```

## 🧪 Running E2E Tests

### Basic Commands
```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

### Running Specific Tests
```bash
# Run specific test file
npx playwright test user-registration.spec.js

# Run tests matching pattern
npx playwright test --grep "registration"

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests in parallel
npx playwright test --workers=4
```

### Running All Test Suites
```bash
# Run unit, integration, and E2E tests
npm run test:all
```

## 📋 Test Scenarios

### User Registration Workflows

#### Customer Registration
1. Navigate to registration page
2. Fill customer registration form
3. Submit form
4. Verify success message and redirect

#### Vendor Registration
1. Navigate to registration page
2. Fill vendor registration form
3. Submit form
4. Verify redirect to vendor onboarding

#### Validation Testing
1. Test empty form submission
2. Test invalid email formats
3. Test password mismatch
4. Test weak passwords
5. Test duplicate email registration

### Shopping Workflows

#### Complete Shopping Journey
1. Register and login as customer
2. Browse shops and search
3. View shop details and products
4. Add products to cart
5. Apply coupons
6. Complete checkout process
7. Verify order confirmation

#### Cart Operations
1. Add multiple items to cart
2. Update item quantities
3. Remove items from cart
4. Clear entire cart
5. Apply and remove coupons

#### Shop and Product Browsing
1. Browse shops with filters
2. Search shops by name
3. Filter by category and location
4. Browse products with filters
5. Search products
6. View product details and reviews

### Vendor Workflows

#### Vendor Onboarding
1. Register as vendor
2. Create shop profile
3. Add initial products
4. Verify dashboard access

#### Product Management
1. Add multiple products
2. Edit product details
3. Manage inventory levels
4. Activate/deactivate products
5. Upload product images

#### Order Management
1. View incoming orders
2. Update order status
3. Process orders
4. Track order history

## 🔧 Configuration

### Playwright Configuration (`playwright.config.js`)

```javascript
module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Environment Variables
```bash
# Test environment
NODE_ENV=test
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# CI environment
CI=true
```

## 🛠️ Helper Functions

### E2EHelper Class

The `E2EHelper` class provides common operations for E2E tests:

```javascript
class E2EHelper {
  // User management
  generateUserData(role)
  registerUser(userData)
  loginUser(email, password)

  // Shop management
  createShop(shopData)
  addProduct(productData)

  // Shopping operations
  addToCart(productId, quantity)
  completeCheckout(shippingAddress)

  // Utility functions
  isVisible(selector)
  waitForPageLoad()
  takeScreenshot(name)
}
```

## 📊 Test Reports

### HTML Report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

### JSON Report
Test results are saved to `test-results/e2e-results.json`

### JUnit Report
Test results are saved to `test-results/e2e-results.xml`

## 🐛 Debugging

### Debug Mode
```bash
# Run tests in debug mode
npm run test:e2e:debug
```

### Screenshots and Videos
- Screenshots are taken on test failures
- Videos are recorded for failed tests
- Files are saved in `test-results/` directory

### Trace Viewer
```bash
# Show trace for failed test
npx playwright show-trace test-results/trace.zip
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📈 Best Practices

### Test Organization
1. Group related tests in describe blocks
2. Use descriptive test names
3. Keep tests independent
4. Use helper functions for common operations

### Data Management
1. Generate unique test data
2. Clean up test data after tests
3. Use fixtures for static data
4. Avoid hardcoded values

### Performance
1. Run tests in parallel when possible
2. Use appropriate timeouts
3. Minimize network requests
4. Use efficient selectors

### Reliability
1. Use stable selectors (data-testid)
2. Add proper waits and assertions
3. Handle flaky elements
4. Retry failed tests in CI

## 🚨 Troubleshooting

### Common Issues

#### Tests Failing Intermittently
- Increase timeouts
- Add proper waits
- Use more stable selectors
- Check for race conditions

#### Browser Issues
- Update Playwright
- Clear browser cache
- Check browser compatibility
- Verify browser installation

#### Environment Issues
- Verify frontend/backend are running
- Check port availability
- Verify environment variables
- Check network connectivity

### Getting Help
1. Check Playwright documentation
2. Review test logs and screenshots
3. Use debug mode for step-by-step execution
4. Check CI/CD logs for environment issues

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug) 