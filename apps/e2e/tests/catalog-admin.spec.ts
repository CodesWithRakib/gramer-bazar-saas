import { test, expect, type Page } from '@playwright/test';

const ADMIN = { email: 'admin@gramerbazar.com', password: 'password123' };

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

test.describe('Electronics catalog vertical — admin taxonomy management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN);
    await expect(page).toHaveURL(/\/en\/admin/, { timeout: 25000 });
  });

  test('admin hub links to the new product type and attribute tools', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/admin/products');
    await waitForHydration(page);

    await expect(page.getByText('Product Types').first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Attribute Engine').first()).toBeVisible({ timeout: 20000 });

    await page.getByRole('link', { name: /Product Types/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/products\/product-types/, { timeout: 30000 });
    await expectNoErrorBoundary(page);
  });

  test('admin can browse seeded product types and attributes', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/admin/products/product-types');
    await waitForHydration(page);
    await expect(
      page.getByRole('heading', { name: 'Product Types' }).first(),
    ).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Processor', { exact: true }).first()).toBeVisible({
      timeout: 20000,
    });
    await expectNoErrorBoundary(page);

    await page.goto('/en/admin/products/attributes');
    await waitForHydration(page);
    await expect(
      page.getByRole('heading', { name: 'Attribute Engine' }).first(),
    ).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Socket', { exact: true }).first()).toBeVisible({
      timeout: 20000,
    });
    await expectNoErrorBoundary(page);
  });

  test('admin can create and then delete an attribute', async ({ page }) => {
    test.setTimeout(180000);
    const stamp = Date.now();
    const nameEn = `E2E Attribute ${stamp}`;
    const slug = `e2e-attribute-${stamp}`;

    await page.goto('/en/admin/products/attributes');
    await waitForHydration(page);

    await page.getByRole('button', { name: 'Add Attribute' }).click();
    await page.getByLabel('Name (English)').fill(nameEn);
    await page.getByLabel('Name (Bangla)').fill('ই২ই অ্যাট্রিবিউট');
    await page.getByLabel('Slug', { exact: true }).fill(slug);
    await page.getByRole('button', { name: 'Save Attribute' }).click();

    // The new attribute should appear in the grid once the list refetches.
    await page.getByPlaceholder(/Search attributes/i).fill(nameEn);
    const row = page.getByRole('row', { name: new RegExp(nameEn) });
    await expect(row).toBeVisible({ timeout: 20000 });

    // Clean up so repeated runs stay idempotent.
    await row.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('row', { name: new RegExp(nameEn) })).toHaveCount(0, {
      timeout: 20000,
    });
  });
});
