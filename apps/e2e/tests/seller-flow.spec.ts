import { test, expect, type Page } from '@playwright/test';

const SELLER = { email: 'seller1@gramerbazar.com', password: 'password123' };
const CUSTOMER = { email: 'customer@gramerbazar.com', password: 'password123' };

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

const login = async (page: Page, creds: { email: string; password: string }) => {
  await page.goto('/en/login');
  await waitForHydration(page);
  await page.getByLabel('Email or Phone').fill(creds.email);
  await page.getByLabel('Password').fill(creds.password);
  await page
    .getByRole('main')
    .getByRole('button', { name: /login|sign in/i })
    .click();
};

const expectNoErrorBoundary = async (page: Page) => {
  await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
};

test.describe('Seller E2E Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, SELLER);
    await page.waitForURL(/\/en\/seller/, { timeout: 25000 });
  });

  test('seller login lands on the dashboard with shop KPIs', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Seller Dashboard' }),
    ).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Total Sales').first()).toBeVisible();
    await expect(page.getByText('Active Orders').first()).toBeVisible();
    await expect(page.getByText('Low Stock Products').first()).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test('seller sidebar navigates every seller page', async ({ page }) => {
    test.setTimeout(240000);

    const routes: { label: string; url: RegExp; heading: RegExp }[] = [
      { label: 'My Shop', url: /\/en\/seller\/shop$/, heading: /Shop Settings/ },
      { label: 'Products', url: /\/en\/seller\/products$/, heading: /My Products/ },
      { label: 'Inventory', url: /\/en\/seller\/inventory$/, heading: /Inventory Management/ },
      { label: 'Orders', url: /\/en\/seller\/orders$/, heading: /^Orders$/ },
      { label: 'Coupons', url: /\/en\/seller\/coupons$/, heading: /Shop Coupons/ },
      { label: 'Reports', url: /\/en\/seller\/reports$/, heading: /Reports & Analytics/ },
      { label: 'Wallet', url: /\/en\/seller\/wallet$/, heading: /My Wallet/ },
      { label: 'Messages', url: /\/en\/seller\/messages$/, heading: /^Messages$/ },
      { label: 'Disputes', url: /\/en\/seller\/disputes$/, heading: /Customer Disputes/ },
      { label: 'Profile', url: /\/en\/seller\/profile$/, heading: /Shop Profile/ },
      { label: 'Dashboard', url: /\/en\/seller$/, heading: /Seller Dashboard/ },
    ];

    for (const route of routes) {
      await page
        .getByRole('link', { name: route.label, exact: true })
        .first()
        .click();
      await page.waitForURL(route.url, { timeout: 20000 });
      await expect(
        page.getByRole('heading', { name: route.heading }).first(),
      ).toBeVisible({ timeout: 20000 });
      await expectNoErrorBoundary(page);
    }
  });

  test('seller product list and inventory reflect the API', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const res = await page.request.get(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/seller-portal/products?limit=1`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const items = body.data ?? body;
    expect(Array.isArray(items)).toBeTruthy();

    await page.goto('/en/seller/products');
    if (items.length > 0) {
      // A row from this seller's catalog must render in the table
      const name = items[0].productVariant?.product?.nameEn || items[0].productVariant?.product?.nameBn;
      if (name) {
        await expect(page.getByText(name).first()).toBeVisible({ timeout: 20000 });
      }
    } else {
      await expect(page.getByText(/no products found/i).first()).toBeVisible({ timeout: 20000 });
    }

    await page.goto('/en/seller/inventory');
    await expect(
      page.getByRole('heading', { name: /Inventory Management/ }).first(),
    ).toBeVisible({ timeout: 20000 });
    await expectNoErrorBoundary(page);
  });

  test('seller can update shop settings', async ({ page }) => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const authHeaders = { Authorization: `Bearer ${token}` };

    await page.goto('/en/seller/shop');
    await expect(
      page.getByRole('heading', { name: /Shop Settings/ }).first(),
    ).toBeVisible({ timeout: 20000 });

    const nameField = page.getByLabel('Shop Name (English)');
    await expect(nameField).toBeVisible({ timeout: 20000 });
    const current = await nameField.inputValue();

    // Change the name, save, and verify it actually persisted through the API
    const next = current.endsWith('s') ? current.slice(0, -1) : `${current}s`;
    await nameField.fill(next);
    await page.getByRole('button', { name: /Save Changes/ }).click();
    await expect(
      page.getByText(/Settings saved successfully/i).first(),
    ).toBeVisible({ timeout: 20000 });

    const saved = await page.request.get(`${api}/seller-portal/shop`, {
      headers: authHeaders,
    });
    expect(saved.ok()).toBeTruthy();
    expect((await saved.json()).nameEn).toBe(next);

    // Restore the original value so repeated runs stay idempotent
    await nameField.fill(current);
    await page.getByRole('button', { name: /Save Changes/ }).click();
    await expect(
      page.getByText(/Settings saved successfully/i).first(),
    ).toBeVisible({ timeout: 20000 });

    const restored = await page.request.get(`${api}/seller-portal/shop`, {
      headers: authHeaders,
    });
    expect((await restored.json()).nameEn).toBe(current);
    await expectNoErrorBoundary(page);
  });

  test('seller wallet and payouts pages render financial data', async ({ page }) => {
    await page.goto('/en/seller/wallet');
    await expect(
      page.getByRole('heading', { name: /My Wallet/ }).first(),
    ).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Available Balance/i).first()).toBeVisible();
    await expect(page.getByText(/Recent Transactions/i).first()).toBeVisible();
    await expectNoErrorBoundary(page);
  });
});

test.describe('Seller area access control', () => {
  test('a customer cannot open the seller area', async ({ page }) => {
    await login(page, CUSTOMER);
    await page.waitForURL(/\/(en)\/(profile|admin|seller|rider)/, { timeout: 25000 });

    await page.goto('/en/seller/products');
    // The seller guard returns null and redirects non-sellers to the storefront
    await page.waitForURL(/\/en$/, { timeout: 20000 });
    await expectNoErrorBoundary(page);
  });
});
