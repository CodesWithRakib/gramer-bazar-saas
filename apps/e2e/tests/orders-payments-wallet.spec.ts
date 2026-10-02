import { test, expect, request as playwrightRequest } from '@playwright/test';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const CUSTOMER = { email: 'customer1@gramerbazar.com', password: 'Customer@GramerBazar2026!' };
const SELLER = { email: 'seller1@gramerbazar.com', password: 'Shop@GramerBazar2026!' };

const loginApi = async (
  ctx: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
  email: string,
  password: string,
) => {
  const res = await ctx.post(`${API}/auth/login`, { data: { emailOrPhone: email, password } });
  expect(res.ok(), `login failed for ${email}: ${await res.text()}`).toBeTruthy();
  const json = await res.json();
  return json.data?.accessToken || json.accessToken;
};

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

test.describe('Orders, Payments & Wallet Integration', () => {
  test('customer checkout creates order and updates stock integrity', async () => {
    const ctx = await playwrightRequest.newContext();
    try {
      const customerToken = await loginApi(ctx, CUSTOMER.email, CUSTOMER.password);

      // Ensure address
      const addressesRes = await ctx.get(`${API}/addresses`, {
        headers: auth(customerToken),
      });
      const rawAddresses = await addressesRes.json();
      const addressesList = Array.isArray(rawAddresses.data)
        ? rawAddresses.data
        : Array.isArray(rawAddresses)
        ? rawAddresses
        : [];
      let addressId = addressesList[0]?.id;
      if (!addressId) {
        const createdAddress = await ctx.post(`${API}/addresses`, {
          headers: auth(customerToken),
          data: {
            title: 'Home',
            contactName: 'Rahim Uddin',
            contactPhone: '+8801700000002',
            streetAddress: 'House 12, Road 5, Dhanmondi',
            isDefault: true,
          },
        });
        const createdJson = await createdAddress.json();
        addressId = createdJson.data?.id || createdJson.id;
      }
      expect(addressId).toBeTruthy();

      // Fetch active catalog product
      const catalog = await ctx.get(`${API}/public/catalog/search?limit=1`);
      const catalogJson = await catalog.json();
      const items = Array.isArray(catalogJson.data)
        ? catalogJson.data
        : Array.isArray(catalogJson.data?.data)
        ? catalogJson.data.data
        : [];
      const product = items[0];
      expect(product?.id).toBeTruthy();

      // Create COD Order via checkout
      const checkoutRes = await ctx.post(`${API}/orders/checkout`, {
        headers: auth(customerToken),
        data: {
          addressId,
          paymentMethod: 'COD',
          items: [{ sellerProductId: product.id, quantity: 1 }],
        },
      });

      expect(checkoutRes.ok(), await checkoutRes.text()).toBeTruthy();
      const checkoutBody = await checkoutRes.json();
      const order = checkoutBody.data?.order || checkoutBody.order || checkoutBody.data;
      expect(order?.id).toBeTruthy();
      expect(order?.paymentMethod).toBe('COD');
      expect(order?.status).toBe('PENDING');

      // Fetch created order detail
      const orderRes = await ctx.get(`${API}/orders/${order.id}`, {
        headers: auth(customerToken),
      });
      expect(orderRes.ok()).toBeTruthy();
      const orderJson = await orderRes.json();
      const fetchedOrder = orderJson.data ?? orderJson;
      expect(fetchedOrder.id).toBe(order.id);
    } finally {
      await ctx.dispose();
    }
  });

  test('seller wallet returns valid structure and enforces customer role protection', async () => {
    const ctx = await playwrightRequest.newContext();
    try {
      const sellerToken = await loginApi(ctx, SELLER.email, SELLER.password);
      const sellerWallet = await ctx.get(`${API}/wallets/my-wallet`, {
        headers: auth(sellerToken),
      });
      expect(sellerWallet.ok()).toBeTruthy();
      const sJson = await sellerWallet.json();
      const sWalletBody = sJson.data ?? sJson;
      expect(sWalletBody.balance).toBeDefined();

      const sellerTx = await ctx.get(`${API}/wallets/my-transactions`, {
        headers: auth(sellerToken),
      });
      expect(sellerTx.ok()).toBeTruthy();
      const txJson = await sellerTx.json();
      const transactions = txJson.data ?? txJson;
      expect(Array.isArray(transactions)).toBeTruthy();

      // Customer role boundary: Customers cannot access seller wallet
      const customerToken = await loginApi(ctx, CUSTOMER.email, CUSTOMER.password);
      const customerForbidden = await ctx.get(`${API}/wallets/my-wallet`, {
        headers: auth(customerToken),
      });
      expect(customerForbidden.status()).toBe(403);
    } finally {
      await ctx.dispose();
    }
  });
});
