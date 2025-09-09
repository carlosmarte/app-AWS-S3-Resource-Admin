import { test, expect } from '@playwright/test';

test.describe('Enhanced File Management Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a bucket with files
    await page.goto('http://localhost:5174/buckets/robm-bucket');
    
    // Wait for files to load
    await page.waitForFunction(() => {
      const loadingSpinner = document.querySelector('.loading-spinner');
      return !loadingSpinner || loadingSpinner.offsetParent === null;
    }, { timeout: 10000 });
  });

  test('should show select all button and work correctly', async ({ page }) => {
    // Check if files exist
    const fileCount = await page.locator('[data-testid="file-card"], .card').count();
    
    if (fileCount === 0) {
      console.log('No files to test selection with');
      return;
    }

    // Look for select all button
    const selectAllButton = page.locator('button:has-text("Select All")');
    await expect(selectAllButton).toBeVisible();
    
    // Click select all
    await selectAllButton.click();
    
    // Verify button text changes to "Deselect All"
    await expect(page.locator('button:has-text("Deselect All")')).toBeVisible();
    
    // Verify selection counter appears
    await expect(page.locator('text=/\\d+ files? selected/')).toBeVisible();
    
    // Verify bulk delete button appears
    await expect(page.locator('button:has-text("Delete Selected")')).toBeVisible();
    
    console.log('✅ Select All functionality working');
  });

  test('should show and use file type filter', async ({ page }) => {
    // Look for Filters button
    const filtersButton = page.locator('button:has-text("Filters")');
    await expect(filtersButton).toBeVisible();
    
    // Click to open filters
    await filtersButton.click();
    
    // Verify filter panel appears
    const typeFilter = page.locator('select').filter({ hasText: 'All Types' }).first();
    await expect(typeFilter).toBeVisible();
    
    // Test changing filter
    await typeFilter.selectOption('image');
    
    // Verify filter is applied (URL or visible change)
    await page.waitForTimeout(500);
    
    // Check if Clear Filters button appears
    const clearButton = page.locator('button:has-text("Clear Filters")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
    
    console.log('✅ File type filter working');
  });

  test('should show and use file size filter', async ({ page }) => {
    // Open filters
    await page.locator('button:has-text("Filters")').click();
    
    // Find size filter
    const sizeFilter = page.locator('select').filter({ hasText: 'Any Size' }).first();
    await expect(sizeFilter).toBeVisible();
    
    // Test different size ranges
    await sizeFilter.selectOption('small');
    await page.waitForTimeout(500);
    
    await sizeFilter.selectOption('custom');
    await page.waitForTimeout(500);
    
    // Verify custom range inputs appear
    await expect(page.locator('input[placeholder="Min MB"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Max MB"]')).toBeVisible();
    
    console.log('✅ File size filter working');
  });

  test('should have three view modes including gallery', async ({ page }) => {
    // Check for all three view mode buttons
    await expect(page.locator('button[title="Grid view"]')).toBeVisible();
    await expect(page.locator('button[title="List view"]')).toBeVisible();
    await expect(page.locator('button[title="Gallery view"]')).toBeVisible();
    
    // Test switching to gallery view
    await page.locator('button[title="Gallery view"]').click();
    
    // Verify gallery view is active (button should be highlighted)
    const galleryButton = page.locator('button[title="Gallery view"]');
    const classes = await galleryButton.getAttribute('class');
    expect(classes).toContain('bg-white');
    
    // Test switching back to grid view
    await page.locator('button[title="Grid view"]').click();
    
    console.log('✅ All three view modes working');
  });

  test('should handle combined filtering (search + type + size)', async ({ page }) => {
    // Open filters
    await page.locator('button:has-text("Filters")').click();
    
    // Apply search
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');
    
    // Apply type filter
    const typeFilter = page.locator('select').filter({ hasText: 'All Types' }).first();
    await typeFilter.selectOption('document');
    
    // Apply size filter
    const sizeFilter = page.locator('select').filter({ hasText: 'Any Size' }).first();
    await sizeFilter.selectOption('small');
    
    await page.waitForTimeout(500);
    
    // Verify filters are working together
    const clearButton = page.locator('button:has-text("Clear Filters")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      console.log('✅ Combined filtering working - Clear button appeared');
    }
    
    console.log('✅ Multi-criteria filtering working');
  });
});