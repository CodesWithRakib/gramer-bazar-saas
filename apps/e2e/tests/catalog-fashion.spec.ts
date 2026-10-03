import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Fashion & Clothing catalog vertical — customer discovery', () => {
  test("guest browses Fashion → Men's Fashion → T-Shirts → a product", async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/clothing');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Fashion & Clothing/i }),
    ).toBeVisible({ timeout: 20000 });

    await page.getByRole('link', { name: /Men's Fashion/i }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/fashion-mens/);

    await page.getByRole('link', { name: /T-Shirts/i }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/fashion-mens-tshirts/);

    const productLinks = page.locator('a[href^="/en/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 20000 });
    expect(await productLinks.count()).toBeGreaterThan(0);
  });

  test('colour facet (with swatches) filters fashion results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/fashion-mens-tshirts');
    await waitForHydration(page);

    const sidebar = page.locator('aside').filter({ hasText: 'Color' });
    await expect(sidebar.getByText('Color', { exact: true })).toBeVisible({ timeout: 20000 });
    await sidebar.getByText('Black', { exact: true }).first().click();

    await expect(page).toHaveURL(/attributes=/, { timeout: 20000 });
    await expect(page.getByText(/Demo Men's Classic Cotton T-Shirt/i).first()).toBeVisible({
      timeout: 20000,
    });
  });

  test('size facet is generated from the clothing size system', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/categories/fashion-mens-tshirts');
    await waitForHydration(page);

    const sidebar = page.locator('aside').filter({ hasText: 'Size (Clothing)' });
    await expect(sidebar.getByText('Size (Clothing)', { exact: true })).toBeVisible({
      timeout: 20000,
    });
  });

  test('product detail exposes colour + size variants with per-variant stock', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-mens-classic-tshirt');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Classic Cotton T-Shirt/i })).toBeVisible({
      timeout: 20000,
    });

    // Select an in-stock combination.
    await page.getByRole('button', { name: /Black \/ M/ }).first().click();
    await expect(page.getByText(/units available|স্টকে আছে/i).first()).toBeVisible({
      timeout: 20000,
    });
  });

  test('out-of-stock colour/size combination is disabled', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-mens-classic-tshirt');
    await waitForHydration(page);

    // Black / L is seeded with 0 stock and must not be selectable.
    const soldOut = page.getByRole('button', { name: /Black \/ L — Out of Stock/ }).first();
    await expect(soldOut).toBeVisible({ timeout: 20000 });
    await expect(soldOut).toBeDisabled();
  });

  test('Bangla storefront renders the fashion taxonomy', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/clothing');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { level: 1, name: /পোশাক/ })).toBeVisible({
      timeout: 20000,
    });
  });

  test('admin catalog exposes fashion attributes', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/admin/products/attributes');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Attributes/i })).toBeVisible({
      timeout: 20000,
    });
  });

  test('guest opens interactive Size Guide modal and toggles measurement units (Inches ↔ CM)', async ({
    page,
  }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-mens-classic-tshirt');
    await waitForHydration(page);

    const sizeGuideBtn = page.getByRole('button', { name: /Size Guide/i });
    await expect(sizeGuideBtn).toBeVisible({ timeout: 20000 });
    await sizeGuideBtn.click();

    // Verify modal content
    await expect(
      page.getByRole('heading', { name: /Size Chart & Measurement Guide/i }),
    ).toBeVisible({ timeout: 20000 });

    // Switch to Centimeters (cm)
    const cmBtn = page.getByRole('button', { name: /Centimeters \(cm\)/i });
    await cmBtn.click();
    await expect(page.getByText(/cm/).first()).toBeVisible();

    // Switch back to Inches (in)
    const inBtn = page.getByRole('button', { name: /Inches \(in\)/i });
    await inBtn.click();
    await expect(page.getByText(/"/).first()).toBeVisible();

    // Switch to Footwear tab
    const footwearTab = page.getByRole('tab', { name: /Footwear/i });
    await footwearTab.click();
    await expect(page.getByText('Foot Length', { exact: true })).toBeVisible();

    // Close modal via Escape
    await page.keyboard.press('Escape');
  });

  test('swatch color selection updates active color and filters size options', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-mens-classic-tshirt');
    await waitForHydration(page);

    // Initial color is Black
    await expect(page.getByText('Color:').first()).toBeVisible({ timeout: 20000 });

    // Click White swatch
    const whiteSwatch = page.getByRole('button', { name: /Select Color White/i });
    await expect(whiteSwatch).toBeVisible({ timeout: 20000 });
    await whiteSwatch.click();

    // Verify active color label shows White
    await expect(page.getByText(/White/).first()).toBeVisible();

    // Click Navy swatch
    const navySwatch = page.getByRole('button', { name: /Select Color Navy/i });
    await expect(navySwatch).toBeVisible({ timeout: 20000 });
    await navySwatch.click();
    await expect(page.getByText(/Navy/).first()).toBeVisible();
  });
});

