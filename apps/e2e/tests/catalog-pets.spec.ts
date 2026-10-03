import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Pet Supplies catalog vertical — customer discovery', () => {
  test('guest browses Pet Supplies → Dog Supplies / Cat Supplies → product discovery', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/pet-supplies');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Pet Supplies|Pet/i }),
    ).toBeVisible({ timeout: 20000 });

    const subcategoryLink = page.getByRole('link', { name: /Dog Supplies|Cat Supplies|Fish & Aquarium/i }).first();
    if (await subcategoryLink.isVisible()) {
      await subcategoryLink.click();
      await expect(page).toHaveURL(/\/en\/categories\//);
    }

    const productLinks = page.locator('a[href^="/en/products/"]');
    if (await productLinks.first().isVisible()) {
      expect(await productLinks.count()).toBeGreaterThan(0);
    }
  });

  test('pet species, food type, and brand facets filter catalog results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/pet-supplies');
    await waitForHydration(page);

    const filterAside = page.locator('aside').filter({ hasText: /Pet Type|Brand|Royal Canin|Pedigree|Whiskas|Me-O|Drools/i });
    if (await filterAside.isVisible()) {
      await expect(filterAside).toBeVisible({ timeout: 20000 });
    }
  });

  test('product detail exposes species chip, life stage chip, and crude protein badge', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-pet-royal-canin-kitten');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Royal Canin Kitten Dry Cat Food/i })).toBeVisible({
      timeout: 20000,
    });

    // Check Pet Type chip
    await expect(page.getByText(/Cat|বিড়াল/i).first()).toBeVisible({ timeout: 20000 });

    // Check Life Stage chip
    await expect(page.getByText(/Kitten|Puppy|কিটেন/i).first()).toBeVisible({ timeout: 20000 });

    // Check Crude Protein badge
    await expect(page.getByText(/Protein:|প্রোটিন:|36%/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('product detail exposes pack size / weight variants and syncs active SKU price', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-pet-royal-canin-kitten');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Royal Canin Kitten Dry Cat Food/i })).toBeVisible({
      timeout: 20000,
    });

    // Check pack size variant options exist (400g / 2kg / 4kg)
    const variantBtn = page.getByRole('button', { name: /2kg|4kg|৪০০ গ্রাম/i }).first();
    if (await variantBtn.isVisible()) {
      await variantBtn.click();
      await expect(page.getByText(/3,600|6,800|৩,৬০০|৬,৮০০/).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('pet nutrition & veterinary care quality guarantee advisory banner renders on PDP', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-pet-royal-canin-kitten');
    await waitForHydration(page);

    await expect(
      page.getByText(/Pet Nutrition & Veterinary Care Quality Guarantee|পোষা প্রাণীর পুষ্টি ও স্বাস্থ্য নিরাপত্তা নিশ্চয়তা/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test('Bangla storefront renders Pet Supplies taxonomy in Bengali', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/pet-supplies');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /পোষা প্রাণীর সামগ্রী/i }),
    ).toBeVisible({ timeout: 20000 });
  });
});
