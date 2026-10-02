import { test, expect, type Page } from '@playwright/test';

const CUSTOMER = { email: 'customer1@gramerbazar.com', password: 'Customer@GramerBazar2026!' };
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
  await page.getByLabel(/Email or (Phone|Mobile Number)/i).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page
    .getByRole('main')
    .getByRole('button', { name: /login|sign in/i })
    .click();
  await expect(page).toHaveURL(/\/(en|bn)\/(customer|profile)/, { timeout: 25000 });
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
    const body = await res.json();
    const items = Array.isArray(body.data) ? body.data : (body.data?.data || []);
    const first = items[0];
    const slug = (first?.slug || first?.productVariant?.product?.slug) as string;
    expect(slug).toBeTruthy();
    await page.goto(`/en/products/${slug}`);
    await waitForHydration(page);

    // Add via the heart button (handles both un-wishlisted and already wishlisted items idempotently)
    const heart = page
      .getByRole('button', { name: /add to wishlist|remove from wishlist/i })
      .or(page.locator('button[title*="wishlist"]'))
      .first();
    await expect(heart).toBeVisible({ timeout: 20000 });
    const title = await heart.getAttribute('title');
    if (!title || /add to wishlist|উইশলিস্টে যোগ করুন/i.test(title)) {
      await heart.click();
      await expect(page.getByText(/wishlist/i).first()).toBeVisible({ timeout: 15000 });
    }

    // The wishlist page shows the item (not the empty state)
    await page.goto('/en/customer/wishlist');
    await expect(page.getByRole('heading', { name: 'My Wishlist' })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText(/your wishlist is empty/i)).toHaveCount(0);

    // Remove it again through the trash button (covers the remove path)
    const removeBtn = page
      .getByRole('button', { name: /remove .* from wishlist|remove from wishlist/i })
      .or(page.locator('button[title*="wishlist"]'))
      .first();
    await expect(removeBtn).toBeVisible({ timeout: 20000 });
    await removeBtn.click();
    await expect(page.getByText(/removed from wishlist/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
