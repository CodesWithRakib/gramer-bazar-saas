import { test, expect } from '@playwright/test';

test.describe('Automated Navigation Link Crawler', () => {
  test('crawls all primary public & guest routes for broken links or 500 boundaries', async ({
    page,
  }) => {
    test.setTimeout(180000);

    const publicPaths = [
      '/en',
      '/bn',
      '/en/categories',
      '/en/search',
      '/en/cart',
      '/en/login',
      '/en/register',
      '/en/forgot-password',
      '/en/become-a-seller',
      '/en/become-a-rider',
      '/en/offers',
      '/en/flash-sale',
    ];

    for (const path of publicPaths) {
      const res = await page.goto(path);
      expect(res?.status(), `Path ${path} returned status ${res?.status()}`).toBeLessThan(400);

      // Verify page does not trigger Next.js error boundary screen
      const hasError = await page.getByText(/something went wrong|internal server error/i).count();
      expect(hasError, `Error boundary rendered on ${path}`).toBe(0);
    }
  });
});
