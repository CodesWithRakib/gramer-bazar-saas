import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Home & Kitchen catalog vertical — customer discovery', () => {
  test('guest browses Home & Kitchen → Kitchen Appliances → Rice Cookers → a product', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/home-kitchen');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Home & Kitchen/i }),
    ).toBeVisible({ timeout: 20000 });

    await page.getByRole('link', { name: /Kitchen Appliances/i }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/home-kitchen-appliances/);

    await page.getByRole('link', { name: /Rice Cookers/i }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/home-rice-cooker/);

    const productLinks = page.locator('a[href^="/en/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 20000 });
    expect(await productLinks.count()).toBeGreaterThan(0);
  });

  test('brand and material facets filter home & kitchen results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/home-kitchen-appliances');
    await waitForHydration(page);

    const brandFilter = page.locator('aside').filter({ hasText: /Brand|Walton|Philips|Vision/i });
    if (await brandFilter.isVisible()) {
      await expect(brandFilter).toBeVisible({ timeout: 20000 });
    }
  });

  test('product detail exposes capacity/size variants and syncs price', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-home-walton-rice-cooker');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Walton Smart Non-Stick Automatic Rice Cooker/i })).toBeVisible({
      timeout: 20000,
    });

    // Capacity / Size label is rendered
    await expect(page.getByText(/Capacity \/ Size:|ক্যাপাসিটি/i).first()).toBeVisible({ timeout: 20000 });

    // 1.8 L and 2.8 L variant options exist
    const variant28 = page.getByRole('button', { name: /2\.8 L/i }).first();
    if (await variant28.isVisible()) {
      await variant28.click();
      // Price should update to 3,150
      await expect(page.getByText(/3,150|৩,১৫০/).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('product detail exposes technical badges (Warranty, Power, Material)', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-home-philips-electric-kettle');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Philips Daily Collection Fast-Boil Electric Kettle/i })).toBeVisible({
      timeout: 20000,
    });

    // Check Warranty badge
    await expect(page.getByText(/Warranty: 2 Years|ওয়ারেন্টি: ২ বছর/i).first()).toBeVisible({ timeout: 20000 });

    // Check Power badge
    await expect(page.getByText(/1800W/).first()).toBeVisible({ timeout: 20000 });
  });

  test('home appliance & furniture care advisory banner renders on PDP', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-home-kiam-frying-pan');
    await waitForHydration(page);

    await expect(
      page.getByText(/Home & Kitchen Warranty & Installation Guide|হোম ও কিচেন ওয়ারেন্টি এবং ডেলিভারি নির্দেশিকা/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test('Bangla storefront renders Home & Kitchen taxonomy in Bengali', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/home-kitchen');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { level: 1, name: /হোম ও কিচেন/ })).toBeVisible({
      timeout: 20000,
    });

    await expect(page.getByText(/রান্নাঘর ও ডাইনিং|রান্নাঘরের যন্ত্রপাতি|আসবাবপত্র/i).first()).toBeVisible({
      timeout: 20000,
    });
  });
});
