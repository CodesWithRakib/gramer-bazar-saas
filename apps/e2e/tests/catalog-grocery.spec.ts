import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Grocery & Daily Essentials catalog vertical — customer discovery', () => {
  test('guest browses Grocery → Rice & Grains → Rice → a rice product', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/grocery');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Grocery & Daily Essentials/i }),
    ).toBeVisible({ timeout: 20000 });

    await page.getByRole('link', { name: /Rice & Grains/i }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/grocery-rice-grains/);

    await page.getByRole('link', { name: /^Rice$/ }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/grocery-rice/);

    const productLinks = page.locator('a[href^="/en/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 20000 });
    expect(await productLinks.count()).toBeGreaterThan(0);
  });

  test('dynamic origin facet narrows grocery results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/grocery-rice-grains');
    await waitForHydration(page);

    const cards = page.locator('a[href^="/en/products/"]');
    await expect(cards.first()).toBeVisible({ timeout: 20000 });
    const before = await cards.count();

    const sidebar = page.locator('aside').filter({ hasText: 'Origin' });
    await expect(sidebar.getByText('Origin', { exact: true })).toBeVisible({ timeout: 20000 });
    await sidebar.getByText('Bangladesh', { exact: true }).first().click();

    await expect(page).toHaveURL(/attributes=/, { timeout: 20000 });
    await expect
      .poll(async () => cards.count(), { timeout: 20000 })
      .toBeLessThanOrEqual(before);
    await expect(page.getByText(/Demo Miniket Rice/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('grocery product details expose structured specs (weight/unit/origin)', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-miniket-rice');
    await waitForHydration(page);

    await page.getByRole('tab', { name: /Specifications/i }).click();
    await expect(page.getByText('Product Specifications')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Origin', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Bangladesh', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Rice Type', { exact: true }).first()).toBeVisible();
  });

  test('grocery shelves mix weight variants for a single product', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-miniket-rice');
    await waitForHydration(page);

    // 1 kg / 5 kg / 25 kg are variants — never categories.
    await expect(page.getByText(/1 kg/i).first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/5 kg/i).first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/25 kg/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('out-of-stock grocery product is not purchasable', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-frozen-chicken-nuggets');
    await waitForHydration(page);

    await expect(page.getByText(/Out of Stock/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('Bangla storefront renders the grocery taxonomy', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/grocery');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { level: 1, name: /মুদি/ })).toBeVisible({
      timeout: 20000,
    });
  });

  test('admin catalog exposes grocery product types', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/admin/products/product-types');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Product Types/i })).toBeVisible({
      timeout: 20000,
    });
  });

  test('grocery details expose origin badge and fresh quality guarantee advisory', async ({
    page,
  }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-miniket-rice');
    await waitForHydration(page);

    // Origin badge
    await expect(page.getByText(/Origin: Bangladesh/i).first()).toBeVisible({ timeout: 20000 });

    // Fresh Farm & Quality Hygiene Guarantee advisory card
    await expect(
      page.getByText(/Fresh Farm & Quality Hygiene Guarantee|খামার তাজা ও স্বাস্থ্যকর পণ্য নিশ্চয়তা/i).first(),
    ).toBeVisible({ timeout: 20000 });
  });

  test('grocery details render unit price breakdown', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-miniket-rice');
    await waitForHydration(page);

    // Check pricing box has unit indicator (/ kg)
    await expect(page.getByText(/\/ kg/i).first()).toBeVisible({ timeout: 20000 });
  });
});

