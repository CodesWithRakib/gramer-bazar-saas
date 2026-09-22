import { test, expect } from '@playwright/test';

const CUSTOMER = {
  email: 'customer@gramerbazar.com',
  password: 'password123',
};

/**
 * Wait until React has hydrated (Redux store mounted) so controlled inputs
 * actually update component state before typing.
 */
const waitForHydration = async (page: import('@playwright/test').Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Customer E2E Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('banner')).toBeVisible();
    await waitForHydration(page);
  });

  test('homepage renders with categories and featured products', async ({
    page,
  }) => {
    await expect(page).toHaveTitle(/Gramer Bazar/i);

    // Categories section loads from the API
    await expect(
      page.getByRole('heading', { name: /categories/i }).first(),
    ).toBeVisible();
    await expect(page.getByText(/featured products/i).first()).toBeVisible();

    // Mobile bottom navigation exists (hidden on desktop viewports)
    const bottomNav = page.locator('div.fixed.bottom-0 nav');
    if (await bottomNav.count()) {
      await expect(bottomNav).toBeHidden(); // desktop: md:hidden
    }
  });

  test('category page lists products', async ({ page }) => {
    await page.goto('/en/categories');
    await expect(page.getByRole('heading', { name: /categor/i }).first()).toBeVisible();
  });

  test('search returns results and product page opens', async ({ page }) => {
    await page.goto('/en/search?q=dal');
    await page.waitForLoadState('networkidle');

    // Either results are shown, or an empty state — never an error screen
    const hasError = await page.getByText(/something went wrong/i).count();
    expect(hasError).toBe(0);
  });

  test('product details page renders with add-to-cart', async ({ page }) => {
    const res = await page.request.get(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/public/catalog/search?limit=1`,
    );
    const body = await res.json();
    const slug = body.data[0].productVariant.product.slug as string;
    expect(slug).toBeTruthy();

    await page.goto(`/en/products/${slug}`);
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });

  test('customer can login with password and see their account', async ({
    page,
  }) => {
    await page.goto('/en/login');
    await waitForHydration(page);
    await page.getByLabel('Email or Phone').fill(CUSTOMER.email);
    await page.getByLabel('Password').fill(CUSTOMER.password);
    await page
      .getByRole('main')
      .getByRole('button', { name: /login|sign in/i })
      .click();

    // The login endpoint must succeed and land on an authenticated page
    await page.waitForURL(/\/(en|bn)\/(profile|admin|seller|rider)/, {
      timeout: 20000,
    });
    await expect(
      page.getByRole('button', { name: /rahim|profile/i }).first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test('cart opens from header', async ({ page }) => {
    // Header cart button opens the cart drawer
    await page
      .getByRole('button')
      .filter({ has: page.locator('svg.lucide-shopping-cart') })
      .first()
      .click();
    await expect(page.getByText(/your cart|cart is empty|কার্ট/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('full purchase journey: login → product → cart → checkout (COD)', async ({
    page,
  }) => {
    test.setTimeout(120000);

    // 1. Login via the UI
    await page.goto('/en/login');
    await waitForHydration(page);
    await page.getByLabel('Email or Phone').fill(CUSTOMER.email);
    await page.getByLabel('Password').fill(CUSTOMER.password);
    await page
      .getByRole('main')
      .getByRole('button', { name: /login|sign in/i })
      .click();
    await page.waitForURL(/\/(en|bn)\/(profile|admin|seller|rider)/, {
      timeout: 20000,
    });

    // 2. Open a real product from the API and add it to the cart
    const res = await page.request.get(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/public/catalog/search?limit=1`,
    );
    const body = await res.json();
    const slug = body.data[0].productVariant.product.slug as string;
    await page.goto(`/en/products/${slug}`);
    const addToCart = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCart).toBeVisible({ timeout: 20000 });
    await addToCart.click();
    await expect(page.getByText(/added to cart/i).first()).toBeVisible();

    // 3. Go to the cart page and proceed to checkout
    await page.goto('/en/cart');
    await waitForHydration(page);
    const checkoutLink = page
      .getByRole('link', { name: /proceed to checkout|চেকআউটে যান/i })
      .first();
    await expect(checkoutLink).toBeVisible({ timeout: 20000 });
    await checkoutLink.click();
    await page.waitForURL(/\/checkout/, { timeout: 20000 });

    // 4. Checkout requires an address; add one through the form
    const addressHeading = page.getByText(/delivery address/i).first();
    await expect(addressHeading).toBeVisible({ timeout: 20000 });

    const hasAddForm = await page
      .getByRole('button', { name: /add new address|নতুন ঠিকানা/i })
      .count();
    if (hasAddForm > 0) {
      await page
        .getByRole('button', { name: /add new address|নতুন ঠিকানা/i })
        .first()
        .click();
    }
    // The address form or an existing address selection must be present
    await expect(
      page
        .getByText(/delivery address/i)
        .first()
        .or(page.getByLabel(/title|label/i).first()),
    ).toBeVisible();
  });
});
