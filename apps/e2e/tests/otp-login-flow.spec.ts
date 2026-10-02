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
  test('customer logs in with phone + OTP through the login page', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/en/login');
    await waitForHydration(page);

    // Switch to Mobile OTP tab
    await page.getByRole('button', { name: /mobile otp|ওটিপি/i }).click();

    // Step 1: phone
    const phoneInput = page.locator('#otpPhone');
    await expect(phoneInput).toBeVisible({ timeout: 15000 });
    await phoneInput.fill(CUSTOMER.phone);
    await page.getByRole('button', { name: /send otp|ওটিপি পাঠান/i }).click();

    // Step 2: wait for OTP input
    const otpInput = page.locator('#otpCode');
    await expect(otpInput).toBeVisible({ timeout: 15000 });

    // Peek the generated OTP through the dev-only endpoint (no SMS provider)
    const ctx = await playwrightRequest.newContext();
    const peek = await ctx.get(`${API}/dev/otp/${encodeURIComponent(CUSTOMER.phone)}`);
    const json = await peek.json();
    const code = json?.data?.code || json?.code;
    expect(code).toMatch(/^\d{6}$/);
    await ctx.dispose();

    // Step 3: verify
    await otpInput.fill(code);
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/verify-otp')),
      page.getByRole('button', { name: /verify/i }).click(),
    ]);

    // Logged in: redirected away from login page
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 });
    expect(page.url()).not.toContain('/login');
  });

  test('a wrong OTP shows an error and does not log the user in', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/en/login');
    await waitForHydration(page);

    await page.getByRole('button', { name: /mobile otp|ওটিপি/i }).click();
    const phoneInput = page.locator('#otpPhone');
    await expect(phoneInput).toBeVisible({ timeout: 15000 });
    await phoneInput.fill(CUSTOMER.phone);
    await page.getByRole('button', { name: /send otp|ওটিপি পাঠান/i }).click();

    const otpInput = page.locator('#otpCode');
    await expect(otpInput).toBeVisible({ timeout: 15000 });
    await otpInput.fill('000000');
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/verify-otp')),
      page.getByRole('button', { name: /verify/i }).click(),
    ]);

    await expect(page.getByText(/invalid otp|ভুল ওটিপি|failed|error/i).first()).toBeVisible({ timeout: 15000 });
    expect(page.url()).toContain('/login');
  });
});
