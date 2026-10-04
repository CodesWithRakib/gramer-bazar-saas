// Temporary baseline benchmark harness (read-only against the API).
// Measures real HTTP latency/throughput for the most important endpoints using
// autocannon. It logs in with the seeded accounts, discovers real entity IDs,
// then runs a warmup + measurement pass per endpoint. It never performs writes
// other than the auth-login call (which only stamps lastLoginAt).
import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(__dirname, '../../../apps/api');
const require = createRequire(resolve(apiDir, 'package.json'));
const autocannon = require('autocannon');

const CONFIG = {
  baseUrl: process.env.BENCH_BASE_URL || 'http://localhost:4005',
  duration: Number(process.env.BENCH_DURATION || 8),
  warmup: Number(process.env.BENCH_WARMUP || 3),
  connections: Number(process.env.BENCH_CONNECTIONS || 10),
  only: process.env.BENCH_ONLY || null,
  skipMix: process.env.BENCH_SKIP_MIX === 'true',
  coldTimeoutMs: Number(process.env.BENCH_COLD_TIMEOUT || 20000),
};

const CREDS = {
  customer: { emailOrPhone: 'customer1@gramerbazar.com', password: 'Customer@GramerBazar2026!' },
  seller: { emailOrPhone: 'seller1@gramerbazar.com', password: 'Shop@GramerBazar2026!' },
  rider: { emailOrPhone: 'rider1@gramerbazar.com', password: 'Rider@GramerBazar2026!' },
  admin: { emailOrPhone: 'admin@gramerbazar.com', password: 'password123' },
};

const api = (p) => `${CONFIG.baseUrl}${p}`;

