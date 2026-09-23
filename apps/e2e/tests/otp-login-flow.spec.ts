import { test, expect, request as playwrightRequest, type Page } from '@playwright/test';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const CUSTOMER = { phone: '01700000002', email: 'customer@gramerbazar.com', password: 'password123' };

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};

test.describe('OTP login journey', () => {
  test('customer logs in with phone + OTP through the login modal', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/en');
    await waitForHydration(page);

    // Open the login modal from the header
    await page.getByRole('button', { name: /login|sign in/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });

    // Step 1: phone
    await page.getByLabel('Mobile Number').fill(CUSTOMER.phone);
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByLabel('OTP Code')).toBeVisible({ timeout: 15000 });

    // Peek the generated OTP through the dev-only endpoint (no SMS provider)
    const ctx = await playwrightRequest.newContext();
    const peek = await ctx.get(`${API}/dev/otp/${encodeURIComponent(CUSTOMER.phone)}`);
    const { code } = (await peek.json()) as { code: string };
    expect(code).toMatch(/^\d{6}$/);
    await ctx.dispose();

    // Step 2: verify
    await page.getByLabel('OTP Code').fill(code);
    await page.getByRole('button', { name: /verify/i }).click();

    // Logged in: the header no longer offers a plain "Login" button
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 20000 });
    await expect(
      page.getByRole('button', { name: /^login$|sign in/i }),
    ).toHaveCount(0, { timeout: 20000 });
  });

  test('a wrong OTP shows an error and does not log the user in', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/en');
    await waitForHydration(page);

    await page.getByRole('button', { name: /login|sign in/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
    await page.getByLabel('Mobile Number').fill(CUSTOMER.phone);
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByLabel('OTP Code')).toBeVisible({ timeout: 15000 });

    await page.getByLabel('OTP Code').fill('000000');
    await page.getByRole('button', { name: /verify/i }).click();

    await expect(page.getByText(/invalid otp|ভুল ওটিপি/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
