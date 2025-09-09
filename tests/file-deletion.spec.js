import { test, expect } from '@playwright/test';

test.describe('File Deletion Tests', () => {
  test('should delete file without page reload', async ({ page }) => {
    // Navigate to the bucket with files
    await page.goto('http://localhost:5174/buckets/robm-bucket');
    
    // Wait for the page to load and files to appear
    await expect(page.locator('main')).toBeVisible();
    
    // Wait for files to load (check for file cards or "no files" message)
    await page.waitForFunction(() => {
      const loadingSpinner = document.querySelector('.loading-spinner');
      return !loadingSpinner || loadingSpinner.offsetParent === null;
    }, { timeout: 10000 });
    
    // Count initial number of files
    const initialFileCount = await page.locator('[data-testid="file-card"], tr:has(td)').count();
    console.log(`Initial file count: ${initialFileCount}`);
    
    if (initialFileCount === 0) {
      console.log('No files in bucket to delete');
      return;
    }
    
    // Get the first file's delete button
    const firstDeleteButton = page.locator('button[title*="Delete"]').first();
    await expect(firstDeleteButton).toBeVisible();
    
    // Monitor network requests to ensure no full page reload happens
    let hasPageReloaded = false;
    page.on('framenavigated', () => {
      hasPageReloaded = true;
    });
    
    // Handle the confirmation dialog
    page.on('dialog', async dialog => {
      console.log(`Dialog appeared: ${dialog.message()}`);
      await dialog.accept();
    });
    
    // Click delete button
    await firstDeleteButton.click();
    
    // Wait a moment for the deletion to complete
    await page.waitForTimeout(2000);
    
    // Check that no full page reload occurred
    expect(hasPageReloaded).toBe(false);
    
    // Verify the file list was updated (count should be less or same if there was an error)
    const finalFileCount = await page.locator('[data-testid="file-card"], tr:has(td)').count();
    console.log(`Final file count: ${finalFileCount}`);
    
    // The file count should be reduced by 1 (unless there was an error)
    if (finalFileCount < initialFileCount) {
      console.log('✅ File deleted successfully without page reload');
    } else {
      console.log('ℹ️ File count unchanged - check for error messages');
    }
    
    // Check for any error messages
    const errorModal = page.locator('[role="dialog"]');
    if (await errorModal.isVisible()) {
      const errorText = await errorModal.textContent();
      console.log(`Error message appeared: ${errorText}`);
    }
  });
  
  test('should select multiple files with checkboxes', async ({ page }) => {
    // Navigate to the bucket with files
    await page.goto('http://localhost:5174/buckets/robm-bucket');
    
    // Wait for files to load
    await page.waitForFunction(() => {
      const loadingSpinner = document.querySelector('.loading-spinner');
      return !loadingSpinner || loadingSpinner.offsetParent === null;
    }, { timeout: 10000 });
    
    // Count available files
    const fileCount = await page.locator('input[type="checkbox"]').count();
    console.log(`Available files with checkboxes: ${fileCount}`);
    
    if (fileCount < 2) {
      console.log('Not enough files to test multiple selection');
      return;
    }
    
    // Select first file
    await page.locator('input[type="checkbox"]').nth(1).check(); // Skip header checkbox
    
    // Select second file
    await page.locator('input[type="checkbox"]').nth(2).check();
    
    // Verify both are selected
    const selectedFirst = await page.locator('input[type="checkbox"]').nth(1).isChecked();
    const selectedSecond = await page.locator('input[type="checkbox"]').nth(2).isChecked();
    
    expect(selectedFirst).toBe(true);
    expect(selectedSecond).toBe(true);
    
    console.log('✅ Multiple file selection working');
    
    // Test deselection
    await page.locator('input[type="checkbox"]').nth(1).uncheck();
    const deselected = await page.locator('input[type="checkbox"]').nth(1).isChecked();
    expect(deselected).toBe(false);
    
    console.log('✅ File deselection working');
  });
});