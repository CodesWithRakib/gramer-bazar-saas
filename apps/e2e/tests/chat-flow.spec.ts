import { test, expect, type Page } from '@playwright/test';

const CUSTOMER = { email: 'customer@gramerbazar.com', password: 'password123' };
const SELLER = { email: 'seller1@gramerbazar.com', password: 'password123' };
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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
  await page.getByLabel('Email or Phone').fill(creds.email);
  await page.getByLabel('Password').fill(creds.password);
  await page
    .getByRole('main')
    .getByRole('button', { name: /login|sign in/i })
    .click();
  await page.waitForURL(/\/(en)\/(profile|admin|seller|rider)/, { timeout: 25000 });
};

test.describe('Chat & socket consistency', () => {
  test('anonymous visitors never trigger /auth/me', async ({ page }) => {
    const authMeCalls: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/me')) authMeCalls.push(req.url());
    });

    await page.goto('/en');
    await waitForHydration(page);
    // Give any (buggy) eager query time to fire
    await page.waitForTimeout(4000);

    expect(authMeCalls, `unexpected /auth/me calls: ${authMeCalls.join(', ')}`).toHaveLength(0);
  });

  test('after login every /auth/me call is authenticated', async ({ page }) => {
    const authMeCalls: { url: string; hasToken: boolean }[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/me')) {
        authMeCalls.push({
          url: req.url(),
          hasToken: !!req.headers()['authorization'],
        });
      }
    });

    await login(page, CUSTOMER);
    await page.waitForTimeout(4000);

    const anonymous = authMeCalls.filter((c) => !c.hasToken);
    expect(
      anonymous,
      `anonymous /auth/me calls after login: ${JSON.stringify(anonymous)}`,
    ).toHaveLength(0);
  });

  test('chat page opens with a live socket connection', async ({ page }) => {
    // Log in as a seller, then open the messages page which renders
    // ChatInterface (with its "Search conversations..." input).
    await login(page, SELLER);

    await page.goto('/en/seller/messages');
    await expect(
      page.getByRole('heading', { name: 'Messages' }).first(),
    ).toBeVisible({ timeout: 25000 });

    await expect(page.getByPlaceholder(/Search conversations/i)).toBeVisible({
      timeout: 25000,
    });
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
  });

  test('socket singleton: one app socket across client-side navigation', async ({
    page,
  }) => {
    // Next.js HMR also uses websockets on localhost, and `page.goto()` full
    // page loads legitimately tear down the JS context (fresh socket after
    // each load). The singleton claim is about CLIENT-SIDE navigation: within
    // one page load, navigating between pages must never open a second
    // socket.io connection. So count only connections opened AFTER the initial
    // load, then navigate exclusively through in-app links.
    const socketIoConnections: string[] = [];
    page.on('websocket', (ws) => {
      if (ws.url().includes('/socket.io')) {
        socketIoConnections.push(ws.url());
      }
    });

    await login(page, SELLER);
    expect(
      socketIoConnections.length,
      'exactly one socket.io connection right after login',
    ).toBe(1);

    // Client-side navigation through the dashboard sidebar
    await page
      .getByRole('link', { name: 'Messages', exact: true })
      .first()
      .click();
    await page.waitForURL(/\/en\/seller\/messages/, { timeout: 30000 });
    await page
      .getByRole('link', { name: 'Dashboard', exact: true })
      .first()
      .click();
    await page.waitForURL(/\/en\/seller$/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    expect(
      socketIoConnections,
      `client-side navigation must reuse the socket, got: ${socketIoConnections.join(', ')}`,
    ).toHaveLength(1);
  });
});