async function req(path, { method = 'GET', token, body, timeoutMs = 15000 } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(api(path), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { status: res.status, json, text };
}

async function login(role) {
  const { json } = await req('/api/v1/auth/login', { method: 'POST', body: CREDS[role] });
  if (!json?.data?.accessToken) throw new Error(`Login failed for ${role}: ${JSON.stringify(json)}`);
  return json.data.accessToken;
}

async function main() {
  const t0 = Date.now();
  const tokens = {};
  for (const role of Object.keys(CREDS)) tokens[role] = await login(role);
  console.log(`✓ logged in as ${Object.keys(tokens).join(', ')}`);

  // ---- Fixture discovery (each call isolated so one slow endpoint cannot hang) ----
  const fixtures = {};
  const safe = async (fn) => {
    try {
      return await fn();
    } catch (e) {
      console.warn(`  ! discovery step failed: ${e.message}`);
      return null;
    }
  };

  const saleSearch = await safe(() => req('/api/v1/public/catalog/search?limit=3&sort=newest', { timeoutMs: 20000 }));
  fixtures.productSlug = saleSearch?.json?.data?.[0]?.productVariant?.product?.slug || null;
  fixtures.productId = saleSearch?.json?.data?.[0]?.productVariant?.product?.id || null;
  fixtures.sellerProductId = saleSearch?.json?.data?.[0]?.id || null;
  fixtures.categorySlug =
    saleSearch?.json?.data?.[0]?.productVariant?.product?.category?.slug || null;
  fixtures.categoryId = saleSearch?.json?.data?.[0]?.productVariant?.product?.categoryId || null;

  const myOrders = await safe(() => req('/api/v1/orders', { token: tokens.customer }));
  fixtures.customerOrderId = myOrders?.json?.data?.[0]?.id || null;

  const adminOrders = await safe(() => req('/api/v1/orders/admin/all?limit=5', { token: tokens.admin }));
  fixtures.adminOrderId = adminOrders?.json?.data?.[0]?.id || null;

  const riderDel = await safe(() => req('/api/v1/deliveries/rider/assigned', { token: tokens.rider }));
  fixtures.riderDeliveryId = riderDel?.json?.data?.[0]?.id || null;

  const sellerOrders = await safe(() => req('/api/v1/seller-portal/orders?limit=5', { token: tokens.seller }));
  fixtures.sellerOrderId = sellerOrders?.json?.data?.[0]?.id || null;

  const shops = await safe(() => req('/api/v1/shops?limit=1'));
  fixtures.shopId = shops?.json?.data?.[0]?.id || null;

  console.log('✓ fixtures:', JSON.stringify(fixtures, null, 0));

  // ---- Scenario definitions ----
  const scenarios = [
    { group: 'Public', name: 'health', path: '/health', token: null, weight: 1 },
    { group: 'Public', name: 'locations/divisions', path: '/api/v1/locations/divisions' },
    { group: 'Public', name: 'public/catalog/search newest', path: '/api/v1/public/catalog/search?limit=24&sort=newest', weight: 12 },
    { group: 'Public', name: 'public/catalog/search price_asc', path: '/api/v1/public/catalog/search?limit=24&sort=price_asc', weight: 8 },
    { group: 'Public', name: 'public/catalog/search name_asc', path: '/api/v1/public/catalog/search?limit=24&sort=name_asc', weight: 4 },
    { group: 'Public', name: 'public/catalog/search q=laptop', path: '/api/v1/public/catalog/search?limit=24&q=laptop', weight: 8 },
    { group: 'Public', name: 'public/catalog/featured', path: '/api/v1/public/catalog/featured?limit=8', weight: 5 },
    { group: 'Public', name: 'public/catalog/popular', path: '/api/v1/public/catalog/popular?limit=8', weight: 5 },
    { group: 'Public', name: 'public/catalog/brands', path: '/api/v1/public/catalog/brands', weight: 2 },
    { group: 'Public', name: 'public/catalog/suggestions q=lap', path: '/api/v1/public/catalog/suggestions?q=lap', weight: 4 },
    { group: 'Public', name: 'banners/public', path: '/api/v1/banners/public', weight: 2 },
    { group: 'Public', name: 'flash-sales/active', path: '/api/v1/flash-sales/active', weight: 2 },
    {
      group: 'Public',
      name: 'public/catalog/:slug (details)',
      path: fixtures.productSlug ? `/api/v1/public/catalog/${fixtures.productSlug}` : null,
      weight: 6,
    },
    {
      group: 'Public',
      name: 'public/catalog/:slug/related',
      path: fixtures.productSlug ? `/api/v1/public/catalog/${fixtures.productSlug}/related` : null,
      weight: 3,
    },
    { group: 'Auth', name: 'POST auth/login (customer)', method: 'POST', path: '/api/v1/auth/login', body: CREDS.customer, token: null, weight: 2 },
    { group: 'Auth', name: 'GET auth/me (customer)', path: '/api/v1/auth/me', token: 'customer' },
    { group: 'Customer', name: 'GET orders (mine)', path: '/api/v1/orders', token: 'customer' },
    { group: 'Customer', name: 'GET orders/:id', path: fixtures.customerOrderId ? `/api/v1/orders/${fixtures.customerOrderId}` : null, token: 'customer' },
    { group: 'Customer', name: 'GET addresses', path: '/api/v1/addresses', token: 'customer' },
    { group: 'Customer', name: 'GET wishlists', path: '/api/v1/wishlists', token: 'customer' },
    { group: 'Customer', name: 'GET notifications', path: '/api/v1/notifications?page=1&limit=20', token: 'customer' },
    { group: 'Customer', name: 'GET notifications/unread-count', path: '/api/v1/notifications/unread-count', token: 'customer' },
    { group: 'Customer', name: 'GET reviews/product/:pid', path: fixtures.productId ? `/api/v1/reviews/product/${fixtures.productId}` : null, token: 'customer' },
    { group: 'Customer', name: 'POST public/cart/validate', method: 'POST', path: '/api/v1/public/cart/validate', body: { items: [{ sellerProductId: fixtures.sellerProductId, quantity: 1 }] }, token: null },
    { group: 'Seller', name: 'GET seller-portal/dashboard', path: '/api/v1/seller-portal/dashboard', token: 'seller' },
    { group: 'Seller', name: 'GET seller-portal/products', path: '/api/v1/seller-portal/products?page=1&limit=20', token: 'seller' },
    { group: 'Seller', name: 'GET seller-portal/orders', path: '/api/v1/seller-portal/orders?page=1&limit=20', token: 'seller' },
    { group: 'Seller', name: 'GET seller-portal/orders/:id', path: fixtures.sellerOrderId ? `/api/v1/seller-portal/orders/${fixtures.sellerOrderId}` : null, token: 'seller' },
    { group: 'Seller', name: 'GET wallets/my-wallet', path: '/api/v1/wallets/my-wallet', token: 'seller' },
    { group: 'Rider', name: 'GET deliveries/rider/assigned', path: '/api/v1/deliveries/rider/assigned', token: 'rider' },
    { group: 'Rider', name: 'GET deliveries/rider/:id', path: fixtures.riderDeliveryId ? `/api/v1/deliveries/rider/${fixtures.riderDeliveryId}` : null, token: 'rider' },
    { group: 'Admin', name: 'GET admin/analytics/dashboard', path: '/api/v1/admin/analytics/dashboard', token: 'admin' },
    { group: 'Admin', name: 'GET admin/analytics/demand', path: '/api/v1/admin/analytics/demand', token: 'admin' },
    { group: 'Admin', name: 'GET users (paginated)', path: '/api/v1/users?page=1&limit=20', token: 'admin' },
    { group: 'Admin', name: 'GET orders/admin/all', path: '/api/v1/orders/admin/all?page=1&limit=20', token: 'admin' },
    { group: 'Admin', name: 'GET products (admin)', path: '/api/v1/products?page=1&limit=20', token: 'admin' },
    { group: 'Admin', name: 'GET deliveries/admin', path: '/api/v1/deliveries/admin?page=1&limit=20', token: 'admin' },
    { group: 'Admin', name: 'GET admin/audit-logs', path: '/api/v1/admin/audit-logs?page=1&limit=20', token: 'admin' },
    { group: 'Admin', name: 'GET reviews/admin', path: '/api/v1/reviews/admin?page=1&limit=20', token: 'admin' },
    { group: 'Admin', name: 'GET admin/coupons', path: '/api/v1/admin/coupons?page=1&limit=20', token: 'admin' },
    { group: 'Admin', name: 'GET admin/product-requests', path: '/api/v1/admin/product-requests?page=1&limit=20', token: 'admin' },
    { group: 'Admin', name: 'GET admin/settings', path: '/api/v1/admin/settings', token: 'admin' },
    { group: 'Admin', name: 'GET payouts', path: '/api/v1/payouts', token: 'admin' },
    { group: 'Admin', name: 'GET categories (admin)', path: '/api/v1/categories?page=1&limit=20', token: 'admin' },
    { group: 'Admin', name: 'GET brands (admin)', path: '/api/v1/brands?limit=20', token: 'admin' },
    // Pathologically slow endpoints are measured LAST so they cannot pollute the
    // rest of the run with a long-running database query.
    { group: 'Public (slow)', name: 'public/categories', path: '/api/v1/public/categories' },
    { group: 'Public (slow)', name: 'public/categories/tree', path: '/api/v1/public/categories/tree' },
  ].filter((s) => s.path && (!CONFIG.only || s.name.includes(CONFIG.only)));

  const results = [];
  let idx = 0;
  for (const s of scenarios) {
    idx++;
    const token = s.token ? tokens[s.token] : undefined;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Cold single request (right before warmup) for reference. A hard timeout
    // protects the run from pathologically slow endpoints.
    let coldMs = null;
    let payloadBytes = null;
    let coldTimedOut = false;
    try {
      const cs = Date.now();
      const r = await req(s.path, { method: s.method || 'GET', token, body: s.body, timeoutMs: CONFIG.coldTimeoutMs });
      coldMs = Date.now() - cs;
      payloadBytes = Buffer.byteLength(r.text, 'utf8');
    } catch (e) {
      coldTimedOut = true;
      coldMs = CONFIG.coldTimeoutMs;
      console.error(`  ! cold request failed for ${s.name}: ${e.message}`);
    }

    if (coldTimedOut) {
      const rec = {
        group: s.group,
        name: s.name,
        method: s.method || 'GET',
        route: s.path,
        auth: s.token || 'public',
        skipped: true,
        skipReason: `cold request exceeded ${CONFIG.coldTimeoutMs / 1000}s timeout`,
        coldMs,
        payloadBytes: null,
        requests: { total: 0, success2xx: 0, failed: 0, timeouts: 0, rps: 0 },
        latencyMs: { avg: null, min: null, max: null, p50: null, p95: null, p99: null },
        throughputKbps: null,
        errorRate: null,
      };
      results.push(rec);
      console.log(`[${idx}/${scenarios.length}] ${s.group.padEnd(8)} ${s.name.padEnd(34)} SKIPPED (>${CONFIG.coldTimeoutMs / 1000}s cold timeout)`);
      continue;
    }

    const opts = {
      url: api(s.path),
      connections: CONFIG.connections,
      duration: CONFIG.duration,
      timeout: Math.ceil(CONFIG.coldTimeoutMs / 1000),
      headers: s.body ? { 'content-type': 'application/json', ...headers } : headers,
      method: s.method || 'GET',
      body: s.body ? JSON.stringify(s.body) : undefined,
    };

    await run(opts, CONFIG.warmup); // warmup (discarded)
    const result = await run(opts, CONFIG.duration);

    const total = result.requests.total;
    const failed = result.non2xx + result.errors;
    const rec = {
      group: s.group,
      name: s.name,
      method: s.method || 'GET',
      route: s.path,
      auth: s.token || 'public',
      concurrency: CONFIG.connections,
      durationSeconds: CONFIG.duration,
      coldMs,
      payloadBytes,
      requests: {
        total,
        success2xx: result['2xx'],
        failed,
        timeouts: result.timeouts,
        rps: result.requests.average,
      },
      latencyMs: {
        avg: round(result.latency.average),
        min: result.latency.min,
        max: result.latency.max,
        p50: result.latency.p50,
        // autocannon does not emit p95; its histogram buckets are 2.5/50/97.5/99,
        // so p97.5 is the closest available upper-tail proxy for p95.
        p95: result.latency.p95 ?? result.latency.p97_5,
        p99: result.latency.p99,
      },
      throughputKbps: round(result.throughput.average / 1024),
      errorRate: total > 0 ? round((failed / total) * 100, 2) : null,
    };
    results.push(rec);
    console.log(
      `[${idx}/${scenarios.length}] ${s.group.padEnd(8)} ${s.name.padEnd(34)} avg=${String(rec.latencyMs.avg).padStart(9)}ms p95=${String(rec.latencyMs.p95).padStart(6)} p99=${String(rec.latencyMs.p99).padStart(6)} rps=${String(rec.requests.rps).padStart(7)} err=${rec.errorRate}% payload=${payloadBytes}B`,
    );
  }

  // ---- Mixed realistic traffic (weighted across public read paths) ----
  const mixed = CONFIG.skipMix ? [] : scenarios.filter((s) => s.weight && s.group === 'Public');
  const weighted = [];
  for (const s of mixed) for (let i = 0; i < s.weight; i++) weighted.push({ method: s.method || 'GET', path: s.path });
  if (weighted.length > 0) {
    console.log(`\nMixed public workload: ${weighted.length} weighted requests...`);
    const mixOpts = {
      url: CONFIG.baseUrl,
      connections: CONFIG.connections,
      duration: Math.max(CONFIG.duration, 10),
      requests: weighted,
    };
    await run(mixOpts, CONFIG.warmup);
    const r = await run(mixOpts, Math.max(CONFIG.duration, 10));
    const total = r.requests.total;
    const failed = r.non2xx + r.errors;
    const rec = {
      group: 'Mixed',
      name: 'mixed public read traffic',
      method: 'MIX',
      route: `${weighted.length} weighted paths`,
      auth: 'public',
      concurrency: CONFIG.connections,
      durationSeconds: Math.max(CONFIG.duration, 10),
      coldMs: null,
      payloadBytes: null,
      requests: { total, success2xx: r['2xx'], failed, timeouts: r.timeouts, rps: r.requests.average },
      latencyMs: {
        avg: round(r.latency.average),
        min: r.latency.min,
        max: r.latency.max,
        p50: r.latency.p50,
        p95: r.latency.p95 ?? r.latency.p97_5,
        p99: r.latency.p99,
      },
      throughputKbps: round(r.throughput.average / 1024),
      errorRate: total > 0 ? round((failed / total) * 100, 2) : null,
    };
    results.push(rec);
    console.log(
      `[MIX] avg=${rec.latencyMs.avg}ms p95=${rec.latencyMs.p95} p99=${rec.latencyMs.p99} rps=${rec.requests.rps} err=${rec.errorRate}%`,
    );
  }

  const output = {
    generatedAt: new Date().toISOString(),
    baseUrl: CONFIG.baseUrl,
    concurrency: CONFIG.connections,
    durationSeconds: CONFIG.duration,
    warmupSeconds: CONFIG.warmup,
    note: 'Measured on a local production-mode NestJS instance (NODE_ENV=production, TypeORM query logging off, in-memory cache). Throttling raised on the benchmark instance only.',
    totalElapsedMs: Date.now() - t0,
    results,
  };

  const outDir = resolve(__dirname, '../../../performance-reports');
  mkdirSync(outDir, { recursive: true });
  const outName = process.env.BENCH_OUT || 'baseline-bench.json';
  writeFileSync(resolve(outDir, outName), JSON.stringify(output, null, 2));
  console.log(`\n✅ wrote performance-reports/${outName} (${results.length} endpoints, ${(output.totalElapsedMs / 1000).toFixed(0)}s)`);
}

function run(opts, duration) {
  return new Promise((resolvePromise, reject) => {
    const instance = autocannon({ ...opts, duration }, (err, result) => {
      if (err) reject(err);
      else resolvePromise(result);
    });
    autocannon.track(instance, { renderProgressBar: false });
  });
}

function round(n, d = 2) {
  return typeof n === 'number' ? Number(n.toFixed(d)) : n;
}

main().catch((e) => {
  console.error('BENCH_ERROR:', e);
  process.exit(1);
});
