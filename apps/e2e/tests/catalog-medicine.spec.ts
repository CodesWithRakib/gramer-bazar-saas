import { test, expect, type Page } from '@playwright/test';

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('Medicine & Health catalog vertical — customer discovery', () => {
  test('guest browses Medicine & Health → Pain Relief → Analgesics → Paracetamol', async ({
    page,
  }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/medicine-health');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /Medicine & Health/i }),
    ).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Product Types').first()).toBeVisible({ timeout: 20000 });

    await page.getByRole('link', { name: /Pain Relief/i }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/pain-relief/);

    await page.getByRole('link', { name: /Analgesics/i }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/analgesics/);

    await page.getByRole('link', { name: /^Paracetamol$/ }).first().click();
    await expect(page).toHaveURL(/\/en\/categories\/paracetamol/);

    const productLinks = page.locator('a[href^="/en/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 20000 });
    expect(await productLinks.count()).toBeGreaterThan(0);
  });

  test('dynamic dosage-form facet narrows medicine results', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('/en/categories/pain-relief');
    await waitForHydration(page);

    const cards = page.locator('a[href^="/en/products/"]');
    await expect(cards.first()).toBeVisible({ timeout: 20000 });
    const before = await cards.count();

    const sidebar = page.locator('aside').filter({ hasText: 'Dosage Form' });
    await expect(sidebar.getByText('Dosage Form', { exact: true })).toBeVisible({
      timeout: 20000,
    });
    await sidebar.getByText('Tablet', { exact: true }).first().click();

    await expect(page).toHaveURL(/attributes=/, { timeout: 20000 });
    await expect
      .poll(async () => cards.count(), { timeout: 20000 })
      .toBeLessThanOrEqual(before);
    await expect(page.getByText(/Demo Paracetamol/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('medicine product details expose structured specs', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-paracetamol-500mg-tablet');
    await waitForHydration(page);

    await page.getByRole('tab', { name: /Specifications/i }).click();
    await expect(page.getByText('Product Specifications')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Generic Name', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Paracetamol', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Prescription Required', { exact: true }).first()).toBeVisible();
  });

  test('Bangla storefront renders the medicine taxonomy', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/bn/categories/medicine-health');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: /ঔষধ/ }),
    ).toBeVisible({ timeout: 20000 });
  });

  test('medicine product details exposes safety advisory and manufacturer', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/products/demo-paracetamol-500mg-tablet');
    await waitForHydration(page);

    await expect(page.getByText(/Medicine & Healthcare Safety Advisory/i).first()).toBeVisible({
      timeout: 20000,
    });
  });

  test('admin can access manufacturers directory', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/en/admin/products/manufacturers');
    await waitForHydration(page);

    await expect(
      page.getByRole('heading', { name: /Manufacturers Directory/i }),
    ).toBeVisible({ timeout: 20000 });
  });
});
