import { test, expect, request as playwrightRequest, type Page } from '@playwright/test';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const RIDER = {
  email: 'rider1@gramerbazar.com',
  phone: '+8801700000091',
  password: 'password123',
  firstName: 'Babul',
  lastName: 'Mia',
  role: 'RIDER',
};
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
};

const expectNoErrorBoundary = async (page: Page) => {
  await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
};

/**
 * The seed data has no rider account, so make sure one exists.
 * Registration is public and allows the SELLER/RIDER roles.
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
  expect(created.ok(), `rider registration failed: ${await created.text()}`).toBeTruthy();
  return created.json();
};

const loginApi = async (
  ctx: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
  email: string,
  password: string,
) => {
  const res = await ctx.post(`${API}/auth/login`, { data: { emailOrPhone: email, password } });
  expect(res.ok(), `login failed for ${email}: ${await res.text()}`).toBeTruthy();
  return res.json();
};

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

test.describe('Rider E2E Workflows', () => {
  test.beforeEach(async ({ page }) => {
    const ctx = await playwrightRequest.newContext();
    await ensureRiderAccount(ctx);
    await ctx.dispose();

    await loginUi(page, RIDER.email, RIDER.password);
    await page.waitForURL(/\/en\/rider/, { timeout: 25000 });
  });

  test('rider login lands on the delivery dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' }).first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText('New Assignments').first()).toBeVisible();
    await expect(page.getByText('Completed').first()).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test('rider sidebar navigates every rider page', async ({ page }) => {
    test.setTimeout(240000);

    // The dashboard layout renders the active route title in its header, so
    // every rider page has a stable heading even when its body is empty.
    const routes = [
      { label: 'Deliveries', path: '/rider/deliveries', heading: 'Deliveries' },
      { label: 'Messages', path: '/rider/messages', heading: 'Messages' },
      { label: 'Profile', path: '/rider/profile', heading: 'Profile' },
      { label: 'Dashboard', path: '/rider', heading: 'Dashboard' },
    ];

    for (const route of routes) {
      await page.request.get(`/en${route.path}`);
    }

    for (const route of routes) {
      await page
        .getByRole('link', { name: route.label, exact: true })
        .first()
        .click();
      await page.waitForURL(new RegExp(`${route.path.replace(/\//g, '\\/')}$`), {
        timeout: 45000,
      });
      await expect(
        page.getByRole('heading', { name: route.heading }).first(),
      ).toBeVisible({ timeout: 45000 });
      await expectNoErrorBoundary(page);
    }
  });
});

test.describe('Delivery lifecycle across roles', () => {
  test('customer order → admin assignment → rider completes delivery', async ({ page }) => {
    test.setTimeout(300000);

    const ctx = await playwrightRequest.newContext();
    try {
      // 1. Customer places a COD order
      const customer = await loginApi(ctx, CUSTOMER.email, CUSTOMER.password);

      const addresses = await ctx.get(`${API}/addresses`, {
        headers: auth(customer.accessToken),
      });
      let addressId = ((await addresses.json()) as { id: string }[])[0]?.id;
      if (!addressId) {
        const createdAddress = await ctx.post(`${API}/addresses`, {
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
        addressId = (await createdAddress.json()).id;
      }

      const catalog = await ctx.get(`${API}/public/catalog/search?limit=1`);
      const product = ((await catalog.json()).data as { id: string }[])[0];
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

      // 2. Admin assigns the order to the rider
      const admin = await loginApi(ctx, ADMIN.email, ADMIN.password);
      const riders = await ctx.get(`${API}/deliveries/admin/riders`, {
        headers: auth(admin.accessToken),
      });
      const ridersList = (await riders.json()) as { id: string; phone: string }[];
      const riderId = ridersList.find((r) => r.phone === RIDER.phone)?.id;
      expect(riderId, 'rider should be returned by the admin rider list').toBeTruthy();

      const assign = await ctx.post(`${API}/deliveries/admin/assign`, {
        headers: auth(admin.accessToken),
        data: { orderId, riderId },
      });
      expect(assign.ok(), await assign.text()).toBeTruthy();
      const deliveryId = (await assign.json()).id as string;

      // 3. Rider progresses the delivery through the UI
      await loginUi(page, RIDER.email, RIDER.password);
      await page.waitForURL(/\/en\/rider/, { timeout: 25000 });

      await page.goto(`/en/rider/deliveries/${deliveryId}`);
      await expect(
        page.getByRole('heading', { name: 'Delivery Details' }),
      ).toBeVisible({ timeout: 25000 });

      await page.getByRole('button', { name: 'Accept Assignment' }).click();
      await page.getByRole('button', { name: 'Confirm Pickup' }).click({ timeout: 25000 });
      await page.getByRole('button', { name: 'Out for Delivery' }).click({ timeout: 25000 });
      await page.getByRole('button', { name: 'Mark as Delivered' }).click({ timeout: 25000 });

      await expect(
        page.getByRole('button', { name: 'Accept Assignment' }),
      ).toHaveCount(0);

      // 4. The order reflects the delivery outcome for the customer
      const order = await ctx.get(`${API}/orders/${orderId}`, {
        headers: auth(customer.accessToken),
      });
      const orderBody = await order.json();
      expect(orderBody.status).toBe('DELIVERED');
      expect(orderBody.paymentStatus).toBe('PAID');
    } finally {
      await ctx.dispose();
    }
  });
});

test.describe('Rider area access control', () => {
  test('a customer cannot open the rider area', async ({ page }) => {
    await loginUi(page, CUSTOMER.email, CUSTOMER.password);
    await page.waitForURL(/\/(en)\/(profile|admin|seller|rider)/, { timeout: 25000 });

    await page.goto('/en/rider/deliveries');
    await page.waitForURL(/\/en$/, { timeout: 20000 });
    await expectNoErrorBoundary(page);
  });
});
