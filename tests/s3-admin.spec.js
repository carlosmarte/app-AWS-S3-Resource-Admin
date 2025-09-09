const { test, expect } = require('@playwright/test');

test.describe('AWS S3 Resource Admin', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load the application successfully', async ({ page }) => {
    // Check if the main title is visible
    await expect(page.locator('h1')).toContainText('S3 Admin');
    
    // Check if the cloud icon is present
    await expect(page.locator('[data-testid="cloud-icon"], svg')).toBeVisible();
    
    // Check if the main content area is loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display the header with all navigation elements', async ({ page }) => {
    // Check header elements
    await expect(page.locator('header')).toBeVisible();
    
    // Check logo and title
    await expect(page.locator('h1')).toContainText('S3 Admin');
    
    // Check search bar
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    
    // Check view mode toggle buttons
    await expect(page.locator('button[title="Grid view"], button[title="List view"]')).toHaveCount(2);
    
    // Check refresh button
    await expect(page.locator('button[title="Refresh"]')).toBeVisible();
    
    // Check create bucket button
    await expect(page.locator('button:has-text("Create Bucket")')).toBeVisible();
  });

  test('should show buckets view by default', async ({ page }) => {
    // Should be on buckets view initially
    await expect(page.locator('button:has-text("Create Bucket")')).toBeVisible();
    
    // Should show stats cards
    await expect(page.locator('text=Total Buckets')).toBeVisible();
    await expect(page.locator('text=Total Storage')).toBeVisible();
    await expect(page.locator('text=Total Files')).toBeVisible();
    await expect(page.locator('text=Active Regions')).toBeVisible();
  });

  test('should open create bucket modal when clicking create button', async ({ page }) => {
    // Click create bucket button
    await page.click('button:has-text("Create Bucket")');
    
    // Check if modal is visible
    await expect(page.locator('text=Create New Bucket')).toBeVisible();
    
    // Check form elements
    await expect(page.locator('input[placeholder="my-bucket-name"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('input[type="radio"][value="private"]')).toBeVisible();
    
    // Check buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Bucket")')).toBeVisible();
  });

  test('should close create bucket modal when clicking cancel', async ({ page }) => {
    // Open modal
    await page.click('button:has-text("Create Bucket")');
    await expect(page.locator('text=Create New Bucket')).toBeVisible();
    
    // Close modal
    await page.click('button:has-text("Cancel")');
    
    // Modal should be closed
    await expect(page.locator('text=Create New Bucket')).not.toBeVisible();
  });

  test('should validate bucket name input', async ({ page }) => {
    // Open modal
    await page.click('button:has-text("Create Bucket")');
    
    // Try to submit with empty name
    await page.click('button:has-text("Create Bucket")');
    
    // Should show validation error
    await expect(page.locator('text=Bucket name is required')).toBeVisible();
  });

  test('should toggle between grid and list view modes', async ({ page }) => {
    // Check initial view mode (should be grid by default)
    const gridButton = page.locator('button[title="Grid view"]');
    const listButton = page.locator('button[title="List view"]');
    
    // Click list view
    await listButton.click();
    
    // Click grid view
    await gridButton.click();
  });

  test('should handle search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Type in search
    await searchInput.fill('test');
    
    // Check if search value is set
    await expect(searchInput).toHaveValue('test');
    
    // Clear search
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if header is still visible
    await expect(page.locator('header')).toBeVisible();
    
    // Check if title is visible
    await expect(page.locator('h1')).toContainText('S3 Admin');
    
    // Check if main content is visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should handle file upload area when in files view', async ({ page }) => {
    // This test would require navigating to files view
    // For now, we'll just check if the upload area exists when we get there
    
    // Look for upload-related elements (they might be hidden initially)
    const uploadElements = page.locator('text=Drop files here, text=Upload Files, input[type="file"]');
    
    // At least one upload-related element should exist
    await expect(uploadElements.first()).toBeVisible();
  });

  test('should display proper error states', async ({ page }) => {
    // Check if error handling is in place
    // This would typically involve checking for error messages
    // when API calls fail, but we'll check the basic structure
    
    // Look for any error-related classes or elements
    const errorElements = page.locator('.error, [data-testid="error"], .text-red-600');
    
    // Initially, there should be no errors
    await expect(errorElements).toHaveCount(0);
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for proper button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const title = await button.getAttribute('title');
      
      // Each button should have either text content or a title attribute
      expect(text || title).toBeTruthy();
    }
    
    // Check for proper form labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const placeholder = await input.getAttribute('placeholder');
      const ariaLabel = await input.getAttribute('aria-label');
      
      // Each input should have either placeholder or aria-label
      expect(placeholder || ariaLabel).toBeTruthy();
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test escape key to close modals
    await page.click('button:has-text("Create Bucket")');
    await expect(page.locator('text=Create New Bucket')).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Create New Bucket')).not.toBeVisible();
  });
});
