import { test, expect, type Page } from '@playwright/test';

const ADMIN = { email: 'admin@gramerbazar.com', password: 'password123' };
const SELLER = { email: 'seller1@gramerbazar.com', password: 'Shop@GramerBazar2026!' };

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
    await expect(page).toHaveURL(/\/en\/admin/, { timeout: 25000 });
  });

  test('admin login lands on the dashboard with platform metrics', async ({
    page,
  }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' }).first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText('Total Sales').first()).toBeVisible();
    await expect(page.getByText('Total Orders').first()).toBeVisible();
    await expect(page.getByText('Active Shops').first()).toBeVisible();
    await expect(page.getByText(/registered sellers|Active Disputes|Pending Apps/i).first()).toBeVisible();
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
      const link = page
        .locator('aside')
        .getByRole('link', { name: route.label, exact: true })
        .first();
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${route.path.replace(/\//g, '\\/')}$`), {
        timeout: 45000,
      });
      // Every admin page renders its own heading and no error boundary
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 45000 });
      await expectNoErrorBoundary(page);
    }
  });

  test('admin settings persist across reloads', async ({ page }) => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const token = await page.evaluate(
      () => localStorage.getItem('access_token') || localStorage.getItem('token'),
    );

    await page.goto('/en/admin/settings/general');
    await expect(
      page.getByRole('heading', { name: /Configuration/i }).first(),
    ).toBeVisible({ timeout: 25000 });

    const nameField = page.getByLabel('Platform Name');
    const current = await nameField.inputValue();
    const next = current.endsWith('!') ? current.slice(0, -1) : `${current}!`;

    try {
      await nameField.fill(next);
      await page.getByRole('button', { name: /Save Platform Settings|Save Changes/i }).click();
      await expect(page.getByText(/Settings saved/i).first()).toBeVisible({ timeout: 20000 });

      // The value must be persisted server-side, not only in local state
      const res = await page.request.get(`${api}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const settingsJson = await res.json();
      const platformName = settingsJson.data?.platformName || settingsJson.platformName;
      expect(platformName).toBe(next);

      await page.reload();
      await expect(page.getByLabel('Platform Name')).toHaveValue(next, {
        timeout: 25000,
      });
    } finally {
      await page.getByLabel('Platform Name').fill(current);
      await page.getByRole('button', { name: /Save Platform Settings|Save Changes/i }).click();
      await expect(page.getByText(/Settings saved/i).first()).toBeVisible({
        timeout: 20000,
      });
    }
    await expectNoErrorBoundary(page);
  });

  test('admin can close and reopen seller registration', async ({ page }) => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const token = await page.evaluate(
      () => localStorage.getItem('access_token') || localStorage.getItem('token'),
    );
    const authHeaders = { Authorization: `Bearer ${token}` };

    await page.goto('/en/admin/settings/general');
    const toggle = page.getByRole('checkbox', { name: /Allow New Seller Registrations/i });
    await expect(toggle).toBeVisible({ timeout: 25000 });
    const wasEnabled = await toggle.isChecked();

    const readFlag = async () => {
      const res = await page.request.get(`${api}/admin/settings`, { headers: authHeaders });
      const json = await res.json();
      return (json.data?.allowSellerRegistration ?? json.allowSellerRegistration) as boolean;
    };

    try {
      if (wasEnabled) await toggle.click();
      await page.getByRole('button', { name: /Save Platform Settings|Save Changes/i }).click();
      await expect(page.getByText(/Settings saved/i).first()).toBeVisible({ timeout: 20000 });
      expect(await readFlag()).toBe(false);
    } finally {
      // Ensure seller registration is restored to true via API
      await page.request.patch(`${api}/admin/settings`, {
        headers: authHeaders,
        data: { allowSellerRegistration: true },
      });
    }

    expect(await readFlag()).toBe(true);
  });

  test('admin audit log page renders the log feed', async ({ page }) => {
    await page.goto('/en/admin/settings/audit-logs');
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
    await expect(page).toHaveURL(/\/en\/seller/, { timeout: 25000 });

    await page.goto('/en/admin/users-management');
    // RouteGuard strictly blocks seller: either displays 403 or auto-redirects to /seller
    await expect(
      page.getByText(/Access Denied|403/i).or(page.locator('h1:has-text("Seller dashboard")')),
    ).toBeVisible({ timeout: 20000 });
    expect(page.url()).not.toContain('/admin/users-management');
    await expectNoErrorBoundary(page);
  });
});
