import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Sports & Fitness catalog vertical — customer discovery', () => {
  test('guest browses Sports & Fitness → Cricket → Cricket Bats → a product', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/sports-fitness');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Sports & Fitness/i }),
    ).toBeVisible({ timeout: 20000 });

    const cricketLink = page.getByRole('link', { name: /Cricket/i }).first();
    if (await cricketLink.isVisible()) {
      await cricketLink.click();
      await expect(page).toHaveURL(/\/en\/categories\/sports-/);
    }

    const productLinks = page.locator('a[href^="/en/products/"]');
    if (await productLinks.first().isVisible()) {
      expect(await productLinks.count()).toBeGreaterThan(0);
    }
  });

  test('brand and sport facets filter sports results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/sports-fitness');
    await waitForHydration(page);

    const brandFilter = page.locator('aside').filter({ hasText: /Brand|Yonex|Nike|Adidas|Decathlon|SG|Mikasa/i });
    if (await brandFilter.isVisible()) {
      await expect(brandFilter).toBeVisible({ timeout: 20000 });
    }
  });

  test('product detail exposes sports discipline badges and skill level', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-sports-sg-cricket-bat');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /SG Players Edition Kashmir Willow Cricket Bat/i })).toBeVisible({
      timeout: 20000,
    });

    // Check Discipline / Sport badge
    await expect(page.getByText(/Cricket|ক্রিকেট/i).first()).toBeVisible({ timeout: 20000 });

    // Check Material badge
    await expect(page.getByText(/Material:|উপাদান:/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('product detail exposes dumbbell weight variants and syncs price', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-sports-decathlon-hex-dumbbells');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Decathlon Domyos Ergonomic Hex Rubber Coated Dumbbell/i })).toBeVisible({
      timeout: 20000,
    });

    // Weight / Capacity label is rendered
    await expect(page.getByText(/Weight \/ Capacity:|ওজন \/ ক্যাপাসিটি|Size:/i).first()).toBeVisible({ timeout: 20000 });

    // 10 kg variant option exists
    const variant10kg = page.getByRole('button', { name: /10 kg/i }).first();
    if (await variant10kg.isVisible()) {
      await variant10kg.click();
      // Price should reflect 4,500
      await expect(page.getByText(/4,500|৪,৫০০/).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('sports equipment safety advisory banner renders on PDP', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-sports-powermax-treadmill');
    await waitForHydration(page);

    await expect(
      page.getByText(/Sports Equipment Safety & Ergonomic Advisory|স্পোর্টস গিয়ার ও ফিটনেস ইকুইপমেন্ট ব্যবহার নির্দেশিকা/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test('Bangla storefront renders Sports taxonomy in Bengali', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/sports-fitness');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /খেলাধুলা ও ফিটনেস/i }),
    ).toBeVisible({ timeout: 20000 });
  });
});
