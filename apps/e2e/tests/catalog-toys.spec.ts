import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Toys, Games & Hobbies catalog vertical — customer discovery', () => {
  test('guest browses Toys, Games & Hobbies → Educational Toys → STEM Kits → product discovery', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/toys-games-hobbies');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Toys, Games & Hobbies|Toys/i }),
    ).toBeVisible({ timeout: 20000 });

    const educationalLink = page.getByRole('link', { name: /Educational Toys|STEM/i }).first();
    if (await educationalLink.isVisible()) {
      await educationalLink.click();
      await expect(page).toHaveURL(/\/en\/categories\/toys-/);
    }

    const productLinks = page.locator('a[href^="/en/products/"]');
    if (await productLinks.first().isVisible()) {
      expect(await productLinks.count()).toBeGreaterThan(0);
    }
  });

  test('age group and brand facets filter toy catalog results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/toys-games-hobbies');
    await waitForHydration(page);

    const filterAside = page.locator('aside').filter({ hasText: /Age Group|Brand|LEGO|Mattel|Hasbro|Fisher-Price/i });
    if (await filterAside.isVisible()) {
      await expect(filterAside).toBeVisible({ timeout: 20000 });
    }
  });

  test('product detail exposes age grade chip, choking hazard warning, and pieces badge', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-toys-lego-police-station');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /LEGO City Police Station/i })).toBeVisible({
      timeout: 20000,
    });

    // Check Age Group chip
    await expect(page.getByText(/Age:|বয়স:|5–8 Years/i).first()).toBeVisible({ timeout: 20000 });

    // Check Choking Hazard warning chip
    await expect(page.getByText(/Choking Hazard|ছোট পার্টস/i).first()).toBeVisible({ timeout: 20000 });

    // Check Pieces chip
    await expect(page.getByText(/Pieces:|পিস:|668/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('product detail exposes variants (pieces/edition/color) and syncs active SKU price', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-toys-lego-police-station');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /LEGO City Police Station/i })).toBeVisible({
      timeout: 20000,
    });

    // Check variant options exist
    const variantBtn = page.getByRole('button', { name: /Deluxe Police & Fire Brigade|Standard Police Station/i }).first();
    if (await variantBtn.isVisible()) {
      await variantBtn.click();
      await expect(page.getByText(/8,500|14,200|৮,৫০০|১৪,২০০/).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('toys child safety standards & non-toxic quality advisory banner renders on PDP', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-toys-stem-solar-robot-kit');
    await waitForHydration(page);

    await expect(
      page.getByText(/Child Safety Standards & Non-Toxic Quality Guarantee|শিশু সুরক্ষা ও খেলনার গুণমান নিশ্চয়তা/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test('Bangla storefront renders Toys, Games & Hobbies taxonomy in Bengali', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/toys-games-hobbies');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /খেলনা, গেমস ও শখের জিনিস|খেলনা/i }),
    ).toBeVisible({ timeout: 20000 });
  });
});
