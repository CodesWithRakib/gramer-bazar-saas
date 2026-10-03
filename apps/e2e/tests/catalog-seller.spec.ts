import { test, expect, type Page } from '@playwright/test';

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

test.describe('Electronics catalog vertical — seller product authoring', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, SELLER);
    await expect(page).toHaveURL(/\/en\/seller/, { timeout: 25000 });
  });

  test('seller authors a processor listing with schema-driven specs', async ({ page }) => {
    test.setTimeout(240000);
    const stamp = Date.now();

    await page.goto('/en/seller/products/new');
    await waitForHydration(page);

    await page.getByLabel('Name (English)').fill(`E2E Processor ${stamp}`);
    await page.getByLabel('Name (Bangla)').fill('ই২ই প্রসেসর');

    // Choosing the category must reveal its product types (no category-specific code).
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'Processor', exact: true }).click();

    await expect(page.getByText('Product type & specifications')).toBeVisible({
      timeout: 20000,
    });

    await page.getByRole('combobox', { name: 'Product type' }).click();
    await page.getByRole('option', { name: 'Processor', exact: true }).click();

    // The Socket attribute is generated from the processor product type schema.
    const socket = page.getByRole('combobox', { name: 'Socket' });
    await expect(socket).toBeVisible({ timeout: 20000 });
    await socket.click();
    await page.getByRole('option', { name: 'AM5', exact: true }).click();

    await page.getByLabel('Regular price (৳)').fill('19999');
    await page.getByLabel('Stock quantity').fill('5');

    await page.getByRole('button', { name: 'Create product' }).click();

    // A successful save redirects to the new listing's edit page.
    await expect(page).toHaveURL(/\/en\/seller\/products\/[0-9a-fA-F-]{8,}/, {
      timeout: 30000,
    });
    await expectNoErrorBoundary(page);
  });
});
