const { test, expect } = require('@playwright/test');

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should register a new customer successfully', async ({ page }) => {
    // Navigate to registration page
    await page.click('text=Sign Up');
    
    // Fill registration form
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john.doe@example.com');
    await page.fill('[data-testid="phone-input"]', '9876543210');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.selectOption('[data-testid="role-select"]', 'customer');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify successful registration
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('[data-testid="user-name"]')).toContainText('John Doe');
  });

  test('should register a new vendor successfully', async ({ page }) => {
    // Navigate to registration page
    await page.click('text=Sign Up');
    
    // Fill registration form for vendor
    await page.fill('[data-testid="name-input"]', 'Jane Vendor');
    await page.fill('[data-testid="email-input"]', 'jane.vendor@example.com');
    await page.fill('[data-testid="phone-input"]', '9876543211');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.selectOption('[data-testid="role-select"]', 'vendor');
    await page.fill('[data-testid="store-name-input"]', 'Jane\'s Fashion Store');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify successful registration
    await expect(page).toHaveURL(/.*vendor-dashboard/);
    await expect(page.locator('[data-testid="vendor-name"]')).toContainText('Jane Vendor');
  });

  test('should login customer successfully', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should login vendor successfully', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'vendor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*vendor-dashboard/);
    await expect(page.locator('[data-testid="vendor-menu"]')).toBeVisible();
  });

  test('should reject login with invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    
    // Fill login form with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.click('text=Login');
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Verify logout
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should handle forgot password flow', async ({ page }) => {
    // Navigate to forgot password page
    await page.click('text=Login');
    await page.click('[data-testid="forgot-password-link"]');
    
    // Fill email
    await page.fill('[data-testid="email-input"]', 'customer@example.com');
    await page.click('[data-testid="reset-password-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Password reset email sent');
  });

  test('should validate registration form fields', async ({ page }) => {
    // Navigate to registration page
    await page.click('text=Sign Up');
    
    // Try to submit empty form
    await page.click('[data-testid="register-button"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Name is required');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required');
  });

  test('should validate password strength', async ({ page }) => {
    // Navigate to registration page
    await page.click('text=Sign Up');
    
    // Fill form with weak password
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'weak');
    await page.fill('[data-testid="confirm-password-input"]', 'weak');
    
    // Verify password strength indicator
    await expect(page.locator('[data-testid="password-strength"]')).toContainText('Weak');
  });
}); 