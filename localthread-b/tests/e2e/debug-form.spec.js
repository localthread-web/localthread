const { test, expect } = require('@playwright/test');

test.describe('Debug Form Submission', () => {
  test('should debug form submission process', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    console.log('✅ Navigated to auth page');
    
    // Select customer tab
    await page.click('text=Customer');
    console.log('✅ Clicked customer tab');
    
    // Switch to registration mode
    await page.click('text=Register');
    console.log('✅ Clicked register button');
    
    // Fill form with test data
    const testEmail = `debug${Date.now()}@example.com`;
    await page.fill('input[name="name"]', 'Debug Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    console.log('✅ Filled form with test data');
    
    // Take screenshot before submission
    await page.screenshot({ path: 'test-results/debug-form-before-submit.png' });
    console.log('✅ Took screenshot before submission');
    
    // Submit form
    await page.click('button[type="submit"]');
    console.log('✅ Clicked submit button');
    
    // Wait a bit and take screenshot after submission
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/debug-form-after-submit.png' });
    console.log('✅ Took screenshot after submission');
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check for any error messages with more specific selectors
    const errorSelectors = [
      '.text-red-500',
      '.error',
      '[role="alert"]',
      'p.text-red-500',
      'p.text-sm.text-red-500',
      '.text-sm.text-red-500'
    ];
    
    for (const selector of errorSelectors) {
      const errors = await page.locator(selector).all();
      if (errors.length > 0) {
        console.log(`Found ${errors.length} error(s) with selector: ${selector}`);
        for (const error of errors) {
          const text = await error.textContent();
          console.log('Error text:', text);
        }
      }
    }
    
    // Check for toast notifications
    const toastSelectors = [
      '[data-sonner-toaster]',
      '.toast',
      '.notification',
      '[role="status"]'
    ];
    
    for (const selector of toastSelectors) {
      const toasts = await page.locator(selector).all();
      if (toasts.length > 0) {
        console.log(`Found ${toasts.length} toast(s) with selector: ${selector}`);
        for (const toast of toasts) {
          const text = await toast.textContent();
          console.log('Toast text:', text);
        }
      }
    }
    
    // Check browser console for errors
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
      console.log('Console:', msg.text());
    });
    
    // Wait a bit more to capture any delayed console messages
    await page.waitForTimeout(2000);
    
    console.log('✅ Debug test completed');
  });
}); 