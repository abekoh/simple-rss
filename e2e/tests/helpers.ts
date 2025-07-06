import { Page } from '@playwright/test';

export async function openMobileDrawerIfNeeded(page: Page) {
  if (page.viewportSize()?.width && page.viewportSize()!.width < 1024) {
    await page.getByRole('button', { name: 'メニューを開く' }).click();
  }
}