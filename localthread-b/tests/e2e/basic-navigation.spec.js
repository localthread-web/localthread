const { test, expect } = require('@playwright/test');

test.describe('Basic Navigation E2E Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LocalThread/);
  });

  test('should load the auth page', async ({ page }) => {
    await page.goto('/auth');
    await expect(page).toHaveTitle(/LocalThread/);
    await expect(page.locator('text=Welcome to LocalThread')).toBeVisible();
  });

  test('should navigate between customer and vendor tabs', async ({ page }) => {
    await page.goto('/auth');
    
    // Check that customer tab is visible
    await expect(page.locator('text=Customer')).toBeVisible();
    await expect(page.locator('text=Vendor')).toBeVisible();
    
    // Click vendor tab
    await page.click('text=Vendor');
    await expect(page.locator('text=Vendor')).toBeVisible();
    
    // Click customer tab
    await page.click('text=Customer');
    await expect(page.locator('text=Customer')).toBeVisible();
  });

  test('should switch between login and register modes', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Customer');
    
    // Check that both buttons are visible
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Register')).toBeVisible();
    
    // Click register button
    await page.click('text=Register');
    await expect(page.locator('text=Register')).toBeVisible();
    
    // Click login button
    await page.click('text=Login');
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should display registration form fields', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Customer');
    await page.click('text=Register');
    
    // Check that form fields are visible
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });
}); 