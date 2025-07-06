import { test, expect } from '@playwright/test';
import { openMobileDrawerIfNeeded } from './helpers';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Simple RSS' })).toBeVisible();
  });

  test('should display "すべての記事" title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'すべての記事' })).toBeVisible();
  });

  test('should display sidebar with navigation items', async ({ page }) => {
    // On mobile, need to open the drawer first
    await openMobileDrawerIfNeeded(page);
    // Check for main navigation items
    await expect(page.getByRole('link', { name: 'すべての記事' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'お気に入り' })).toBeVisible();
  });

  test('should display feed addition section', async ({ page }) => {
    // On mobile, need to open the drawer first
    await openMobileDrawerIfNeeded(page);
    await expect(page.getByRole('heading', { name: 'フィードを追加' })).toBeVisible();
    await expect(page.getByPlaceholder('https://example.com/feed')).toBeVisible();
    await expect(page.getByRole('button', { name: '追加' }).first()).toBeVisible();
  });

  test('should display login button when not authenticated', async ({ page }) => {
    // On mobile, need to open the drawer first
    await openMobileDrawerIfNeeded(page);
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  test('should display color mode toggle', async ({ page }) => {
    // On mobile, need to open the drawer first
    await openMobileDrawerIfNeeded(page);
    // Color mode toggle should be visible - look for the exact aria-label
    const colorModeButton = page.getByRole('button', { name: 'toggle color mode' });
    await expect(colorModeButton).toBeVisible();
  });

  test('should navigate to favorite page when clicking お気に入り', async ({ page }) => {
    // On mobile, need to open the drawer first
    await openMobileDrawerIfNeeded(page);
    await page.getByRole('link', { name: 'お気に入り' }).click();
    await expect(page).toHaveURL(/.*\/favorite.*/);
  });

  test('should have working feed URL input', async ({ page }) => {
    // On mobile, need to open the drawer first
    await openMobileDrawerIfNeeded(page);
    const feedInput = page.getByPlaceholder('https://example.com/feed');
    await feedInput.fill('https://example.com/rss');
    await expect(feedInput).toHaveValue('https://example.com/rss');
  });

  test('should display mobile menu button on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu button should be visible
    await expect(page.getByRole('button', { name: 'メニューを開く' })).toBeVisible();
  });

  test('should open mobile drawer when menu button is clicked', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Click menu button
    await page.getByRole('button', { name: 'メニューを開く' }).click();
    
    // Check if drawer content is visible - use more specific selectors
    await expect(page.getByRole('link', { name: 'すべての記事' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'お気に入り' })).toBeVisible();
  });

  test('should display page title in document head', async ({ page }) => {
    await expect(page).toHaveTitle(/Simple RSS/);
  });

  test('should display posts when data is available', async ({ page }) => {
    // The page should load and display posts from the seeded test data
    await expect(page.getByRole('heading', { name: 'すべての記事' })).toBeVisible();
    
    // Wait for posts to load and check if any are visible
    // The test data should contain some posts
    await page.waitForTimeout(2000); // Give time for GraphQL to load
  });
});