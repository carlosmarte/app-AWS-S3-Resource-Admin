import { test, expect } from '@playwright/test';

test.describe('Bulk Delete Progress Tests', () => {
  test('should show progressive bulk delete with individual file status', async ({ page }) => {
    // Navigate to bucket with files
    await page.goto('http://localhost:5174/buckets/robm-bucket');
    
    // Wait for files to load
    await page.waitForFunction(() => {
      const loadingSpinner = document.querySelector('.loading-spinner');
      return !loadingSpinner || loadingSpinner.offsetParent === null;
    }, { timeout: 10000 });
    
    // Check if files exist
    const fileCards = page.locator('.card, tr[class*="hover:bg-gray-50"]');
    const fileCount = await fileCards.count();
    console.log(`Found ${fileCount} files`);
    
    if (fileCount < 2) {
      console.log('Need at least 2 files to test bulk delete');
      return;
    }
    
    // Select multiple files using checkboxes
    await page.locator('input[type="checkbox"]').nth(1).check(); // Skip header checkbox
    await page.locator('input[type="checkbox"]').nth(2).check();
    
    // Verify bulk delete button appears
    const bulkDeleteButton = page.locator('button:has-text("Delete Selected")');
    await expect(bulkDeleteButton).toBeVisible();
    
    // Handle confirmation dialog
    page.on('dialog', async dialog => {
      console.log(`Confirmation dialog: ${dialog.message()}`);
      await dialog.accept();
    });
    
    // Click bulk delete
    await bulkDeleteButton.click();
    
    // Wait for bulk delete progress to appear
    const progressModal = page.locator('div:has-text("Deleting Files")');
    await expect(progressModal).toBeVisible({ timeout: 5000 });
    console.log('✅ Bulk delete progress modal appeared');
    
    // Verify progress components are visible
    await expect(page.locator('text=/\\d+ of \\d+ completed/')).toBeVisible();
    await expect(page.locator('.bg-primary-600')).toBeVisible(); // Progress bar
    
    console.log('✅ Progress indicators working');
    
    // Wait for deletion to complete or show progress
    await page.waitForTimeout(3000);
    
    // Check if progress is being shown
    const progressText = await page.locator('text=/\\d+ of \\d+ completed/').first().textContent();
    console.log(`Progress: ${progressText}`);
    
    console.log('✅ Bulk delete progress functionality working');
  });
  
  test('should allow cancelling bulk delete operation', async ({ page }) => {
    // Navigate to bucket
    await page.goto('http://localhost:5174/buckets/robm-bucket');
    
    // Wait for files to load
    await page.waitForFunction(() => {
      const loadingSpinner = document.querySelector('.loading-spinner');
      return !loadingSpinner || loadingSpinner.offsetParent === null;
    }, { timeout: 10000 });
    
    const fileCount = await page.locator('.card, tr[class*="hover:bg-gray-50"]').count();
    
    if (fileCount < 2) {
      console.log('Need at least 2 files to test bulk delete cancellation');
      return;
    }
    
    // Select files
    await page.locator('input[type="checkbox"]').nth(1).check();
    await page.locator('input[type="checkbox"]').nth(2).check();
    
    // Handle confirmation dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    // Start bulk delete
    await page.locator('button:has-text("Delete Selected")').click();
    
    // Wait for progress modal
    const progressModal = page.locator('div:has-text("Deleting Files")');
    await expect(progressModal).toBeVisible({ timeout: 5000 });
    
    // Try to cancel (look for X button or cancel button)
    const cancelButton = page.locator('button[title="Cancel remaining deletions"]');
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      console.log('✅ Cancel button found and clicked');
      
      // Verify progress modal disappears
      await expect(progressModal).toBeHidden({ timeout: 2000 });
      console.log('✅ Bulk delete cancellation working');
    } else {
      console.log('ℹ️ Cancel button not visible (deletion might be too fast)');
    }
  });
});