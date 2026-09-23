import { test, expect, type Page } from '@playwright/test';

const CUSTOMER = { email: 'customer@gramerbazar.com', password: 'password123' };
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

const loginUi = async (page: Page, email: string, password: string) => {
  await page.goto('/en/login');
  await waitForHydration(page);
  await page.getByLabel('Email or Phone').fill(email);
  await page.getByLabel('Password').fill(password);
  await page
    .getByRole('main')
    .getByRole('button', { name: /login|sign in/i })
    .click();
  await page.waitForURL(/\/en\/profile/, { timeout: 25000 });
};

test.describe('Wishlist journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginUi(page, CUSTOMER.email, CUSTOMER.password);
  });

  test('customer adds a product from its details page and sees it on the wishlist page', async ({
    page,
  }) => {
    test.setTimeout(120000);

    // Pick a real product from the API
    const res = await page.request.get(`${API}/public/catalog/search?limit=1`);
    const slug = (
      (await res.json()).data as Array<{ productVariant: { product: { slug: string } } }>
    )[0].productVariant.product.slug;
    await page.goto(`/en/products/${slug}`);
    await waitForHydration(page);

    // Add via the heart button
    const heart = page.getByRole('button', { name: 'Add to wishlist' });
    await expect(heart).toBeVisible({ timeout: 20000 });
    await heart.click();
    await expect(page.getByText(/added to wishlist/i).first()).toBeVisible();

    // The wishlist page shows the item (not the empty state)
    await page.goto('/en/wishlist');
    await expect(page.getByRole('heading', { name: 'My Wishlist' })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText(/your wishlist is empty/i)).toHaveCount(0);

    // Remove it again through the trash button (covers the remove path)
    await page.getByRole('button', { name: 'Remove from wishlist' }).first().click();
    await expect(page.getByText(/removed from wishlist/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
