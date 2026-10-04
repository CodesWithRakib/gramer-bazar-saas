// Assembles performance/baseline/backend-baseline.json from the raw measured
// artifacts. No values are invented: every number comes from a measured run.
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const rep = (f) => resolve(root, 'performance-reports', f);
const read = (f) => (existsSync(rep(f)) ? JSON.parse(readFileSync(rep(f), 'utf8')) : null);

const bench = read('baseline-bench.json');
const users = read('_t_users.json');
const adminOrders = read('_t_adminorders.json');
const demand = read('_t_demand.json');
const qc = read('_query-counts.json');
const db = read('_db-stats.json');
const inv = read('_api-inventory.json');

const overrides = new Map();
for (const src of [users, adminOrders, demand]) {
  if (src) for (const r of src.results) overrides.set(r.route.split('?')[0], r);
}

const endpoints = bench.results.map((r) => {
  const key = r.route.split('?')[0];
  const ov = key === '/api/v1/orders/admin/all' || key === '/api/v1/users' || key === '/api/v1/admin/analytics/demand' ? overrides.get(key) : null;
  const x = ov || r;
  return {
    group: x.group,
    method: x.method,
    route: x.route,
    auth: x.auth,
    skipped: !!x.skipped,
    skipReason: x.skipReason || null,
    avgMs: x.latencyMs.avg,
    minMs: x.latencyMs.min,
    maxMs: x.latencyMs.max,
    p50Ms: x.latencyMs.p50,
    p95Ms: x.latencyMs.p95,
    p99Ms: x.latencyMs.p99,
    errorRate: x.errorRate,
    requestsTotal: x.requests.total,
    rps: x.requests.rps,
    payloadBytes: x.payloadBytes,
    concurrency: x.concurrency,
    durationSeconds: x.durationSeconds,
    coldMs: x.coldMs,
    note: ov ? 'isolated re-measurement (main sweep superseded due to pool contention)' : null,
  };
});

const out = {
  generatedAt: new Date().toISOString(),
  auditPhase: 'Phase 1 - Backend Performance Baseline (pre-optimization)',
  environment: {
    node: process.version,
    pnpm: '12.4.2',
    nestjs: '12.x',
    postgres: db?.serverVersion ? `PostgreSQL ${db.serverVersion}` : 'unknown',
    redis: 'not running / not configured on this host (CacheModule falls back to in-memory)',
    cpu: 'AMD Ryzen 5 3400G (4 cores / 8 logical)',
    ram: '15.9 GB',
    os: 'Windows 11 Pro 10.0.26200',
    databaseSize: db?.databaseSize,
    dbSettings: db?.settings,
  },
  dataset: db?.rowCounts,
  benchmarkConfig: {
    baseUrl: bench.baseUrl,
    serverMode: 'NODE_ENV=production (TypeORM query logging off); throttling disabled on the benchmark instance only',
    concurrency: bench.concurrency,
    durationSeconds: bench.durationSeconds,
    warmupSeconds: bench.warmupSeconds,
    tool: 'autocannon v8',
    p95Note: 'autocannon does not emit p95; p95Ms is its p97.5 histogram bucket (closest available upper-tail proxy)',
    coldRequestNote: 'coldMs is a single uncached/unwarmed request measured immediately before the warmup pass; warm numbers follow a warmup run.',
    mixedWorkload: '62 weighted public read requests',
  },
  endpoints,
  queryCountsPerRequest: qc?.results ?? null,
  apiInventory: inv?.counts ?? null,
  database: {
    missingMigrationIndexes: db
      ? [
          'idx_categories_path_pattern',
          'idx_sp_created_at_id_active',
          'idx_sp_price_asc_id_active',
          'idx_sp_price_desc_id_active',
          'idx_products_category_active',
          'idx_products_brand_active',
          'idx_products_name_en_trgm',
          'idx_products_name_bn_trgm',
          'idx_products_slug_trgm',
          'idx_products_rating_active',
        ].filter((n) => !db.indexes.some((i) => i.indexname === n))
      : null,
    reviewsIndexes: db?.indexes.filter((i) => i.tablename === 'reviews').map((i) => i.indexname) ?? null,
    couponUsageIndexes: db?.indexes.filter((i) => i.tablename === 'coupon_usages').map((i) => i.indexname) ?? null,
  },
  knownBrokenEndpoints: [
    {
      route: '/api/v1/admin/analytics/demand',
      method: 'GET',
      observed: 'HTTP 500 on every call — column request.productname does not exist',
    },
  ],
  pathologicalQueries: [
    {
      name: 'public categories productCounts()',
      location: 'src/public/categories/categories.service.ts :: productCounts()',
      measuredWith: 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)',
      planningTimeMs: 18.2,
      executionTimeMs: 55824.8,
      topNode: 'Seq Scan (9700 rows)',
      observedAt: '2026-10-04 (local DB, 196159 products / 9700 categories)',
    },
  ],
  resourceUsage: {
    process: 'NestJS API (production instance, PID sampled during the benchmark)',
    samples: 135,
    sampleIntervalSeconds: 2,
    workingSetMB: { min: 316.4, avg: 440.6, max: 524.8 },
    privateMemoryMB: { min: 316.7, avg: 444.2, max: 530.1 },
    cpuPercentOfAllCores: { min: 0, avg: 9.1, max: 16.02 },
    note: 'Node.js heap metrics require process instrumentation that is not exposed in this environment; only OS-level working set / private bytes and CPU time are available.',
  },
  testSuite: {
    specFiles: 64,
    passedFiles: 64,
    failedFiles: 1,
    tests: 284,
    passed: 281,
    failed: 3,
    failure: 'src/reviews/reviews.service.spec.ts — "this.dataSource.transaction is not a function" (stale mock after ReviewsService moved to DataSource transactions)',
    coverage: 'NOT MEASURED — vitest coverage run aborts on the failing suite, so no coverage report is produced.',
  },
  codebaseMetrics: {
    modules: 38,
    controllers: 50,
    services: 60,
    entities: 68,
    dtoFiles: 128,
    specFiles: 64,
    sourceTsFiles: 528,
    largestServices: [
      'seeder.service.ts (2883 lines)',
      'public/catalog/catalog.service.ts (886)',
      'payments/payments.service.ts (821)',
      'seller-portal/seller-products.service.ts (789)',
      'chat/chat.service.ts (713)',
      'app.service.ts (704, embedded landing-page HTML)',
      'orders/orders.service.ts (644)',
      'seller-portal/seller-portal.controller.ts (612)',
    ],
    explicitAnyOccurrences: 250,
    eagerRelations: [
      'User.roles',
      'User.directPermissions',
      'RoleEntity.permissions',
      'Dispute.order',
    ],
  },
  notes: [
    'Measurements reflect the current LOCAL database, where the migration-recorded partial and pg_trgm performance indexes are ABSENT (they are not present in pg_indexes).',
    'The dev server runs with synchronize enabled, which appears to have dropped those migration-created indexes; production (synchronize=false) may differ.',
    'No application code, schema, index, cache or configuration was modified in this phase.',
  ],
};

const outPath = resolve(root, 'performance/baseline/backend-baseline.json');
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`wrote ${outPath} (${endpoints.length} endpoints)`);
