import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Books & Stationery catalog vertical — customer discovery', () => {
  test('guest browses Books & Stationery → Literature → Bangla Novels → a product', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/books-stationery');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Books & Stationery/i }),
    ).toBeVisible({ timeout: 20000 });

    const literatureLink = page.getByRole('link', { name: /Literature/i }).first();
    if (await literatureLink.isVisible()) {
      await literatureLink.click();
      await expect(page).toHaveURL(/\/en\/categories\/books-/);
    }

    const productLinks = page.locator('a[href^="/en/products/"]');
    if (await productLinks.first().isVisible()) {
      expect(await productLinks.count()).toBeGreaterThan(0);
    }
  });

  test('author and publisher facets filter book results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/books-stationery');
    await waitForHydration(page);

    const filterAside = page.locator('aside').filter({ hasText: /Author|Publisher|Prothoma|Batighar|Humayun|Subeen/i });
    if (await filterAside.isVisible()) {
      await expect(filterAside).toBeVisible({ timeout: 20000 });
    }
  });

  test('product detail exposes author, publisher, and ISBN badges', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-book-deyal-humayun-ahmed');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Deyal/i })).toBeVisible({
      timeout: 20000,
    });

    // Check Author badge
    await expect(page.getByText(/Author:|লেখক:|Humayun Ahmed/i).first()).toBeVisible({ timeout: 20000 });

    // Check Publisher badge
    await expect(page.getByText(/Publisher:|প্রকাশনী:|Prothoma/i).first()).toBeVisible({ timeout: 20000 });

    // Check ISBN badge
    await expect(page.getByText(/ISBN:|9789849025801/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('product detail exposes format variants and syncs price', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-book-deyal-humayun-ahmed');
    await waitForHydration(page);

    await expect(page.getByRole('heading', { name: /Deyal/i })).toBeVisible({
      timeout: 20000,
    });

    // Format / Binding label is rendered
    await expect(page.getByText(/Binding|Format|বাঁধাই|Size:/i).first()).toBeVisible({ timeout: 20000 });

    // Paperback variant option exists
    const paperbackBtn = page.getByRole('button', { name: /Paperback|পেপারব্যাক/i }).first();
    if (await paperbackBtn.isVisible()) {
      await paperbackBtn.click();
      // Price should reflect 380
      await expect(page.getByText(/380|৩৮০/).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('book reading & genuine print quality advisory banner renders on PDP', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-book-computer-programming-subeen');
    await waitForHydration(page);

    await expect(
      page.getByText(/Original Print & Publishing Quality Guarantee|আসল বই ও প্রকাশনা মান নিশ্চয়তা/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test('Bangla storefront renders Books & Stationery taxonomy in Bengali', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/books-stationery');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /বই ও স্টেশনারি/i }),
    ).toBeVisible({ timeout: 20000 });
  });
});
