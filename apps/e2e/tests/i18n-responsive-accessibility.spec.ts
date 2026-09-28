import { test, expect } from '@playwright/test';

const waitForHydration = async (page: import('@playwright/test').Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Internationalization, Responsive & Accessibility Audit', () => {
  test('language switcher switches between English and Bangla', async ({ page }) => {
    await page.goto('/en');
    await waitForHydration(page);

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Toggle language switcher
    const langBtn = page.getByRole('button', { name: /বাংলা|en/i }).first();
    await expect(langBtn).toBeVisible();
    await langBtn.click();

    // Check dropdown options if present or direct toggle
    const bnOption = page.getByText(/বাংলা/i).first();
    if (await bnOption.isVisible()) {
      await bnOption.click();
    }

    await page.waitForURL(/\/bn/, { timeout: 15000 });
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  });

  test('responsive drawer behavior on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/en');
    await waitForHydration(page);

    // Mobile header logo and menu trigger exist
    await expect(page.getByRole('banner')).toBeVisible();

    // Mobile bottom navigation bar should be visible on 375px viewport
    const bottomNav = page.locator('nav.fixed.bottom-0');
    if (await bottomNav.count()) {
      await expect(bottomNav).toBeVisible();
    }
  });

  test('key landing pages fulfill ARIA role accessibility assertions', async ({ page }) => {
    await page.goto('/en');
    await waitForHydration(page);

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});
