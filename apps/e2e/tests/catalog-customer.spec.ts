import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Electronics catalog vertical — customer discovery', () => {
  test('guest drills Electronics → Computers & PC → PC Components → Processor', async ({
    page,
  }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/electronics');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: 'Electronics' }),
    ).toBeVisible({ timeout: 20000 });
    // The product-type layer and child navigation are generated from the taxonomy.
    await expect(page.getByText('Product Types').first()).toBeVisible({ timeout: 20000 });

    await page.getByRole('link', { name: /Computers & PC/i }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/computers-pc/);
    await expect(
      page.getByRole('heading', { level: 1, name: /Computers & PC/i }),
    ).toBeVisible({ timeout: 20000 });

    await page.getByRole('link', { name: /PC Components/i }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/pc-components/);

    await page.getByRole('link', { name: /^Processor$/ }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/processor/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Processor' }),
    ).toBeVisible({ timeout: 20000 });

    const productLinks = page.locator('a[href^="/en/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 20000 });
    expect(await productLinks.count()).toBeGreaterThan(0);
  });

  test('dynamic attribute filter narrows the processor results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/processor');
    await waitForHydration(page);

    const cards = page.locator('a[href^="/en/products/"]');
    await expect(cards.first()).toBeVisible({ timeout: 20000 });
    const before = await cards.count();

    // The "Socket" facet is generated from the processor product type schema.
    const sidebar = page.locator('aside').filter({ hasText: 'Socket' });
    await expect(sidebar.getByText('Socket', { exact: true })).toBeVisible({ timeout: 20000 });
    await sidebar.getByText('AM5', { exact: true }).first().click();

    await expect(page).toHaveURL(/attributes=/, { timeout: 20000 });
    await expect
      .poll(async () => cards.count(), { timeout: 20000 })
      .toBeLessThan(before);

    // The remaining result set must contain the AM5 part.
    await expect(page.getByText(/AMD Ryzen 5 7600/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('product details expose grouped, attribute-driven specifications', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/amd-ryzen-5-7600');
    await waitForHydration(page);

    await page.getByRole('tab', { name: /Specifications/i }).click();
    await expect(page.getByText('Product Specifications')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Socket', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('AM5', { exact: true }).first()).toBeVisible();
  });

  test('Bangla storefront renders the same Electronics taxonomy', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/electronics');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /ইলেকট্রনিক্স/ }),
    ).toBeVisible({ timeout: 20000 });
  });
});
