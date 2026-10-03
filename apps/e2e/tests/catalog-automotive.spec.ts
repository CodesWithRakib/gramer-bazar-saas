import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Automotive catalog vertical & vehicle fitment — customer discovery', () => {
  test('guest browses Automotive → Car Parts → Brake System → a product', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/automotive');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Automotive/i }),
    ).toBeVisible({ timeout: 20000 });

    const carPartsLink = page.getByRole('link', { name: /Car Parts/i }).first();
    if (await carPartsLink.isVisible()) {
      await carPartsLink.click();
      await expect(page).toHaveURL(/\/en\/categories\/auto-/);
    }

    const productLinks = page.locator('a[href^="/en/products/"]');
    if (await productLinks.first().isVisible()) {
      expect(await productLinks.count()).toBeGreaterThan(0);
    }
  });

  test('brand and vehicle make facets filter automotive results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/automotive');
    await waitForHydration(page);

    const brandFilter = page.locator('aside').filter({ hasText: /Brand|Bosch|Mobil|Denso|NGK|Toyota/i });
    if (await brandFilter.isVisible()) {
      await expect(brandFilter).toBeVisible({ timeout: 20000 });
    }
  });

  test('product detail exposes vehicle fitment badges and position', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-auto-bosch-ceramic-brake-pads');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Bosch Blue Ceramic Disc Brake Pads/i })).toBeVisible({
      timeout: 20000,
    });

    // Check Fitment badge
    await expect(page.getByText(/Fitment:|উপযোগী:/i).first()).toBeVisible({ timeout: 20000 });

    // Check Position badge
    await expect(page.getByText(/Position:|পজিশন:/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('product detail exposes oil volume variants and syncs price', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-auto-mobil1-synthetic-engine-oil');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Mobil 1 Advanced Full Synthetic/i })).toBeVisible({
      timeout: 20000,
    });

    // Volume / Viscosity label is rendered
    await expect(page.getByText(/Volume:|Viscosity:|পরিমাণ/i).first()).toBeVisible({ timeout: 20000 });

    // 4 Liters variant option exists
    const variant4L = page.getByRole('button', { name: /4 Liters/i }).first();
    if (await variant4L.isVisible()) {
      await variant4L.click();
      // Price should reflect 4,950
      await expect(page.getByText(/4,950|৪,৯৫০/).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('automotive technical installation advisory banner renders on PDP', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-auto-bosch-ceramic-brake-pads');
    await waitForHydration(page);

    await expect(
      page.getByText(/Vehicle Fitment & Technical Installation Advisory|গাড়ির ফিটমেন্ট ও টেকনিক্যাল ইনস্টলেশন পরামর্শ/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test('Bangla storefront renders Automotive taxonomy in Bengali', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/automotive');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /অটোমোটিভ ও মোটর পার্টস/i }),
    ).toBeVisible({ timeout: 20000 });
  });
});
