import { test, expect, request as playwrightRequest, type Page } from '@playwright/test';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const RIDER = {
  email: 'rider1@gramerbazar.com',
  phone: '+8801700000005',
  password: 'Rider@GramerBazar2026!',
  firstName: 'Babul',
  lastName: 'Mia',
  role: 'RIDER',
};
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
  await expect(page).toHaveURL(/\/(en)\/(customer|profile|admin|seller|rider)/, { timeout: 35000 });
};

const expectNoErrorBoundary = async (page: Page) => {
  await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
};

/**
 * Riders are seeded since this pass (rider1@gramerbazar.com / rider2@
 * gramerbazar.com, password123). If the DB was seeded by an older seeder,
 * fall back to the public registration endpoint (SELLER/RIDER roles allowed).
 */
const ensureRiderAccount = async (
  ctx: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
) => {
  const body = { emailOrPhone: RIDER.email, password: RIDER.password };
  const existing = await ctx.post(`${API}/auth/login`, { data: body });
  if (existing.ok()) return existing.json();

  const created = await ctx.post(`${API}/auth/register`, {
    data: {
      phone: RIDER.phone,
      email: RIDER.email,
      password: RIDER.password,
      firstName: RIDER.firstName,
      lastName: RIDER.lastName,
      role: RIDER.role,
    },
  });
  if (!created.ok()) {
    const text = await created.text();
    if (text.includes('already exists')) {
      return;
    }
    expect(created.ok(), `rider registration failed: ${text}`).toBeTruthy();
  }
  return created.json();
};

const loginApi = async (
  ctx: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
  email: string,
  password: string,
) => {
  const res = await ctx.post(`${API}/auth/login`, { data: { emailOrPhone: email, password } });
  expect(res.ok(), `login failed for ${email}: ${await res.text()}`).toBeTruthy();
  const json = await res.json();
  const token = json.data?.accessToken || json.accessToken;
  return { ...json, accessToken: token };
};

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

test.describe('Rider E2E Workflows', () => {
  test.beforeEach(async ({ page }) => {
    const ctx = await playwrightRequest.newContext();
    await ensureRiderAccount(ctx);
    await ctx.dispose();

    await loginUi(page, RIDER.email, RIDER.password);
  });

  test('rider login lands on the delivery dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' }).first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText('New Assignments').first()).toBeVisible({ timeout: 25000 });
    await expect(page.getByText(/Completed/i).first()).toBeVisible({ timeout: 25000 });
    await expectNoErrorBoundary(page);
  });

  test('rider sidebar navigates every rider page', async ({ page }) => {
    test.setTimeout(240000);

    // The dashboard layout renders the active route title in its header, so
    // every rider page has a stable heading even when its body is empty.
    const routes = [
      { label: /Deliveries/i, path: '/rider/deliveries', heading: /Deliveries/i },
      { label: /Messages/i, path: '/rider/messages', heading: /Messages/i },
      { label: /Rider Profile|Profile/i, path: '/rider/profile', heading: /Profile/i },
      { label: /Dashboard/i, path: '/rider', heading: /Dashboard/i },
    ];

    for (const route of routes) {
      await page.request.get(`/en${route.path}`);
    }

    for (const route of routes) {
      const link = page
        .locator('aside')
        .getByRole('link', { name: route.label })
        .first();
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${route.path.replace(/\//g, '\\/')}$`), {
        timeout: 45000,
      });
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 45000 });
      await expectNoErrorBoundary(page);
    }
  });
});

