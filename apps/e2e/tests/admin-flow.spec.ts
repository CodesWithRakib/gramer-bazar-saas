import { test, expect, type Page } from '@playwright/test';

const ADMIN = { email: 'admin@gramerbazar.com', password: 'password123' };
const SELLER = { email: 'seller1@gramerbazar.com', password: 'password123' };

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

const ADMIN_ROUTES: { label: string; path: string }[] = [
  { label: 'Orders', path: '/admin/orders' },
  { label: 'Products', path: '/admin/products' },
  { label: 'Promotions', path: '/admin/promotions' },
  { label: 'Users & Partners', path: '/admin/users-management' },
  { label: 'Finance', path: '/admin/finance' },
  { label: 'Messages', path: '/admin/messages' },
  { label: 'Disputes', path: '/admin/disputes' },
  { label: 'Settings', path: '/admin/settings' },
  { label: 'Dashboard', path: '/admin' },
];

test.describe('Admin E2E Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN);
    await page.waitForURL(/\/en\/admin/, { timeout: 25000 });
  });

  test('admin login lands on the dashboard with platform metrics', async ({
    page,
  }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' }).first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText('Total Sales').first()).toBeVisible();
    await expect(page.getByText('Total Orders').first()).toBeVisible();
    await expect(page.getByText('Customers').first()).toBeVisible();
    await expect(page.getByText('Sellers').first()).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test('admin sidebar opens every admin page without errors', async ({ page }) => {
    test.setTimeout(600000);

    // The dev server compiles routes on first hit; warm every page up front so
    // the click-through only measures navigation, not compilation.
    for (const route of ADMIN_ROUTES) {
      await page.request.get(`/en${route.path}`);
    }

    for (const route of ADMIN_ROUTES) {
      await page
        .getByRole('link', { name: route.label, exact: true })
        .first()
        .click();
      await page.waitForURL(new RegExp(`${route.path.replace(/\//g, '\\/')}$`), {
        timeout: 45000,
      });
      // Every admin page renders its own heading and no error boundary
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 45000 });
      await expectNoErrorBoundary(page);
    }
  });

  test('admin settings persist across reloads', async ({ page }) => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const token = await page.evaluate(() => localStorage.getItem('token'));

    await page.goto('/en/admin/settings');
    await expect(
      page.getByRole('heading', { name: /System Settings/ }).first(),
    ).toBeVisible({ timeout: 25000 });

    const nameField = page.getByLabel('Platform Name');
    const current = await nameField.inputValue();
    const next = current.endsWith('!') ? current.slice(0, -1) : `${current}!`;

    try {
      await nameField.fill(next);
      await page.getByRole('button', { name: 'Save Changes' }).click();
      await expect(page.getByText(/Settings saved/i).first()).toBeVisible({ timeout: 20000 });

      // The value must be persisted server-side, not only in local state
      const res = await page.request.get(`${api}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect((await res.json()).platformName).toBe(next);

      await page.reload();
      await expect(page.getByLabel('Platform Name')).toHaveValue(next, {
        timeout: 25000,
      });
    } finally {
      await page.getByLabel('Platform Name').fill(current);
      await page.getByRole('button', { name: 'Save Changes' }).click();
      await expect(page.getByText(/Settings saved/i).first()).toBeVisible({
        timeout: 20000,
      });
    }
    await expectNoErrorBoundary(page);
  });

  test('admin can close and reopen seller registration', async ({ page }) => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const authHeaders = { Authorization: `Bearer ${token}` };

    await page.goto('/en/admin/settings');
    const toggle = page.getByRole('checkbox', { name: /Allow New Seller Registrations/i });
    await expect(toggle).toBeVisible({ timeout: 25000 });
    const wasEnabled = await toggle.isChecked();

    const readFlag = async () => {
      const res = await page.request.get(`${api}/admin/settings`, { headers: authHeaders });
      return (await res.json()).allowSellerRegistration as boolean;
    };

    try {
      if (wasEnabled) await toggle.click();
      await page.getByRole('button', { name: 'Save Changes' }).click();
      await expect(page.getByText(/Settings saved/i).first()).toBeVisible({ timeout: 20000 });
      expect(await readFlag()).toBe(false);
    } finally {
      // Never leave seller registration disabled for the rest of the suite
      const now = await readFlag();
      if (!now) {
        const current = page.getByRole('checkbox', {
          name: /Allow New Seller Registrations/i,
        });
        await current.click();
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByText(/Settings saved/i).first()).toBeVisible({ timeout: 20000 });
      }
    }

    expect(await readFlag()).toBe(true);
  });

  test('admin audit log page renders the log feed', async ({ page }) => {
    await page.goto('/en/admin/audit-logs');
    await expect(
      page.getByRole('heading', { name: /Audit Logs/ }).first(),
    ).toBeVisible({ timeout: 25000 });
    await expect(page.getByPlaceholder(/Search logs/i)).toBeVisible();

    // Either real log rows (with the Action column) or the empty state — an
    // error screen is the only failure mode.
    await expect(
      page.getByRole('columnheader', { name: 'Action' }).or(
        page.getByText(/No audit logs found/i),
      ).first(),
    ).toBeVisible({ timeout: 25000 });
    await expectNoErrorBoundary(page);
  });
});

test.describe('Admin area access control', () => {
  test('a seller cannot open the admin area', async ({ page }) => {
    await login(page, SELLER);
    await page.waitForURL(/\/en\/seller/, { timeout: 25000 });

    await page.goto('/en/admin/users-management');
    await expect(page.getByText(/Access Denied|403/i)).toBeVisible({ timeout: 20000 });
    await expectNoErrorBoundary(page);
  });
});
