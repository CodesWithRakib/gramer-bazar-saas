import { test, expect, request as playwrightRequest, type Page } from '@playwright/test';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const SELLER = { email: 'seller1@gramerbazar.com', password: 'Shop@GramerBazar2026!' };
const CUSTOMER = { email: 'customer1@gramerbazar.com', password: 'Customer@GramerBazar2026!' };

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
  await page.getByLabel(/Email or (Phone|Mobile Number)/i).fill(creds.email);
  await page.getByLabel('Password', { exact: true }).fill(creds.password);
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
    await expect(page).toHaveURL(/\/en\/seller/, { timeout: 25000 });
  });

  test('seller login lands on the dashboard with shop KPIs', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Seller dashboard/i }),
    ).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Today's sales/i).first()).toBeVisible();
    await expect(page.getByText(/Today's orders/i).first()).toBeVisible();
    await expect(page.getByText(/Lifetime settled sales/i).first()).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test('seller sidebar navigates every seller page', async ({ page }) => {
    test.setTimeout(240000);

    const routes: { label: string; url: RegExp; heading: RegExp }[] = [
      { label: 'Shop Profile', url: /\/en\/seller\/shop$/, heading: /Shop/i },
      { label: 'Products', url: /\/en\/seller\/products$/, heading: /Product/i },
      { label: 'Orders', url: /\/en\/seller\/orders$/, heading: /Order/i },
      { label: 'Coupons', url: /\/en\/seller\/coupons$/, heading: /Coupon/i },
      { label: 'Sales Reports', url: /\/en\/seller\/reports$/, heading: /Report/i },
      { label: 'Wallet & Payouts', url: /\/en\/seller\/wallet$/, heading: /Wallet/i },
      { label: 'Messages', url: /\/en\/seller\/messages$/, heading: /Message/i },
      { label: 'Disputes', url: /\/en\/seller\/disputes$/, heading: /Dispute/i },
      { label: 'Settings', url: /\/en\/seller\/settings$/, heading: /Setting/i },
      { label: 'Dashboard', url: /\/en\/seller$/, heading: /Dashboard/i },
    ];

    for (const route of routes) {
      const link = page
        .locator('aside')
        .getByRole('link', { name: route.label, exact: true })
        .first();
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await expect(page).toHaveURL(route.url, { timeout: 20000 });
      await expect(
        page.getByRole('heading', { name: route.heading }).first(),
      ).toBeVisible({ timeout: 20000 });
      await expectNoErrorBoundary(page);
    }
  });

  test('seller product list and inventory reflect the API', async ({ page }) => {
    const token = await page.evaluate(
      () => localStorage.getItem('access_token') || localStorage.getItem('token'),
    );
    const res = await page.request.get(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/seller-portal/products?limit=1`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const rawData = body.data ?? body;
    const items = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
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
      page.getByRole('heading', { name: /Inventory/i }).first(),
    ).toBeVisible({ timeout: 20000 });
    await expectNoErrorBoundary(page);
  });

  test('seller can update shop settings', async ({ page }) => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const token = await page.evaluate(
      () => localStorage.getItem('access_token') || localStorage.getItem('token'),
    );
    const authHeaders = { Authorization: `Bearer ${token}` };

    await page.goto('/en/seller/shop');
    await expect(
      page.getByRole('heading', { name: /Shop Profile/i }).first(),
    ).toBeVisible({ timeout: 20000 });

    const nameField = page.getByLabel(/Shop name \(English\)/i);
    await expect(nameField).toBeVisible({ timeout: 20000 });
    const current = await nameField.inputValue();

    // Change the name, save, and verify it actually persisted through the API
    const next = current.endsWith('s') ? current.slice(0, -1) : `${current}s`;
    await nameField.fill(next);
    const savePromise1 = page.waitForResponse(
      (res) => res.url().includes('/seller-portal/shop') && res.request().method() === 'PATCH',
    );
    await page.getByRole('button', { name: /Save changes/i }).click();
    await savePromise1;
    await expect(
      page.getByText(/Shop profile updated successfully/i).first(),
    ).toBeVisible({ timeout: 20000 });

    const saved = await page.request.get(`${api}/seller-portal/shop`, {
      headers: authHeaders,
    });
    expect(saved.ok()).toBeTruthy();
    const savedJson = await saved.json();
    expect(savedJson.data?.nameEn || savedJson.nameEn).toBe(next);

    // Restore the original value so repeated runs stay idempotent
    await nameField.fill(current);
    const savePromise2 = page.waitForResponse(
      (res) => res.url().includes('/seller-portal/shop') && res.request().method() === 'PATCH',
    );
    await page.getByRole('button', { name: /Save changes/i }).click();
    await savePromise2;

    const restored = await page.request.get(`${api}/seller-portal/shop`, {
      headers: authHeaders,
    });
    const restoredJson = await restored.json();
    expect(restoredJson.data?.nameEn || restoredJson.nameEn).toBe(current);
    await expectNoErrorBoundary(page);
  });

  test('seller wallet and payouts pages render financial data', async ({ page }) => {
    await page.goto('/en/seller/wallet');
    await expect(
      page.getByRole('heading', { name: /My wallet|Wallet/i }).first(),
    ).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Available balance/i).first()).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test('seller can update their account contact info', async ({ page }) => {
    await page.goto('/en/seller/profile');
    await expect(
      page.getByRole('heading', { name: /Seller profile|Profile/i }).first(),
    ).toBeVisible({ timeout: 25000 });

    const phoneInput = page.getByLabel(/contact phone/i);
    await expect(phoneInput).toBeVisible({ timeout: 20000 });
    const originalPhone = await phoneInput.inputValue();

    await phoneInput.fill('+8801712345678');
    await page.getByRole('button', { name: /save account info/i }).click();

    await expect(page.getByText(/account info updated/i)).toBeVisible({ timeout: 15000 });

    // Round-trip: the API reflects the new phone for this seller
    const ctx = await playwrightRequest.newContext();
    const apiLogin = await ctx.post(`${API}/auth/login`, {
      data: { emailOrPhone: SELLER.email, password: SELLER.password },
    });
    const loginJson = await apiLogin.json();
    const accessToken = loginJson.data?.accessToken || loginJson.accessToken;
    const me = await ctx.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meJson = await me.json();
    const phone = meJson.data?.phone || meJson.phone;
    expect(phone).toBe('+8801712345678');
    await ctx.dispose();

    // Restore the seeded phone for later tests
    await phoneInput.fill(originalPhone || '+8801711000001');
    await page.getByRole('button', { name: /save account info/i }).click();
    await expect(page.getByText(/account info updated/i)).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Seller area access control', () => {
  test('a customer cannot open the seller area', async ({ page }) => {
    await login(page, CUSTOMER);
    await expect(page).toHaveURL(/\/(en)\/(customer|profile|admin|seller|rider)/, { timeout: 25000 });

    await page.goto('/en/seller/products');
    await expect(page.getByText(/Access Denied|403/i)).toBeVisible({ timeout: 20000 });
    await expectNoErrorBoundary(page);
  });
});
