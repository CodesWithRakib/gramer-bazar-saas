# Gramer Bazar Backend — Phase 2 Optimization Results

> Measured against an **isolated scratch copy** of the production-sized dataset
> (`gramer_bazar_p2`, restored from the dev DB). The dev database was never modified.
> Method: built API in production mode on :4005 against the scratch DB, autocannon
> (C=10, warmup 3s, duration 8s) — the identical harness used for the Phase 1 baseline.

Generated: 2026-10-04T07:41:22.131Z

---

## 1. What changed

- **A. apps/api/src/migrations/1793000000000-RestorePerformanceIndexes.ts (new)** — Idempotent migration recreating the 10 lost indexes + adds reviews(product_id,is_approved,created_at), reviews(created_at), reviews(user_id,product_id), products(name_en), product_variants(product_id). Registered in app.module.ts.
- **A2. apps/api/src/app.module.ts** — Schema sync is now opt-in (DB_SYNCHRONIZE=true only). Previously synchronize defaulted on outside production and dropped migration-managed indexes.
- **B. apps/api/src/public/categories/categories.service.ts** — productCounts() rewritten as a single set-based recursive rollup (was a per-category correlated subquery), plus a 60s in-process cache. Byte-identical counts verified for all 9,700 categories.
- **C. apps/api/src/analytics/analytics.service.ts** — GET /admin/analytics/demand: request.productName -> request.requestedProductName (column did not exist).
- **D. apps/api/src/public/catalog/catalog.service.ts + catalog.controller.ts** — getCategorySections() batches item/rating/sub-category fetches (one LATERAL + one hydration) and accepts an optional ?limit; homepage requests only the 4 sections it renders.
- **E. apps/api/src/settings/settings.service.ts** — getSettings() cached (5s TTL) with immediate invalidation on update; removes a per-request DB query from the global MaintenanceGuard.
- **F. apps/api/src/reviews/reviews.service.spec.ts** — Spec mock updated to provide DataSource.transaction manager, matching current service behavior.

---

## 2. SQL-level effect (EXPLAIN ANALYZE, scratch DB)

Effect of the **indexes alone** on the original query shapes:

| Query | Before (ms) | After (ms) | Speedup | After plan |
|---|---:|---:|---:|---|
| `categories_productCounts` | 46218.159 | 38788.648 | 1.2x | Seq Scan, Aggregate, Sort, Nested Loop |
| `reviews_by_product_approved` | 96.206 | 1.636 | 58.8x | Aggregate, Bitmap Heap Scan, Bitmap Index Scan |
| `reviews_admin_order` | 114.261 | 0.171 | 668.2x | Limit, Index Scan |
| `search_name_asc` | 664.552 | 1.059 | 627.5x | Limit, Incremental Sort, Nested Loop, Index Scan |
| `search_price_asc` | 9.629 | 3.574 | 2.7x | Limit, Nested Loop, Index Scan, Memoize |
| `search_newest` | 72.896 | 3.8 | 19.2x | Limit, Nested Loop, Index Scan, Memoize |
| `products_by_category` | 0.041 | 0.037 | 1.1x | Bitmap Heap Scan, Bitmap Index Scan |
| `products_by_brand` | 0.137 | 0.124 | 1.1x | Bitmap Heap Scan, Bitmap Index Scan |
| `trgm_name_en_search` | 174.916 | 38.081 | 4.6x | Bitmap Heap Scan, Bitmap Index Scan |
| `products_rating_sort` | 84.055 | 0.125 | 672.4x | Limit, Index Only Scan |

> `categories_productCounts` in the table above is the **original correlated subquery** with indexes added — the index does not fix it, which is why it was also rewritten:

| Query rewrite | Before (ms) | After (ms) | Speedup |
|---|---:|---:|---:|
| categories productCounts() | 40561.456 | 118.589 | ~342x |

Original per-category correlated subquery vs the new set-based recursive rollup. Index alone only helped to ~38.8s (see table); the rewrite is what removes the cost. Counts verified byte-identical for all 9,700 categories.

---

## 3. HTTP endpoint comparison (before → after)

