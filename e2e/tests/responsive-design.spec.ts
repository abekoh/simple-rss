import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display desktop layout on large screens', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Desktop layout should show sidebar directly
    await expect(page.getByRole('link', { name: 'すべての記事' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'お気に入り' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'フィードを追加' })).toBeVisible();
    
    // Mobile menu button should not be visible
    await expect(page.getByRole('button', { name: 'メニューを開く' })).not.toBeVisible();
  });

  test('should display mobile layout on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu button should be visible
    await expect(page.getByRole('button', { name: 'メニューを開く' })).toBeVisible();
    
    // Header should still be visible
    await expect(page.getByRole('heading', { name: 'Simple RSS' })).toBeVisible();
    
    // Main content should be visible
    await expect(page.getByRole('heading', { name: 'すべての記事' })).toBeVisible();
  });

  test('should handle tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Should behave like mobile (based on breakpoint in code)
    await expect(page.getByRole('button', { name: 'メニューを開く' })).toBeVisible();
    
    // Header should be visible
    await expect(page.getByRole('heading', { name: 'Simple RSS' })).toBeVisible();
  });

  test('should handle mobile drawer interaction', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open drawer
    await page.getByRole('button', { name: 'メニューを開く' }).click();
    
    // Drawer content should be visible
    await expect(page.getByRole('link', { name: 'すべての記事' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'お気に入り' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'フィードを追加' })).toBeVisible();
    
    // Navigation should work from drawer
    await page.getByRole('link', { name: 'お気に入り' }).click();
    await expect(page).toHaveURL(/.*\/favorite.*/);
  });

  test('should handle viewport changes', async ({ page }) => {
    // Start with desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('button', { name: 'メニューを開く' })).not.toBeVisible();
    
    // Change to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('button', { name: 'メニューを開く' })).toBeVisible();
    
    // Change back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('button', { name: 'メニューを開く' })).not.toBeVisible();
  });

  test('should maintain functionality across viewports', async ({ page }) => {
    // Test mobile first
    await page.setViewportSize({ width: 375, height: 667 });
    await page.getByRole('button', { name: 'メニューを開く' }).click();
    await page.getByRole('link', { name: 'お気に入り' }).click();
    await expect(page).toHaveURL(/.*\/favorite.*/);
    
    // Change to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.getByRole('link', { name: 'すべての記事' }).click();
    await expect(page).toHaveURL(/.*\/.*/);
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test touch-like interactions (using click since tap requires hasTouch context)
    await page.getByRole('button', { name: 'メニューを開く' }).click();
    await expect(page.getByRole('link', { name: 'すべての記事' })).toBeVisible();
    
    // Test navigation by clicking
    await page.getByRole('link', { name: 'お気に入り' }).click();
    await expect(page).toHaveURL(/.*\/favorite.*/);
  });

  test('should display content properly on different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // iPhone 5
      { width: 375, height: 667 }, // iPhone 6/7/8
      { width: 414, height: 736 }, // iPhone 6/7/8 Plus
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // iPad landscape
      { width: 1280, height: 720 }, // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Basic content should be visible
      await expect(page.getByRole('heading', { name: 'Simple RSS' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'すべての記事' })).toBeVisible();
      
      // Check if layout adapts correctly
      if (viewport.width < 1024) {
        await expect(page.getByRole('button', { name: 'メニューを開く' })).toBeVisible();
      } else {
        await expect(page.getByRole('button', { name: 'メニューを開く' })).not.toBeVisible();
      }
    }
  });
});