import { test, expect, request as playwrightRequest, type Page } from '@playwright/test';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const CUSTOMER = { email: 'customer@gramerbazar.com', password: 'password123' };
const ADMIN = { email: 'admin@gramerbazar.com', password: 'password123' };

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
  await page.waitForURL(/\/en\/(profile|admin|seller|rider)/, { timeout: 25000 });
};

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

test.describe('Notifications journey', () => {
  test('order status change produces a customer notification visible in the UI', async ({
    page,
  }) => {
    test.setTimeout(180000);
    const ctx = await playwrightRequest.newContext();
    try {
      // Customer places a COD order via the API
      const customer = await (
        await ctx.post(`${API}/auth/login`, {
          data: { emailOrPhone: CUSTOMER.email, password: CUSTOMER.password },
        })
      ).json();

      const addresses = await (await ctx.get(`${API}/addresses`, { headers: auth(customer.accessToken) })).json();
      const addressId = addresses[0]?.id;
      expect(addressId, 'seeded customer must have an address').toBeTruthy();

      const catalog = await (await ctx.get(`${API}/public/catalog/search?limit=1`)).json();
      const product = catalog.data[0];
      expect(product?.id).toBeTruthy();

      const checkout = await ctx.post(`${API}/orders/checkout`, {
        headers: auth(customer.accessToken),
        data: {
          addressId,
          paymentMethod: 'COD',
          items: [{ sellerProductId: product.id, quantity: 1 }],
        },
      });
      expect(checkout.ok(), await checkout.text()).toBeTruthy();
      const orderId = (await checkout.json()).order.id as string;

      // Baseline: read the customer's current notifications
      const before = await (
        await ctx.get(`${API}/notifications`, { headers: auth(customer.accessToken) })
      ).json();
      const beforeIds = new Set((before as Array<{ id: string }>).map((n) => n.id));

      // Admin confirms the order → the customer gets an ORDER_UPDATE notification
      const admin = await (
        await ctx.post(`${API}/auth/login`, {
          data: { emailOrPhone: ADMIN.email, password: ADMIN.password },
        })
      ).json();
      const statusRes = await ctx.patch(`${API}/orders/admin/${orderId}/status`, {
        headers: auth(admin.accessToken),
        data: { status: 'CONFIRMED' },
      });
      expect(statusRes.ok(), await statusRes.text()).toBeTruthy();

      const after = await (
        await ctx.get(`${API}/notifications`, { headers: auth(customer.accessToken) })
      ).json();
      const created = (after as Array<{ id: string; title: string; message: string; type: string }>).filter(
        (n) => !beforeIds.has(n.id),
      );
      expect(created.length).toBeGreaterThan(0);
      expect(created[0].type).toBe('ORDER_UPDATE');
      expect(created[0].message).toContain(orderId.slice(0, 8));

      // The customer sees it in the notifications page
      await loginUi(page, CUSTOMER.email, CUSTOMER.password);
      await page.goto('/en/notifications');
      await waitForHydration(page);
      await expect(
        page.getByText(new RegExp(orderId.slice(0, 8))),
      ).toBeVisible({ timeout: 20000 });

      // Mark all as read clears the unread dots
      await page.getByRole('button', { name: /mark all as read/i }).click();
      await expect(page.locator('button:has-text("Mark read")')).toHaveCount(0, {
        timeout: 15000,
      });
    } finally {
      await ctx.dispose();
    }
  });
});
