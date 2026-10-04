// Temporary query-count tool. Sends ONE request per endpoint to a NestJS
// instance running with TypeORM logging (NODE_ENV=development) and counts the
// SQL queries emitted in the log during that request's window.
import { readFileSync, statSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.QC_BASE_URL || 'http://localhost:4006';
const LOG = process.env.QC_LOG || '/tmp/api-queries.log';
const api = (p) => `${BASE}${p}`;

async function req(path, { method = 'GET', token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(api(path), { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: res.status, json };
}

import { openSync, readSync, closeSync, fstatSync } from 'fs';
let lastSize = 0;
function drain() {
  try {
    lastSize = statSync(LOG).size;
  } catch {
    lastSize = 0;
  }
}
function newLines() {
  try {
    const size = statSync(LOG).size;
    if (size <= lastSize) {
      lastSize = size;
      return [];
    }
    const bytesToRead = Math.min(size - lastSize, 5_000_000);
    const buf = Buffer.alloc(bytesToRead);
    const fd = openSync(LOG, 'r');
    readSync(fd, buf, 0, bytesToRead, lastSize);
    closeSync(fd);
    lastSize = lastSize + bytesToRead;
    return buf.toString('utf8').split(/\r?\n/);
  } catch {
    return [];
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function login(role, creds) {
  const { json } = await req('/api/v1/auth/login', { method: 'POST', body: creds });
  if (!json?.data?.accessToken) throw new Error(`login failed ${role}: ${JSON.stringify(json)}`);
  return json.data.accessToken;
}

async function countOnce(label, path, token, method = 'GET', body) {
  drain();
  await sleep(150);
  drain();
  const started = Date.now();
  const { status } = await req(path, { method, token, body });
  const ms = Date.now() - started;
  await sleep(250);
  const lines = newLines().filter((l) => l.includes('query:') || l.includes('query failed'));
  const count = lines.length;
  const failed = lines.filter((l) => l.includes('query failed')).length;
  console.log(`${String(count).padStart(3)} queries  ${String(ms).padStart(6)}ms  ${status}  ${label}`);
  return { label, path, method, status, queries: count, failedQueries: failed, ms };
}

async function main() {
  const customer = await login('customer', { emailOrPhone: 'customer1@gramerbazar.com', password: 'Customer@GramerBazar2026!' });
  const seller = await login('seller', { emailOrPhone: 'seller1@gramerbazar.com', password: 'Shop@GramerBazar2026!' });
  const rider = await login('rider', { emailOrPhone: 'rider1@gramerbazar.com', password: 'Rider@GramerBazar2026!' });
  const admin = await login('admin', { emailOrPhone: 'admin@gramerbazar.com', password: 'password123' });
  console.log('✓ logged in');

  // fixtures
  const sale = await req('/api/v1/public/catalog/search?limit=3&sort=newest');
  const productSlug = sale.json?.data?.[0]?.productVariant?.product?.slug;
  const productId = sale.json?.data?.[0]?.productVariant?.product?.id;
  const listingId = sale.json?.data?.[0]?.id;
  const orders = await req('/api/v1/orders', { token: customer });
  const orderId = orders.json?.data?.[0]?.id;
  const riderDel = await req('/api/v1/deliveries/rider/assigned', { token: rider });
  const deliveryId = riderDel.json?.data?.[0]?.id;

  const fixtures = { productSlug, productId, listingId, orderId, deliveryId };
  console.log('fixtures:', JSON.stringify(fixtures));

  const targets = [
    ['GET /health (public, no auth)', '/health', null],
    ['GET /public/catalog/search newest', '/api/v1/public/catalog/search?limit=24&sort=newest', null],
    ['GET /public/catalog/featured', '/api/v1/public/catalog/featured?limit=8', null],
    ['GET /public/catalog/brands', '/api/v1/public/catalog/brands', null],
    ['GET /public/catalog/:slug', productSlug ? `/api/v1/public/catalog/${productSlug}` : null, null],
    ['GET /auth/me (customer)', '/api/v1/auth/me', customer],
    ['GET /orders (customer)', '/api/v1/orders', customer],
    ['GET /notifications (customer)', '/api/v1/notifications?page=1&limit=20', customer],
    ['GET /wishlists (customer)', '/api/v1/wishlists', customer],
    ['GET /reviews/product/:pid', productId ? `/api/v1/reviews/product/${productId}` : null, customer],
    ['GET /seller-portal/dashboard', '/api/v1/seller-portal/dashboard', seller],
    ['GET /seller-portal/products', '/api/v1/seller-portal/products?page=1&limit=20', seller],
    ['GET /seller-portal/orders', '/api/v1/seller-portal/orders?page=1&limit=20', seller],
    ['GET /inventory/seller-products (1st=miss)', '/api/v1/inventory/seller-products?page=1&limit=20', seller],
    ['GET /inventory/seller-products (2nd=hit)', '/api/v1/inventory/seller-products?page=1&limit=20', seller],
    ['GET /inventory/seller-products (3rd=hit)', '/api/v1/inventory/seller-products?page=1&limit=20', seller],
    ['GET /deliveries/rider/assigned', '/api/v1/deliveries/rider/assigned', rider],
    ['GET /admin/analytics/dashboard', '/api/v1/admin/analytics/dashboard', admin],
    ['GET /users?page=1&limit=20', '/api/v1/users?page=1&limit=20', admin],
    ['GET /orders/admin/all?page=1&limit=20', '/api/v1/orders/admin/all?page=1&limit=20', admin],
    ['GET /products?page=1&limit=20 (admin)', '/api/v1/products?page=1&limit=20', admin],
    ['GET /deliveries/admin?page=1&limit=20', '/api/v1/deliveries/admin?page=1&limit=20', admin],
    ['GET /reviews/admin?page=1&limit=20', '/api/v1/reviews/admin?page=1&limit=20', admin],
    ['GET /categories?page=1&limit=20 (admin)', '/api/v1/categories?page=1&limit=20', admin],
    ['GET /brands?limit=20 (admin)', '/api/v1/brands?limit=20', admin],
    ['GET /admin/settings', '/api/v1/admin/settings', admin],
  ].filter((t) => t[1]);

  const results = [];
  for (const [label, path, token] of targets) {
    results.push(await countOnce(label, path, token));
  }

  // POST login measured separately (bcrypt + writes)
  results.push(await countOnce('POST /auth/login', '/api/v1/auth/login', null, 'POST', { emailOrPhone: 'customer1@gramerbazar.com', password: 'Customer@GramerBazar2026!' }));

  writeFileSync(
    resolve(__dirname, '../../../performance-reports/_query-counts.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl: BASE, results }, null, 2),
  );
  console.log('✅ wrote performance-reports/_query-counts.json');
}

main().catch((e) => {
  console.error('QC_ERROR:', e);
  process.exit(1);
});
