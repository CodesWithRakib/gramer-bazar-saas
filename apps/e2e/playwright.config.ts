import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // The dev API + Next dev server share one CPU core; parallel workers cause
  // multi-second API stalls that flake the journeys, so run a single worker.
  workers: 1,
  retries: process.env.CI ? 2 : 1,
  // The dev server recompiles routes on first hit; 30s is not enough.
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ]
});
