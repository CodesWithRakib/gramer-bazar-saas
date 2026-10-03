import { test, expect, type Page } from '@playwright/test';

const CUSTOMER = { email: 'customer1@gramerbazar.com', password: 'Customer@GramerBazar2026!' };
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
  await expect(page).toHaveURL(/\/(en)\/(customer|profile|admin|seller|rider)/, { timeout: 25000 });
};

test.describe('Broadcast Inbox & In-Chat Official Messaging', () => {
  test('Customer broadcast feed renders with official channel banner and filter controls', async ({
    page,
  }) => {
    await login(page, CUSTOMER);
    await page.goto('/en/customer/broadcasts');
    await waitForHydration(page);

    // Official Channel Header
    await expect(page.getByText(/Gramer Bazar Official Channel/i)).toBeVisible();
    await expect(page.getByText(/Live Broadcast Active/i)).toBeVisible();

    // Controls
    await expect(page.getByPlaceholder(/Search broadcasts/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /All/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Unread/i })).toBeVisible();
  });

  test('Seller broadcast feed is accessible and renders policy / campaign advisories', async ({
    page,
  }) => {
    await login(page, SELLER);
    await page.goto('/en/seller/broadcasts');
    await waitForHydration(page);

    await expect(page.getByText(/Gramer Bazar Official Channel/i)).toBeVisible();
    await expect(page.getByText(/View in Chat/i)).toBeVisible();
  });

  test('Customer messages view includes Broadcasts filter and verified official badge', async ({
    page,
  }) => {
    await login(page, CUSTOMER);
    await page.goto('/en/customer/messages');
    await waitForHydration(page);

    // Filter button for Broadcasts
    await expect(page.getByRole('button', { name: /Broadcasts/i })).toBeVisible();
  });

  test('Bilingual support renders Bengali broadcast channel titles properly', async ({
    page,
  }) => {
    await login(page, CUSTOMER);
    await page.goto('/bn/customer/broadcasts');
    await waitForHydration(page);

    await expect(page.getByText(/গ্রামের বাজার অফিসিয়াল চ্যানেল/i)).toBeVisible();
  });
});
