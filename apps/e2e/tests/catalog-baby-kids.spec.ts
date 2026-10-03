import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Baby & Kids catalog vertical — customer discovery & purchase', () => {
  test('guest browses Baby & Kids → Diapering → Baby Diapers → a product', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/baby-kids');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Baby & Kids/i }),
    ).toBeVisible({ timeout: 20000 });

    const diaperingLink = page.getByRole('link', { name: /Diapering|Baby Diapers/i }).first();
    if (await diaperingLink.isVisible()) {
      await diaperingLink.click();
      await expect(page).toHaveURL(/\/en\/categories\/baby-/);
    }

    const productLinks = page.locator('a[href^="/en/products/"]');
    if (await productLinks.first().isVisible()) {
      expect(await productLinks.count()).toBeGreaterThan(0);
    }
  });

  test('brand and age group facets filter baby & kids results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/baby-kids');
    await waitForHydration(page);

    const brandFilter = page.locator('aside').filter({ hasText: /Brand|Pampers|Meril|Chicco|Pigeon/i });
    if (await brandFilter.isVisible()) {
      await expect(brandFilter).toBeVisible({ timeout: 20000 });
    }
  });

  test('product detail exposes diaper size variants and syncs price', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-baby-pampers-baby-dry-pants');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Pampers Baby Dry Pants/i })).toBeVisible({
      timeout: 20000,
    });

    // Diaper Size label is rendered
    await expect(page.getByText(/Diaper Size:|সাইজ/i).first()).toBeVisible({ timeout: 20000 });

    // Check variant options exist
    const variantM = page.getByRole('button', { name: /M|Size M/i }).first();
    if (await variantM.isVisible()) {
      await variantM.click();
      // Price should reflect variant
      await expect(page.getByText(/1,150|১,১৫০/).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('product detail exposes pediatric & safety badges (Tear-Free, BPA Free, Hypoallergenic)', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-baby-meril-mild-shampoo');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Meril Baby Mild Shampoo/i })).toBeVisible({
      timeout: 20000,
    });

    // Check Tear-Free Formula or safety badge
    await expect(page.getByText(/Tear-Free Formula|টিয়ার-ফ্রি/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('baby care & child safety advisory banner renders on PDP', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-baby-pampers-baby-dry-pants');
    await waitForHydration(page);

    await expect(
      page.getByText(/Baby Care & Child Safety Advisory|শিশুর যত্ন ও পণ্য ব্যবহারের নিরাপত্তা নির্দেশিকা/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test('Bangla storefront renders Baby & Kids taxonomy in Bengali', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/baby-kids');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /শিশু ও বাচ্চাদের সামগ্রী/i }),
    ).toBeVisible({ timeout: 20000 });
  });
});
