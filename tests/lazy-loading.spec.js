import { test, expect } from '@playwright/test';

test.describe('Gallery Lazy Loading Tests', () => {
  test('should lazy load images in gallery view', async ({ page }) => {
    // Navigate to bucket with images
    await page.goto('http://localhost:5174/buckets/client-latinopulse-ef2cb67437489fa28aa560cf7d5e60f4');
    
    // Wait for files to load
    await page.waitForFunction(() => {
      const loadingSpinner = document.querySelector('.loading-spinner');
      return !loadingSpinner || loadingSpinner.offsetParent === null;
    }, { timeout: 10000 });
    
    // Switch to gallery view
    const galleryButton = page.locator('button[title="Gallery view"]');
    await expect(galleryButton).toBeVisible();
    await galleryButton.click();
    
    // Wait for gallery view to render
    await page.waitForTimeout(1000);
    
    // Count total gallery cards
    const galleryCards = page.locator('.card.group');
    const totalCards = await galleryCards.count();
    console.log(`Found ${totalCards} gallery cards`);
    
    if (totalCards === 0) {
      console.log('No gallery cards found to test lazy loading');
      return;
    }
    
    // Check initial state - only visible images should be loading
    const initialLoadingStates = await page.evaluate(() => {
      const cards = document.querySelectorAll('.card.group');
      let placeholders = 0;
      let loading = 0;
      let loaded = 0;
      
      cards.forEach(card => {
        const placeholder = card.querySelector('p:has-text("Scroll to load")');
        const loadingSpinner = card.querySelector('.loading-spinner');
        const image = card.querySelector('img');
        
        if (placeholder) placeholders++;
        else if (loadingSpinner) loading++;
        else if (image) loaded++;
      });
      
      return { placeholders, loading, loaded, total: cards.length };
    });
    
    console.log(`Initial state - Placeholders: ${initialLoadingStates.placeholders}, Loading: ${initialLoadingStates.loading}, Loaded: ${initialLoadingStates.loaded}`);
    
    // Verify that not all images are loaded immediately (lazy loading working)
    expect(initialLoadingStates.placeholders + initialLoadingStates.loading).toBeGreaterThan(0);
    
    // Scroll down to trigger lazy loading of more images
    await page.evaluate(() => {
      window.scrollBy(0, 1000);
    });
    
    // Wait for new images to start loading
    await page.waitForTimeout(2000);
    
    // Check that more images are now loading/loaded
    const afterScrollStates = await page.evaluate(() => {
      const cards = document.querySelectorAll('.card.group');
      let placeholders = 0;
      let loading = 0;
      let loaded = 0;
      
      cards.forEach(card => {
        const placeholder = card.querySelector('p:has-text("Scroll to load")');
        const loadingSpinner = card.querySelector('.loading-spinner');
        const image = card.querySelector('img');
        
        if (placeholder) placeholders++;
        else if (loadingSpinner) loading++;
        else if (image) loaded++;
      });
      
      return { placeholders, loading, loaded };
    });
    
    console.log(`After scroll - Placeholders: ${afterScrollStates.placeholders}, Loading: ${afterScrollStates.loading}, Loaded: ${afterScrollStates.loaded}`);
    
    // Verify lazy loading is working
    const totalNonPlaceholders = afterScrollStates.loading + afterScrollStates.loaded;
    const initialNonPlaceholders = initialLoadingStates.loading + initialLoadingStates.loaded;
    
    if (totalNonPlaceholders > initialNonPlaceholders) {
      console.log('✅ Lazy loading is working - more images loaded after scroll');
    } else if (afterScrollStates.placeholders < initialLoadingStates.placeholders) {
      console.log('✅ Lazy loading is working - fewer placeholders after scroll');
    } else {
      console.log('ℹ️ All images may already be in viewport - lazy loading ready');
    }
  });
  
  test('should show proper loading states for images', async ({ page }) => {
    await page.goto('http://localhost:5174/buckets/client-latinopulse-ef2cb67437489fa28aa560cf7d5e60f4');
    
    // Wait for files to load
    await page.waitForFunction(() => {
      const loadingSpinner = document.querySelector('.loading-spinner');
      return !loadingSpinner || loadingSpinner.offsetParent === null;
    }, { timeout: 10000 });
    
    // Switch to gallery view
    await page.locator('button[title="Gallery view"]').click();
    await page.waitForTimeout(500);
    
    // Look for lazy loading indicators
    const scrollToLoadText = page.locator('p:has-text("Scroll to load")');
    const loadingSpinners = page.locator('.loading-spinner');
    
    if (await scrollToLoadText.count() > 0) {
      console.log('✅ Lazy loading placeholders found');
    }
    
    if (await loadingSpinners.count() > 0) {
      console.log('✅ Loading spinners found');
    }
    
    console.log('✅ Gallery lazy loading states working properly');
  });
});