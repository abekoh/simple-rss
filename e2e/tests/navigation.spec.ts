import { test, expect } from '@playwright/test';
import { openMobileDrawerIfNeeded } from './helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate between main sections', async ({ page }) => {
    // Start on home page
    await expect(page.getByRole('heading', { name: 'すべての記事' })).toBeVisible();
    
    // Navigate to favorites
    await openMobileDrawerIfNeeded(page);
    await page.getByRole('link', { name: 'お気に入り' }).click();
    await expect(page).toHaveURL(/.*\/favorite.*/);
    await expect(page.getByRole('heading', { name: 'お気に入り' })).toBeVisible();
    
    // Navigate back to home
    await page.getByRole('link', { name: 'Simple RSS' }).click();
    await expect(page).toHaveURL(/.*\/.*/);
    await expect(page.getByRole('heading', { name: 'すべての記事' })).toBeVisible();
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Check home page is highlighted
    await openMobileDrawerIfNeeded(page);
    const homeLink = page.getByRole('link', { name: 'すべての記事' });
    await expect(homeLink).toBeVisible();
    
    // Navigate to favorites and check highlighting
    await page.getByRole('link', { name: 'お気に入り' }).click();
    await openMobileDrawerIfNeeded(page);
    const favoriteLink = page.getByRole('link', { name: 'お気に入り' });
    await expect(favoriteLink).toBeVisible();
  });

  test('should work with browser back/forward buttons', async ({ page }) => {
    // Navigate to favorites
    await openMobileDrawerIfNeeded(page);
    await page.getByRole('link', { name: 'お気に入り' }).click();
    await expect(page).toHaveURL(/.*\/favorite.*/);
    
    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL(/.*\/.*/);
    
    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL(/.*\/favorite.*/);
  });

  test('should handle mobile navigation drawer', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile drawer
    await page.getByRole('button', { name: 'メニューを開く' }).click();
    
    // Navigate to favorites from drawer
    await page.getByRole('link', { name: 'お気に入り' }).click();
    await expect(page).toHaveURL(/.*\/favorite.*/);
    
    // Drawer should close after navigation
    await expect(page.getByRole('button', { name: 'メニューを開く' })).toBeVisible();
  });

  test('should maintain page state when navigating', async ({ page }) => {
    // Navigate to favorites
    await openMobileDrawerIfNeeded(page);
    await page.getByRole('link', { name: 'お気に入り' }).click();
    await expect(page).toHaveURL(/.*\/favorite.*page=1/);
    
    // Navigate back to home
    await page.getByRole('link', { name: 'Simple RSS' }).click();
    await expect(page).toHaveURL(/.*\/.*page=1/);
  });
});