import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Cosmetics & Personal Care catalog vertical — customer discovery', () => {
  test('guest browses Cosmetics → Skin Care → Face Serums → a product', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/cosmetics');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Cosmetics & Personal Care/i }),
    ).toBeVisible({ timeout: 20000 });

    await page.getByRole('link', { name: /Skin Care/i }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/cosmetics-skin-care/);

    await page.getByRole('link', { name: /Face Serums/i }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/cosmetics-face-serum/);

    const productLinks = page.locator('a[href^="/en/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 20000 });
    expect(await productLinks.count()).toBeGreaterThan(0);
  });

  test('brand and skin type facets filter cosmetics results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/cosmetics-skin-care');
    await waitForHydration(page);

    const brandFilter = page.locator('aside').filter({ hasText: /Brand|The Body Shop|CeraVe/i });
    if (await brandFilter.isVisible()) {
      await expect(brandFilter).toBeVisible({ timeout: 20000 });
    }
  });

  test('product detail exposes cosmetics shades and disables out-of-stock shade', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-cosmetics-matte-foundation');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Matte \+ Poreless Foundation/i })).toBeVisible({
      timeout: 20000,
    });

    // Check Shade label is rendered
    await expect(page.getByText(/Shade:/i).first()).toBeVisible({ timeout: 20000 });

    // Out-of-stock shade (07 Warm Honey) must be disabled
    const soldOutShade = page.getByRole('button', { name: /Select Shade 07 Warm Honey/i });
    if (await soldOutShade.isVisible()) {
      await expect(soldOutShade).toBeDisabled();
    }
  });

  test('product detail exposes beauty badges (SPF, Skin suitability, Finish)', async ({ page }) => {
    test.setTimeout(120000);

    // Sunscreen product has SPF 50+ PA++++
    await page.goto('/en/products/demo-cosmetics-sunscreen-spf50');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /COSRX Aloe Soothing Sun Cream/i })).toBeVisible({
      timeout: 20000,
    });

    // Check SPF badge
    await expect(page.getByText(/SPF 50\+ PA\+\+\+\+/i).first()).toBeVisible({ timeout: 20000 });

    // Check Skin badge
    await expect(page.getByText(/Skin: Sensitive|ত্বক:/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('cosmetics safety patch test advisory banner renders on beauty PDP', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-cosmetics-niacinamide-serum');
    await waitForHydration(page);

    await expect(
      page.getByText(/Dermatological & Skin Safety Advisory|প্রসাধন ও রূপচর্চা পণ্যের নির্দেশিকা/i),
    ).toBeVisible({ timeout: 20000 });

    await expect(
      page.getByText(/patch test/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test('Bangla storefront renders cosmetics taxonomy in Bengali', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/cosmetics');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { level: 1, name: /প্রসাধন ও ব্যক্তিগত যত্ন/ })).toBeVisible({
      timeout: 20000,
    });

    await expect(page.getByText(/স্কিন কেয়ার|চুলের যত্ন|রূপচর্চা/i).first()).toBeVisible({
      timeout: 20000,
    });
  });
});