| Endpoint | Group | Avg before | Avg after | Avg Δ | p95 before | p95 after | rps before | rps after |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| GET reviews/admin | Admin | 5418ms | 1113.09ms | -79.5% | 5906 | 1962 | 0.34 | 8.38 |
| public/catalog/search name_asc | Public | 4718.2ms | 137.21ms | -97.1% | 5467 | 161 | 0.84 | 72.5 |
| GET products (admin) | Admin | 2477.6ms | 726.9ms | -70.7% | 4150 | 1201 | 3.34 | 13.25 |
| POST auth/login (customer) | Auth | 1919.9ms | 1858.62ms | -3.2% | 3098 | 2907 | 4.67 | 4.88 |
| GET brands (admin) | Admin | 1245.8ms | 1048.1ms | -15.9% | 2120 | 1833 | 7.34 | 9 |
| public/catalog/brands | Public | 815.66ms | 814.6ms | -0.1% | 1366 | 1341 | 11.67 | 11.75 |
| public/catalog/featured | Public | 775.95ms | 80.69ms | -89.6% | 1486 | 94 | 12.17 | 122.75 |
| GET wishlists | Customer | 661.25ms | 56.44ms | -91.5% | 889 | 69 | 14.5 | 175 |
| mixed public read traffic | Mixed | 645.8ms | 117.39ms | -81.8% | 1247 | 395 | 15.3 | 84.6 |
| public/catalog/:slug (details) | Public | 629.58ms | 48.88ms | -92.2% | 938 | 57 | 15 | 202.38 |
| GET reviews/product/:pid | Customer | 575.98ms | 31.22ms | -94.6% | 1147 | 38 | 16.5 | 315.5 |
| public/catalog/search q=laptop | Public | 555.9ms | 157.27ms | -71.7% | 943 | 429 | 17.34 | 63.13 |
| public/catalog/popular | Public | 510.12ms | 112.08ms | -78% | 870 | 286 | 18.67 | 88.38 |
| public/catalog/search newest | Public | 485.18ms | 130.85ms | -73% | 766 | 170 | 19.5 | 75.5 |
| public/catalog/search price_asc | Public | 403.06ms | 144.16ms | -64.2% | 575 | 176 | 24.17 | 69 |
| GET admin/analytics/dashboard | Admin | 372.68ms | 221.48ms | -40.6% | 631 | 355 | 25.84 | 44.63 |
| GET deliveries/admin | Admin | 176.9ms | 154.1ms | -12.9% | 321 | 209 | 56.67 | 64.38 |
| public/catalog/:slug/related | Public | 141.75ms | 21.78ms | -84.6% | 290 | 29 | 70 | 448.5 |
| GET payouts | Admin | 133.62ms | 117.62ms | -12% | 168 | 162 | 74.17 | 85 |
| GET admin/product-requests | Admin | 130.15ms | 125.78ms | -3.4% | 172 | 198 | 76.67 | 78.75 |
| GET seller-portal/products | Seller | 126.43ms | 89.48ms | -29.2% | 209 | 108 | 78.34 | 111.25 |
| GET admin/coupons | Admin | 125.65ms | 107.22ms | -14.7% | 198 | 124 | 79.5 | 92.5 |
| GET seller-portal/dashboard | Seller | 123.4ms | 66.31ms | -46.3% | 202 | 88 | 80.5 | 150 |
| GET admin/audit-logs | Admin | 122.6ms | 133.54ms | +8.9% | 146 | 217 | 81.67 | 74.63 |
| GET orders (mine) | Customer | 120.44ms | 122.26ms | +1.5% | 146 | 139 | 82.34 | 81.25 |
| GET admin/settings | Admin | 117.56ms | 102.1ms | -13.2% | 165 | 165 | 85 | 97.13 |
| GET categories (admin) | Admin | 110.79ms | 81.91ms | -26.1% | 185 | 152 | 89.5 | 121 |
| GET deliveries/rider/assigned | Rider | 109.95ms | 112.45ms | +2.3% | 163 | 256 | 90.17 | 87.63 |
| GET deliveries/rider/:id | Rider | 107.85ms | 94.63ms | -12.3% | 138 | 145 | 92 | 104.63 |
| GET seller-portal/orders/:id | Seller | 101.19ms | 68.24ms | -32.6% | 136 | 84 | 98.34 | 145 |
| GET seller-portal/orders | Seller | 63ms | 40.08ms | -36.4% | 99 | 50 | 156.84 | 246.5 |
| GET orders/:id | Customer | 55.11ms | 53.6ms | -2.7% | 63 | 64 | 180.34 | 185 |
| flash-sales/active | Public | 49.75ms | 50.6ms | +1.7% | 61 | 59 | 198.5 | 195.5 |
| public/catalog/suggestions q=lap | Public | 43.87ms | 42.59ms | -2.9% | 53 | 66 | 225.34 | 231.75 |
| GET wallets/my-wallet | Seller | 41.61ms | 26.05ms | -37.4% | 53 | 34 | 238.17 | 376.5 |
| GET notifications | Customer | 36.57ms | 38.54ms | +5.4% | 44 | 47 | 270.17 | 256.25 |
| GET addresses | Customer | 35.22ms | 34.39ms | -2.4% | 41 | 40 | 279.67 | 286.5 |
| GET notifications/unread-count | Customer | 28.09ms | 26.26ms | -6.5% | 34 | 31 | 349.17 | 374.13 |
| GET auth/me (customer) | Auth | 22.12ms | 24.9ms | +12.6% | 29 | 30 | 441.67 | 393.75 |
| POST public/cart/validate | Customer | 22.02ms | 20.54ms | -6.7% | 36 | 25 | 443.67 | 474.38 |
| banners/public | Public | 11.61ms | 10.53ms | -9.3% | 18 | 15 | 826.67 | 906.13 |
| locations/divisions | Public | 9.22ms | 7.91ms | -14.2% | 13 | 13 | 1030.17 | 1192 |
| health | Public | 5.3ms | 2.79ms | -47.4% | 9 | 6 | 1720 | 3049.25 |
| GET admin/analytics/demand | Admin | 0ms | 149.56ms | — | 0 | 224 | 0 | 66.25 |
| GET orders/admin/all | Admin | 0ms | 200.17ms | — | 0 | 573 | 0 | 50 |
| GET users (paginated) | Admin | — | 183.93ms | — | — | 277 | 0 | 53.88 |
| public/categories | Public (slow) | — | 4603.75ms | — | — | 7065 | 0 | 1.5 |
| public/categories/tree | Public (slow) | — | 5511.1ms | — | — | 7304 | 0 | 1.38 |

