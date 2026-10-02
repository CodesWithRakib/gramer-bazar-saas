import { test, expect, request as playwrightRequest, type Page } from '@playwright/test';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const CUSTOMER = { email: 'customer1@gramerbazar.com', password: 'Customer@GramerBazar2026!' };
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
  await page.getByLabel(/Email or (Phone|Mobile Number)/i).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page
    .getByRole('main')
    .getByRole('button', { name: /login|sign in/i })
    .click();
  await expect(page).toHaveURL(/\/en\/(customer|profile|admin|seller|rider)/, { timeout: 25000 });
};

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

test.describe('Notifications journey', () => {
  test('order status change produces a customer notification visible in the UI', async ({
    page,
  }) => {
    test.setTimeout(180000);
    const customerCtx = await playwrightRequest.newContext();
    const adminCtx = await playwrightRequest.newContext();
    try {
      // Customer places a COD order via the API
      const customerLogin = await customerCtx.post(`${API}/auth/login`, {
        data: { emailOrPhone: CUSTOMER.email, password: CUSTOMER.password },
      });
      expect(customerLogin.ok()).toBeTruthy();
      const customerJson = await customerLogin.json();
      const customerToken = customerJson.data?.accessToken || customerJson.accessToken;

      const addrsRes = await customerCtx.get(`${API}/addresses`, { headers: auth(customerToken) });
      const addrsJson = await addrsRes.json();
      const addrsList = (addrsJson.data || addrsJson) as { id: string }[];
      let addressId = addrsList[0]?.id;
      if (!addressId) {
        const createAddr = await customerCtx.post(`${API}/addresses`, {
          headers: auth(customerToken),
          data: {
            title: 'Home',
            contactName: 'Rahim Uddin',
            contactPhone: '+8801700000002',
            streetAddress: 'House 12, Road 5, Dhanmondi',
            isDefault: true,
          },
        });
        const createAddrJson = await createAddr.json();
        addressId = createAddrJson.data?.id || createAddrJson.id;
      }
      expect(addressId, 'seeded customer must have an address').toBeTruthy();

      const catRes = await customerCtx.get(`${API}/public/catalog/search?limit=1`);
      const catJson = await catRes.json();
      const product = ((catJson.data?.data || catJson.data || catJson) as { id: string }[])[0];
      expect(product?.id).toBeTruthy();

      const checkout = await customerCtx.post(`${API}/orders/checkout`, {
        headers: auth(customerToken),
        data: {
          addressId,
          paymentMethod: 'COD',
          items: [{ sellerProductId: product.id, quantity: 1 }],
        },
      });
      expect(checkout.ok(), await checkout.text()).toBeTruthy();
      const checkoutJson = await checkout.json();
      const orderId = (checkoutJson.data?.order?.id || checkoutJson.order?.id || checkoutJson.data?.id) as string;
      expect(orderId).toBeTruthy();

      // Baseline: read the customer's current notifications
      const beforeRes = await customerCtx.get(`${API}/notifications`, { headers: auth(customerToken) });
      const beforeJson = await beforeRes.json();
      const beforeList = (beforeJson.data?.data || beforeJson.data || beforeJson || []) as Array<{ id: string }>;
      const beforeIds = new Set(beforeList.map((n) => n.id));

      // Admin confirms the order → the customer gets an ORDER_UPDATE notification
      const adminLogin = await adminCtx.post(`${API}/auth/login`, {
        data: { emailOrPhone: ADMIN.email, password: ADMIN.password },
      });
      expect(adminLogin.ok()).toBeTruthy();
      const adminJson = await adminLogin.json();
      const adminToken = adminJson.data?.accessToken || adminJson.accessToken;

      const statusRes = await adminCtx.patch(`${API}/orders/admin/${orderId}/status`, {
        headers: auth(adminToken),
        data: { status: 'CONFIRMED' },
      });
      expect(statusRes.ok(), await statusRes.text()).toBeTruthy();

      const afterRes = await customerCtx.get(`${API}/notifications`, { headers: auth(customerToken) });
      const afterJson = await afterRes.json();
      const afterList = (afterJson.data?.data || afterJson.data || afterJson || []) as Array<{ id: string; title: string; message: string; type: string }>;
      const created = afterList.filter((n) => !beforeIds.has(n.id));
      expect(created.length).toBeGreaterThan(0);
      expect(['ORDER_STATUS_CHANGED', 'ORDER_UPDATE']).toContain(created[0].type);
      expect(created[0].message.toUpperCase()).toContain(orderId.slice(0, 8).toUpperCase());

      // The customer sees it in the notifications page
      await loginUi(page, CUSTOMER.email, CUSTOMER.password);
      await page.goto('/en/customer/notifications');
      await waitForHydration(page);
      await expect(
        page.getByText(new RegExp(orderId.slice(0, 8), 'i')).first(),
      ).toBeVisible({ timeout: 25000 });

      // Mark all read or mark individual items read clears the unread state
      const markAllBtn = page.getByRole('button', { name: /mark all (as )?read/i });
      if (await markAllBtn.isVisible()) {
        await markAllBtn.click();
      } else {
        const markSingle = page.getByRole('button', { name: /mark as read/i }).first();
        if (await markSingle.isVisible()) {
          await markSingle.click();
        }
      }
    } finally {
      await customerCtx.dispose();
      await adminCtx.dispose();
    }
  });
});
