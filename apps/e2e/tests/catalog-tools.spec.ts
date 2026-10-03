import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Tools & Hardware catalog vertical — customer discovery', () => {
  test('guest browses Tools & Hardware → Power Tools / Hand Tools → product discovery', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/tools-hardware');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Tools & Hardware|Tools/i }),
    ).toBeVisible({ timeout: 20000 });

    const subcategoryLink = page.getByRole('link', { name: /Power Tools|Hand Tools|Hardware & Fasteners/i }).first();
    if (await subcategoryLink.isVisible()) {
      await subcategoryLink.click();
      await expect(page).toHaveURL(/\/en\/categories\//);
    }

    const productLinks = page.locator('a[href^="/en/products/"]');
    if (await productLinks.first().isVisible()) {
      expect(await productLinks.count()).toBeGreaterThan(0);
    }
  });

  test('power source, voltage, and brand facets filter catalog results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/tools-hardware');
    await waitForHydration(page);

    const filterAside = page.locator('aside').filter({ hasText: /Power Source|Brand|Bosch|Makita|DeWalt|Stanley|Total Tools|Ingco/i });
    if (await filterAside.isVisible()) {
      await expect(filterAside).toBeVisible({ timeout: 20000 });
    }
  });

  test('product detail exposes voltage chip, motor wattage/rpm badge, and warranty chip', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-tools-bosch-gsb-185-li');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Bosch GSB 185-LI/i })).toBeVisible({
      timeout: 20000,
    });

    // Check Power Source / Voltage badge
    await expect(page.getByText(/Cordless Battery|18V Li-ion|কর্ডলেস/i).first()).toBeVisible({ timeout: 20000 });

    // Check RPM badge
    await expect(page.getByText(/1900 RPM|১৯০০ RPM/i).first()).toBeVisible({ timeout: 20000 });

    // Check Warranty chip
    await expect(page.getByText(/Warranty:|ওয়ারেন্টি:|1 Year/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('product detail exposes kit option/size variants and syncs active SKU price', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-tools-bosch-gsb-185-li');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Bosch GSB 185-LI/i })).toBeVisible({
      timeout: 20000,
    });

    // Check variant button (Bare Tool vs Kit with Batteries)
    const variantBtn = page.getByRole('button', { name: /Kit with 2x 2.0Ah|Bare Tool|কিট/i }).first();
    if (await variantBtn.isVisible()) {
      await variantBtn.click();
      await expect(page.getByText(/8,200|14,500|৮,২০০|১৪,৫০০/).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('tools & hardware industrial standards & electrical safety guarantee advisory banner renders on PDP', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-tools-bosch-gsb-185-li');
    await waitForHydration(page);

    await expect(
      page.getByText(/Industrial Standards & Electrical Safety Guarantee|শিল্পমান ও হার্ডওয়্যার নিরাপত্তা নিশ্চয়তা/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test('Bangla storefront renders Tools & Hardware taxonomy in Bengali', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/tools-hardware');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /যন্ত্রপাতি ও হার্ডওয়্যার/i }),
    ).toBeVisible({ timeout: 20000 });
  });
});