**Mixed realistic public workload:** avg **645.8ms → 117.39ms** (-81.8%), p95 **1247 → 395**, throughput **15.3 → 84.6 rps**.


---

## 4. Additional single cold-request measurements

| Endpoint | Before | After | Note |
|---|---|---|---|
| public/catalog/homepage | 58.8s (after a first batching pass; not in Phase 1 set) | 8.0s | Remaining cost is the featured-shops query (~5.3s), out of scope |
| public/catalog/category-sections (all roots) | 52.3s | 50.2s | Fetches 52 sections; unchanged by default to preserve output |
| public/catalog/category-sections?limit=4 | 52.3s | 0.68s | New optional limit; homepage now uses limit=4 |
| public/categories / tree (single cold request) | >20s timeout | 0.8s (DB) / ~4.6s under C=10 | DB query fixed; 5.5 MB unpaginated payload is now the bottleneck |
| GET /admin/analytics/demand | HTTP 500 every call (~1.6s to fail) | HTTP 200, 0.27s cold / 150ms avg under load | Fixed broken column reference |

---

## 5. Test suite & coverage

- Test files: **65 passed (65)**; tests: **284 passed (284)**.
- Previously failing: src/reviews/reviews.service.spec.ts (3 tests) — fixed by updating the stale DataSource.transaction mock
- Coverage (was **unmeasurable** in Phase 1 because the run aborted on the failing suite):
  - statements **51.31%** (4172/8131)
  - functions **34.87%** (440/1262)
  - branches **28.06%** (1309/4665)

---

## 6. Verification method

- The 10 missing indexes + reviews indexes were applied to the scratch DB via `migration:run`; `migration:revert` then `migration:run` was exercised to prove both directions, and re-running the `CREATE INDEX IF NOT EXISTS` statements proved idempotency.
- `productCounts()` output was diffed row-by-row against the original correlated subquery for **all 9,700 categories — 0 mismatches**.
- The settings cache was proven with a query-logging dev instance: `/health` emits **1 query** when cold and **0 queries** within the TTL (it emitted 1 on every call before).
- The demand endpoint returns **HTTP 200** with the expected six data keys.

## 7. Limitations

- All latency figures are from a single local Windows workstation; they are before/after comparisons, not production predictions.
- Node heap / event-loop / GC internals remain unmeasurable with the available tooling.
- The scratch DB was restored from the dev DB, so the seeded category `path` quirks are present; product counts intentionally preserve the legacy semantics.
- public/categories is now DB-fast but returns a 5.5 MB unpaginated payload (separate issue).

## 8. Remaining bottlenecks (not addressed in Phase 2)

- `POST /auth/login` still ~1.9s (bcrypt cost 10) — backlog #10.
- `reviews/admin` ~1.1s — dominated by the `getManyAndCount` COUNT over 728k joined rows.
- `GET /public/catalog/brands` /`brands (admin)` ~0.8–1.0s with 850 kB+ payloads (unpaginated) — backlog #6.
- `/public/categories` 5.5 MB unpaginated payload — now DB-fast but serialization-bound under load.
- Homepage featured-shops query ~5.3s (joins 728k reviews) — remaining homepage bottleneck.
