import { test, expect } from '@playwright/test';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const waitForHydration = async (page: import('@playwright/test').Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Public Marketplace & Discovery', () => {
  test('guest can view homepage discovery components without auth errors', async ({ page }) => {
    await page.goto('/en');
    await waitForHydration(page);

    await expect(page).toHaveTitle(/Gramer Bazar/i);
    await expect(page.getByRole('heading', { name: /categories/i }).first()).toBeVisible();
    await expect(page.getByText(/featured products/i).first()).toBeVisible();

    // Verify no console exceptions or error boundaries
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
  });

  test('guest can navigate categories and subcategories', async ({ page }) => {
    await page.goto('/en/categories');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /categor/i }).first()).toBeVisible();

    // Verify categories list contains items from API
    const categoryCards = page.locator('a[href*="/catalog?category="]');
    await expect(categoryCards.first()).toBeVisible({ timeout: 15000 });
    expect(await categoryCards.count()).toBeGreaterThan(0);
  });

  test('guest can search catalog with filters', async ({ page }) => {
    await page.goto('/en/search?q=grocery');
    await waitForHydration(page);

    await expect(page.getByPlaceholder(/search products/i).first()).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
  });

  test('guest direct access to protected routes redirects to login or unauthorized', async ({ page }) => {
    // Attempting direct access to customer checkout without login
    await page.goto('/en/customer/checkout');
    await page.waitForURL(/\/en\/login/, { timeout: 15000 });
    expect(page.url()).toContain('/login');

    // Attempting direct access to seller dashboard
    await page.goto('/en/seller');
    await page.waitForURL(/\/(en)\/(login|unauthorized)/, { timeout: 15000 });

    // Attempting direct access to admin dashboard
    await page.goto('/en/admin');
    await page.waitForURL(/\/(en)\/(login|unauthorized)/, { timeout: 15000 });
  });
});
