import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,
  expect: { timeout: 10000 },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    // Configure for CI environment
    ...(process.env.CI && {
      video: 'retain-on-failure',
      screenshot: 'only-on-failure',
    }),
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['landing-page.spec.ts', 'navigation.spec.ts', 'authentication.spec.ts'],
    },
  ],

  webServer: {
    command: 'cd ../web && pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  }
});