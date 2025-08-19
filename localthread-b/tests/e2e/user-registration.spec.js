const { test, expect } = require('@playwright/test');
const { E2EHelper } = require('./helpers');

test.describe('User Registration E2E Tests', () => {
  let helper;

  test.beforeEach(async ({ page }) => {
    helper = new E2EHelper(page);
  });

  test('should register a new customer successfully', async ({ page }) => {
    const userData = helper.generateUserData('customer');

    // Navigate to auth page
    await page.goto('/auth');
    await expect(page).toHaveTitle(/LocalThread/);

    // Select customer tab
    await page.click('text=Customer');

    // Switch to registration mode
    await page.click('text=Register');

    // Fill registration form
    await page.fill('input[name="name"]', userData.name);
    await page.fill('input[name="email"]', userData.email);
    await page.fill('input[name="password"]', userData.password);
    await page.fill('input[name="confirmPassword"]', userData.confirmPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success and navigation
    await page.waitForTimeout(3000);
    
    // Verify successful registration (should redirect to customer profile)
    await expect(page).toHaveURL(/\/customer\/profile/);
  });

  test('should register a new vendor successfully', async ({ page }) => {
    const userData = helper.generateUserData('vendor');

    // Navigate to auth page
    await page.goto('/auth');

    // Select vendor tab
    await page.click('text=Vendor');

    // Switch to registration mode
    await page.click('text=Register');

    // Fill registration form
    await page.fill('input[name="name"]', userData.name);
    await page.fill('input[name="email"]', userData.email);
    await page.fill('input[name="password"]', userData.password);
    await page.fill('input[name="confirmPassword"]', userData.confirmPassword);
    
    // Fill vendor-specific fields
    await page.fill('input[name="storeName"]', `Test Store ${Date.now()}`);
    await page.fill('input[name="storeDescription"]', 'Test store description');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success and navigation
    await page.waitForTimeout(3000);
    
    // Verify successful registration (should redirect to vendor dashboard)
    await expect(page).toHaveURL(/\/vendor\/dashboard/);
  });

  test('should show validation errors for invalid data', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Customer');
    await page.getByTestId('switch-to-register').click();
    // Wait for registration form to be visible
    await expect(page.locator('input[name="name"]')).toBeVisible();
    // Try to submit empty form
    await page.locator('form button[type="submit"]').first().click();
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/validation-errors-after-submit.png' });
    // Verify validation errors are shown
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for existing email', async ({ page }) => {
    const userData = helper.generateUserData('customer');

    // First registration
    await helper.registerUser(userData);
    
    // Try to register again with same email
    await page.goto('/auth');
    await page.click('text=Customer');
    await page.click('text=Register');
    await page.fill('input[name="name"]', 'Another User');
    await page.fill('input[name="email"]', userData.email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Should show error for existing email
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Email already exists')).toBeVisible();
  });

  test('should show error for password mismatch', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Customer');
    await page.click('text=Register');

    // Fill form with mismatched passwords
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify password mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Customer');
    await page.click('text=Register');

    // Fill form with weak password
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify weak password error
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
  });

  test('should navigate to login page from registration', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Customer');
    await page.click('text=Register');

    // Use the new data-testid for the login mode switcher
    const loginButton = page.getByTestId('switch-to-login');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      // Should be on login mode (check for login submit button)
      await expect(page.getByTestId('login-submit')).toBeVisible();
    }
  });

  test('should handle form reset', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Customer');
    await page.click('text=Register');

    // Fill form partially
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');

    // Reload page to reset form
    await page.reload();
    await page.click('text=Customer');
    await page.click('text=Register');

    // Verify form is empty
    await expect(page.locator('input[name="name"]')).toHaveValue('');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
  });
}); 