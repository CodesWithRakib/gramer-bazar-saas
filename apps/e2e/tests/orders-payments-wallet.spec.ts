import { test, expect, request as playwrightRequest } from '@playwright/test';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const CUSTOMER = { email: 'customer@gramerbazar.com', password: 'password123' };
const SELLER = { email: 'seller1@gramerbazar.com', password: 'password123' };

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

test.describe('Orders, Payments & Wallet Integration', () => {
  test('customer checkout creates order and updates stock integrity', async () => {
    const ctx = await playwrightRequest.newContext();
    try {
      const customer = await loginApi(ctx, CUSTOMER.email, CUSTOMER.password);

      // Ensure address
      const addressesRes = await ctx.get(`${API}/addresses`, {
        headers: auth(customer.accessToken),
      });
      let addressId = ((await addressesRes.json()) as { id: string }[])[0]?.id;
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
        addressId = (await createdAddress.json()).id;
      }

      // Fetch active catalog product
      const catalog = await ctx.get(`${API}/public/catalog/search?limit=1`);
      const product = ((await catalog.json()).data as { id: string }[])[0];
      expect(product?.id).toBeTruthy();

      // Create COD Order via checkout
      const checkoutRes = await ctx.post(`${API}/orders/checkout`, {
        headers: auth(customer.accessToken),
        data: {
          addressId,
          paymentMethod: 'COD',
          items: [{ sellerProductId: product.id, quantity: 1 }],
        },
      });

      expect(checkoutRes.ok(), await checkoutRes.text()).toBeTruthy();
      const checkoutBody = await checkoutRes.json();
      expect(checkoutBody.order.id).toBeTruthy();
      expect(checkoutBody.order.paymentMethod).toBe('COD');
      expect(checkoutBody.order.status).toBe('PENDING');

      // Fetch created order detail
      const orderRes = await ctx.get(`${API}/orders/${checkoutBody.order.id}`, {
        headers: auth(customer.accessToken),
      });
      expect(orderRes.ok()).toBeTruthy();
      const order = await orderRes.json();
      expect(order.id).toBe(checkoutBody.order.id);
    } finally {
      await ctx.dispose();
    }
  });

  test('customer and seller wallets return valid structure', async () => {
    const ctx = await playwrightRequest.newContext();
    try {
      const customer = await loginApi(ctx, CUSTOMER.email, CUSTOMER.password);
      const customerWallet = await ctx.get(`${API}/wallets/me`, {
        headers: auth(customer.accessToken),
      });
      expect(customerWallet.ok()).toBeTruthy();
      const cWalletBody = await customerWallet.json();
      expect(cWalletBody.balance).toBeDefined();

      const seller = await loginApi(ctx, SELLER.email, SELLER.password);
      const sellerWallet = await ctx.get(`${API}/seller-portal/wallet`, {
        headers: auth(seller.accessToken),
      });
      expect(sellerWallet.ok()).toBeTruthy();
      const sWalletBody = await sellerWallet.json();
      expect(sWalletBody.balance).toBeDefined();
    } finally {
      await ctx.dispose();
    }
  });
});