test.describe('Delivery lifecycle across roles', () => {
  test('customer order → admin assignment → rider completes delivery', async ({ page }) => {
    test.setTimeout(300000);

    const customerCtx = await playwrightRequest.newContext();
    const adminCtx = await playwrightRequest.newContext();
    try {
      // 1. Customer places a COD order
      const customer = await loginApi(customerCtx, CUSTOMER.email, CUSTOMER.password);

      const addresses = await customerCtx.get(`${API}/addresses`, {
        headers: auth(customer.accessToken),
      });
      const addrJson = await addresses.json();
      const addrList = (addrJson.data || addrJson) as { id: string }[];
      let addressId = addrList[0]?.id;
      if (!addressId) {
        const createdAddress = await customerCtx.post(`${API}/addresses`, {
          headers: auth(customer.accessToken),
          data: {
            title: 'Home',
            contactName: 'Rahim Uddin',
            contactPhone: '+8801700000002',
            streetAddress: 'House 12, Road 5, Dhanmondi',
            isDefault: true,
          },
        });
        expect(createdAddress.ok(), await createdAddress.text()).toBeTruthy();
        const createdJson = await createdAddress.json();
        addressId = createdJson.data?.id || createdJson.id;
      }

      const catalog = await customerCtx.get(`${API}/public/catalog/search?limit=1`);
      const catJson = await catalog.json();
      const product = ((catJson.data?.data || catJson.data || catJson) as { id: string }[])[0];
      expect(product?.id).toBeTruthy();

      const checkout = await customerCtx.post(`${API}/orders/checkout`, {
        headers: auth(customer.accessToken),
        data: {
          addressId,
          paymentMethod: 'COD',
          items: [{ sellerProductId: product.id, quantity: 1 }],
        },
      });
      expect(checkout.ok(), await checkout.text()).toBeTruthy();
      const checkoutJson = await checkout.json();
      const orderId = (checkoutJson.data?.order?.id || checkoutJson.order?.id || checkoutJson.data?.id) as string;

      // 2. Admin assigns the order to the rider
      const admin = await loginApi(adminCtx, ADMIN.email, ADMIN.password);
      const riders = await adminCtx.get(`${API}/deliveries/admin/riders`, {
        headers: auth(admin.accessToken),
      });
      const ridersJson = await riders.json();
      const ridersList = (ridersJson.data || ridersJson) as { id: string; phone: string }[];
      const riderId = ridersList.find((r) => r.phone === RIDER.phone)?.id;
      expect(riderId, 'rider should be returned by the admin rider list').toBeTruthy();

      const assign = await adminCtx.post(`${API}/deliveries/admin/assign`, {
        headers: auth(admin.accessToken),
        data: { orderId, riderId },
      });
      expect(assign.ok(), await assign.text()).toBeTruthy();
      const assignJson = await assign.json();
      const deliveryId = (assignJson.data?.id || assignJson.id) as string;

      // 3. Rider progresses the delivery through the UI
      await loginUi(page, RIDER.email, RIDER.password);
      await page.goto(`/en/rider/deliveries/${deliveryId}`);
      await expect(
        page.getByRole('heading', { name: 'Delivery Details' }),
      ).toBeVisible({ timeout: 25000 });

      await page.getByRole('button', { name: 'Accept Assignment' }).click();
      await page.getByRole('button', { name: 'Confirm Pickup' }).click({ timeout: 25000 });
      await page.getByRole('button', { name: 'Out for Delivery' }).click({ timeout: 25000 });
      await page.getByRole('button', { name: 'Mark as Delivered' }).click({ timeout: 25000 });
      await page.getByRole('button', { name: /Yes, mark delivered/i }).click({ timeout: 25000 });

      await expect(
        page.getByText(/This delivery has been completed/i),
      ).toBeVisible({ timeout: 25000 });

      // 4. The order reflects the delivery outcome for the customer
      const order = await customerCtx.get(`${API}/orders/${orderId}`, {
        headers: auth(customer.accessToken),
      });
      expect(order.ok(), `Order fetch failed (${order.status()}): ${await order.text()}`).toBeTruthy();
      const orderBody = await order.json();
      const orderData = orderBody.data || orderBody;
      expect(orderData.status).toBe('DELIVERED');
      expect(orderData.paymentStatus).toBe('PAID');
    } finally {
      await customerCtx.dispose();
      await adminCtx.dispose();
    }
  });
});

test.describe('Rider area access control', () => {
  test('a customer cannot open the rider area', async ({ page }) => {
    await loginUi(page, CUSTOMER.email, CUSTOMER.password);
    await expect(page).toHaveURL(/\/(en)\/(customer|profile|admin|seller|rider)/, { timeout: 25000 });

    await page.goto('/en/rider/deliveries');
    await expect(page.getByText(/Access Denied|403/i)).toBeVisible({ timeout: 20000 });
    await expectNoErrorBoundary(page);
  });
});
