# Gramer Bazar Backend Performance Baseline

> **Phase 1 — pre-optimization snapshot.** No application code, schema, index,
> cache, DTO, controller, service, dependency or configuration was changed to
> produce this document. Everything below is either a **measured** value
> (labelled) or a **static observation** from reading the code (labelled).

Machine-readable companion: `performance/baseline/backend-baseline.json`
Optimization backlog: `performance/baseline/optimization-backlog.md`

---

## 1. Audit Date

2026-10-04 (local workstation, Asia/Dhaka). Measured runs executed 11:07–12:17 local time.

## 2. Environment

| Item | Value | Source |
|---|---|---|
| Node.js | v26.8.1 | `node -v` |
| pnpm | 12.4.2 | `pnpm -v` |
| NestJS | 12.x (`@nestjs/core ^12.0.1`) | `apps/api/package.json` |
| TypeORM | 0.3.31 | resolved lockfile |
| PostgreSQL | **18.6** | `SHOW server_version` |
| Redis | **not running / not configured** — CacheModule falls back to in-memory | port 6379 closed; app.module factory |
| Machine CPU | AMD Ryzen 5 3400G, 4 cores / 8 logical | Win32_Processor |
| RAM | 15.9 GB | Win32_ComputerSystem |
| OS | Windows 11 Pro 10.0.26200 | Win32_OperatingSystem |
| Database size | 460 MB | `pg_database_size` |
| Pool config | TypeORM default (max 10 connections) | no `extra.max` in `app.module.ts` |
| PostgreSQL settings | max_connections=100, shared_buffers=128MB, work_mem=4MB, effective_cache_size=4GB | `SHOW` |

**Measured dataset** (the `seed:perf` performance dataset is present):

| Table | Rows | Table size |
|---|---:|---:|
| reviews | 728,295 | 123 MB |
| seller_products | 392,496 | 87 MB |
| products | 196,159 | 80 MB |
| product_variants | 196,259 | 67 MB |
| inventory | 392,496 | 67 MB |
| users | 32,642 | 7.9 MB |
| categories | 9,700 | 6.9 MB |
| brands | 3,283 | 904 kB |
| shops | 3,255 | 1.15 MB |
| orders | 125 | — |
| order_items | 184 | — |

**Benchmark server:** a separate production-mode NestJS instance
(`NODE_ENV=production`, TypeORM query logging **off**, in-memory cache) started
from the existing compiled `dist/` on port 4005. The pre-existing dev server on
:4000 (with `synchronize` and SQL logging on) was left untouched. Throttling was
raised **on the benchmark instance only** so that the deliberately low
production limits (500/min global, 5/min login) did not masquerade as latency.
No application files were modified; the benchmark instance reused the app's
existing `.env`.

## 3. Architecture Summary

Monorepo (`pnpm` workspaces): `apps/web` (Next.js), `apps/api` (NestJS),
`apps/e2e` (Playwright), `packages/*` (types, tsconfig, eslint-config).

Backend shape (static observation):

- **38 modules**, 50 controllers, 60 services, 68 entities, 128 DTO files, 528 `.ts` source files.
- **Global prefix** `api/v1` (excluded: `/`, `health`, `docs`, `favicon.ico`).
- **Global guards**: `WsSafeThrottlerGuard` (rate limiting, HTTP only) and
  `MaintenanceGuard` (queries platform settings on **every** request).
- **Global pipes**: `ValidationPipe` (`whitelist`, `transform`, `forbidNonWhitelisted`).
- **Global interceptors**: `ResponseInterceptor` (uniform `{success,statusCode,path,timestamp,data[,meta]}` envelope), `ClassSerializerInterceptor`; plus `ImpersonationActivityInterceptor`.
- **Global filter**: `AllExceptionsFilter` (wraps errors, logs 500s; includes stack in the body for 500s).
- **Auth**: Passport JWT (`JwtStrategy`), access token (default `1h`) + refresh token (default `7d`); token accepted from `access_token` cookie or `Authorization: Bearer`; refresh token hash stored on the user. JWT payload `{ sub, phone, act?, imp? }`.
- **Authorization**: `@Roles()` + `@Permissions()` decorators enforced by `RolesGuard` / `PermissionsGuard`; `SUPER_ADMIN` bypasses role checks. Guards are **not global** — each controller attaches `@UseGuards`.
- **Data**: TypeORM + PostgreSQL. `synchronize` is on for any non-production boot unless `DB_SYNCHRONIZE=false`; `logging` is on when `NODE_ENV=development`.
- **Cache**: `@nestjs/cache-manager` registered globally. Redis store only when `NODE_ENV=production` **and** `REDIS_URL` is set; otherwise in-memory (default TTL 60s).
- **Realtime**: one Socket.IO gateway (`chat.gateway.ts`) with a WS JWT guard and a WS-safe throttler.
- **Background work**: `ScheduleModule` — an announcements cron every minute and a broadcast-recipient polling worker (`broadcast-processor.service.ts`, in-process timer).
- **External services**: SSLCommerz (payments), Resend (email), Supabase Storage (images), a mock broadcast provider (WhatsApp is scaffolded but not implemented).
- **Files**: Multer + `SupabaseStorageService` for uploads, `ServeStaticModule` on `/uploads`.
- **Swagger**: `createSwaggerDocument` at `/api/docs`; committed `swagger-spec.json` (267 paths / 368 operations).

## 4. API Inventory

Derived from the committed OpenAPI document (`apps/api/swagger-spec.json`):

**368 operations across 267 paths** (`performance-reports/_api-inventory.json`).

| Category (by path/security heuristic) | Operations |
|---|---:|
| Authenticated customer/general | 148 |
| Public | 78 |
| Admin | 55 |
| Seller | 29 |
| Super Admin | 18 |
| Authentication | 12 |
| Rider | 12 |
| Payment (gateway callbacks) | 8 |
| Payment | 5 |
| Notification | 3 |

The names above are a **classification heuristic**, not a hand-verified role map:
the large "authenticated customer/general" bucket contains endpoints whose auth
requirement is JWT plus an in-controller role/service check (orders, reviews,
wishlists, disputes, chat, wallets, addresses, product requests…). A per-endpoint
role audit is listed as remaining work — classifying 368 operations by reading
every controller is out of scope for a performance baseline.

Major route groups: `auth`, `users`, `locations`, `addresses`, `categories`,
`brands`, `products`, `product-variants`, `public/catalog`, `public/categories`,
`public/cart`, `shops`, `inventory`, `inventory/seller-products`, `reviews`,
`orders`, `product-requests`, `seller-portal`, `deliveries`, `riders`,
`wishlists`, `notifications`, `admin/analytics`, `coupons`, `chat`, `payments`,
`banners`, `wallets`, `payouts`, `disputes`, `flash-sales`, `admin/audit-logs`,
`admin/settings`, `applications`, `admins`, `impersonation`, `announcements`,
`broadcast`, `super-admin/broadcast`.

## 5. Critical User Journeys

**Customer (highest traffic):** browse/categories → search → product details →
cart validate → checkout → order list/detail. Public catalog/search and product
details are the busiest paths (unauthenticated, crawlable).
**Seller:** login → dashboard → products/inventory → orders → order detail.
**Rider:** login → assigned deliveries → status/location updates.
**Admin:** login → analytics dashboard → users/orders/products/deliveries/reviews.
**Highest expected traffic:** `GET /public/catalog/*`, `GET /public/categories*`,
`GET /auth/me`, `GET /orders`, `GET /notifications*`, `GET /public/catalog/:slug`.
**Lowest frequency but highest cost:** admin analytics, admin/product & review
lists, seller dashboard, public category counts.

## 6. Performance Baseline (measured)

autocannon v8, concurrency 10, 6s measured after 2s warmup, local prod instance.
`p95` is autocannon's p97.5 bucket (autocannon has no p95). `Cold` is one
unwarmed request. Full data in `backend-baseline.json`.

| Endpoint | Method | Avg | p50 | p95 | p99 | Err | Payload | RPS |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `/health` | GET | 5.3 | 5 | 9 | 10 | 0% | 248 B | 1720 |
| `/api/v1/locations/divisions` | GET | 9.2 | 9 | 13 | 14 | 0% | 2.0 kB | 1030 |
| `/api/v1/public/catalog/suggestions?q=lap` | GET | 43.9 | 43 | 53 | 66 | 0% | 1.7 kB | 225 |
| `/api/v1/banners/public` | GET | 11.6 | 11 | 18 | 20 | 0% | 2.1 kB | 827 |
| `/api/v1/flash-sales/active` | GET | 49.8 | 49 | 61 | 79 | 0% | 31 kB | 199 |
| `/api/v1/auth/me` | GET | 22.1 | 22 | 29 | 33 | 0% | 746 B | 442 |
| `/api/v1/addresses` | GET | 35.2 | 35 | 41 | 43 | 0% | 626 B | 280 |
| `/api/v1/notifications` | GET | 36.6 | 36 | 44 | 47 | 0% | 11 kB | 270 |
| `/api/v1/notifications/unread-count` | GET | 28.1 | 28 | 34 | 35 | 0% | 136 B | 349 |
| `/api/v1/public/cart/validate` | POST | 22.0 | 21 | 36 | 45 | 0% | 508 B | 444 |
| `/api/v1/orders/:id` | GET | 55.1 | 54 | 63 | 94 | 0% | 4.9 kB | 180 |
| `/api/v1/seller-portal/orders` | GET | 63.0 | 60 | 99 | 166 | 0% | 2.9 kB | 157 |
| `/api/v1/wallets/my-wallet` | GET | 41.6 | 41 | 53 | 58 | 0% | 374 B | 238 |
| `/api/v1/seller-portal/orders/:id` | GET | 101.2 | 98 | 136 | 161 | 0% | 1.7 kB | 98 |
| `/api/v1/deliveries/rider/:id` | GET | 107.9 | 104 | 138 | 150 | 0% | 5.8 kB | 92 |
| `/api/v1/deliveries/rider/assigned` | GET | 110.0 | 106 | 163 | 173 | 0% | 53 kB | 90 |
| `/api/v1/orders` (mine) | GET | 120.4 | 118 | 146 | 185 | 0% | **115 kB** | 82 |
| `/api/v1/seller-portal/dashboard` | GET | 123.4 | 118 | 202 | 236 | 0% | 4.3 kB | 81 |
| `/api/v1/seller-portal/products` | GET | 126.4 | 119 | 209 | 218 | 0% | 33 kB | 78 |
| `/api/v1/admin/coupons` | GET | 125.7 | 116 | 198 | 223 | 0% | 2.3 kB | 80 |
| `/api/v1/admin/audit-logs` | GET | 122.6 | 120 | 146 | 154 | 0% | 7.0 kB | 82 |
| `/api/v1/admin/product-requests` | GET | 130.2 | 124 | 172 | 239 | 0% | 5.8 kB | 77 |
| `/api/v1/payouts` | GET | 133.6 | 130 | 168 | 172 | 0% | 6.6 kB | 74 |
| `/api/v1/public/catalog/:slug/related` | GET | 141.8 | 130 | 290 | 315 | 0% | 158 B | 70 |
| `/api/v1/orders/admin/all` | GET | 169.5 * | 167 | 240 | 246 | 0% | 24 kB | 59 |
| `/api/v1/deliveries/admin` | GET | 176.9 | 167 | 321 | 325 | 0% | 34 kB | 57 |
| `/api/v1/categories` (admin) | GET | 110.8 | 104 | 185 | 217 | 0% | 24 kB | 90 |
| `/api/v1/users` (paginated) | GET | 76.8 * | — | 162 | 200 | 0% | 7.4 kB | 26 |
| `/api/v1/admin/settings` | GET | 117.6 | 113 | 165 | 182 | 0% | 418 B | 85 |
| `/api/v1/admin/analytics/dashboard` | GET | 372.7 | 369 | 631 | 725 | 0% | 1.3 kB | 26 |
| `/api/v1/public/catalog/search?sort=price_asc` | GET | 403.1 | 395 | 575 | 591 | 0% | 118 kB | 24 |
| `/api/v1/public/catalog/search?sort=newest` | GET | 485.2 | 465 | 766 | 769 | 0% | 82 kB | 20 |
| `/api/v1/public/catalog/search?q=laptop` | GET | 555.9 | 507 | 943 | 948 | 0% | 83 kB | 17 |
| `/api/v1/public/catalog/popular` | GET | 510.1 | 477 | 870 | 923 | 0% | 28 kB | 19 |
| `/api/v1/reviews/product/:pid` | GET | 576.0 | 557 | 1147 | 1174 | 0% | 4.1 kB | 17 |
| `/api/v1/public/catalog/:slug` | GET | 629.6 | 593 | 938 | 1089 | 0% | 11 kB | 15 |
| `/api/v1/wishlists` | GET | 661.3 | 653 | 889 | 923 | 0% | 10 kB | 15 |
| `/api/v1/public/catalog/featured` | GET | 776.0 | 658 | 1486 | 1504 | 0% | 35 kB | 12 |
| `/api/v1/public/catalog/brands` | GET | 815.7 | 769 | 1366 | 1438 | 0% | **856 kB** | 12 |
| `/api/v1/brands` (admin) | GET | 1245.8 | 1118 | 2120 | 2226 | 0% | **953 kB** | 7.3 |
| `/api/v1/auth/login` | POST | **1919.9** | 1588 | 3098 | 3098 | 0% | 1.1 kB | 4.7 |
| `/api/v1/products` (admin) | GET | **2477.6** | 2504 | 4150 | 4150 | 0% | 44 kB | 3.3 |
| `/api/v1/public/catalog/search?sort=name_asc` | GET | **4718.2** | 4898 | 5467 | 5467 | 0% | 114 kB | 0.8 |
| `/api/v1/reviews/admin` | GET | **5418.0** | 4930 | 5906 | 5906 | 0% | 31 kB | 0.3 |
| `/api/v1/admin/analytics/demand` | GET | — | — | — | — | **100% (500)** | 1.2 kB | 0.6 |
| `/api/v1/public/categories` | GET | **DB query alone = 55,825 ms** (measured `EXPLAIN ANALYZE`); HTTP cold > 20 s | | | | | | |
| `/api/v1/public/categories/tree` | GET | same `productCounts()` query; cold > 20 s | | | | | | |
| **Mixed public read workload (62 weighted paths)** | MIX | **645.8** | 601 | 1247 | 1511 | 0% | — | 15.3 |

`*` = isolated re-measurement; the initial sweep skipped/failed these because a
preceding pathological endpoint held the 10-connection pool.

**Cold vs warm:** warm values are reported above (2s warmup discarded). Single
cold requests are in `backend-baseline.json` (`coldMs`). No endpoint is cached
except `inventory/seller-products*` (see §10), so warm/cached and uncached are
identical for everything else.

## 7. Slowest APIs (ranked by p95, frequency and business weight)

1. **`GET /public/categories` & `/public/categories/tree` — catastrophic.** The
   `productCounts()` query alone executes in **55.8 s** (`EXPLAIN ANALYZE`, Seq
   Scan over 9,700 categories with a correlated per-row subquery). Both HTTP
   endpoints exceed a 20 s cold timeout. These power storefront category
   navigation.
2. **`GET /admin/analytics/demand` — broken (HTTP 500).** Throws
   `column request.productname does not exist` on every call (~1.6 s to fail).
   Functionally useless today.
3. **`GET /public/catalog/search?sort=name_asc` — 4.7 s avg / 5.5 s p95.** Sorts
   across `products.name_en` (cross-table) with no covering index. 0.8 rps.
4. **`GET /reviews/admin` — 5.4 s avg / 5.9 s p95.** `reviews` has **no index on
   product_id / is_approved** (728 k rows) and the admin list aggregates.
5. **`GET /products` (admin) — 2.5 s avg / 4.2 s p95.** Deep relation loading +
   `getManyAndCount` over 196 k products.
6. **`POST /auth/login` — 1.9 s avg / 3.1 s p95.** bcrypt (cost 10) on the request
   thread; 4.7 rps. Combined with the 5/min production throttle this is a
   brute-force bottleneck and a latency outlier.
7. **`GET /brands` (admin 953 kB, public 856 kB) & `/public/catalog/brands` —
   0.8–1.2 s.** Unpaginated full brand table; ~1 MB payloads.
8. **`GET /public/catalog/featured` — 0.78 s avg / 1.5 s p95**, uncached, runs on
   every homepage load.
9. **`GET /wishlists` — 0.66 s.** Deep eager relation load + rating aggregate.
10. **`GET /public/catalog/:slug` — 0.63 s.** 9-relation join + ratings + spec
    groups (extra per-product query).
11. **`GET /orders` (customer) — 0.12 s but 115 kB**, unbounded (no pagination).
12. **Mixed public workload 646 ms avg / 1.5 s p95 @ C10.** The storefront as a
    whole is the dominant cost.

## 8. Database Findings

**8.1 — Migration-created performance indexes are MISSING from the live DB (`synchronize` risk).**
`SearchAndPaginationIndexes1792000000000` is recorded as applied and `pg_trgm`
exists, but none of the indexes it creates are present in `pg_indexes`:

`idx_categories_path_pattern`, `idx_sp_created_at_id_active`,
`idx_sp_price_asc_id_active`, `idx_sp_price_desc_id_active`,
`idx_products_category_active`, `idx_products_brand_active`,
`idx_products_name_en_trgm`, `idx_products_name_bn_trgm`,
`idx_products_slug_trgm`, `idx_products_rating_active` → **all absent**.

The dev server runs with `synchronize` enabled (`NODE_ENV=development`,
`DB_SYNCHRONIZE` unset), and TypeORM `synchronize` drops indexes it does not know
about. Because the migrations table records the migration as already run,
re-running migrations will not restore them. **Every measurement in this
document reflects this degraded local state.** Production (`synchronize=false`)
is expected to keep these indexes, so these numbers are, if anything, a
worst-case local view — but the local baseline is what we can currently measure.

**8.2 — Missing indexes on hot tables.**
- `reviews` (728,295 rows): only a primary key. No index on `product_id` or
  `is_approved`, yet nearly every product list/detail/wishlist runs
  `WHERE product_id = ANY($1) AND is_approved = true GROUP BY product_id`.
- `coupon_usages`: primary key only; `checkout` and coupon validation query
  `(couponId, userId)`.
- `demand_events`: entity-decorator indexes only.

**8.3 — `synchronize: true` in non-production is inherently unsafe for performance.**
It can (and here evidently did) drop hand-written partial/GIN/expression indexes.

**8.4 — Per-request guard queries.**
`MaintenanceGuard` (a global `APP_GUARD`) calls `SettingsService.getSettings()`,
which runs `settingRepository.find()` **on every request** — measured **1 SQL
query even for `GET /health` and completely public endpoints**. `getSettings()`
has no caching.

**8.5 — Eager relations on the auth hot path.**
`User.roles`, `User.directPermissions` and `RoleEntity.permissions` are
`eager: true`. `JwtStrategy.validate` calls `UsersService.findById`, which always
`findOne({where:{id}, relations:['roles']})`. So every authenticated request
re-loads roles and (transitively) permissions. `Dispute.order` is also eager.

**8.6 — Unbounded relation loading (no pagination / no limit).**
- `OrdersService.findCustomerOrders` → all relations for every order of a user.
- `DeliveriesService.getRiderDeliveries` / `getRiderDashboard` → all deliveries + order + address + user.
- `DeliveriesService.getAllDeliveries()` (no page args) → all deliveries with nested relations.
- `WishlistsService.getUserWishlist` → all items with 6 nested relations.
- `OrdersService.findAll()` (no page args) → all orders with user + address.

**8.7 — N+1 / query-in-loop patterns.**
- `PublicCategoriesService.productCounts()` — the 55.8 s correlated subquery.
- `CatalogService.getCategorySections()` — runs a full product query + ratings
  query + sub-category query **inside a `for` loop over every root category**
  (`catalog.service.ts:617`); called by `getHomepage()`.
- `CatalogProductsService` (delete path) — per-variant `UPDATE` in a loop.
- `BroadcastAudienceService` — per-audience-type `COUNT` queries in a loop.
- `SellerAnalyticsService.getAnalytics()` — ~8 sequential aggregate queries plus a
  correlated `generate_series` revenue-trend query.
- `OrdersService.checkout` / `transitionOrder` — `inventories.find()` inside a
  `for` loop (in-memory, O(n²) but not I/O).

**8.8 — Analytics aggregation cost.**
`AnalyticsService.getDashboardMetrics()` runs **~13 sequential queries** (many
`COUNT(*)`, `SUM`, `GROUP BY`) with only some in a `Promise.all`. The demand
endpoint runs up to 6 heavy `GROUP BY` / correlated `NOT EXISTS` sub-queries over
`product_variants` × `seller_products` × `inventory`.

**8.9 — COUNT queries.** 25 usages of `getManyAndCount`, each issuing a separate
`COUNT(*)` (sometimes over joins) per paginated request.

**8.10 — Offset pagination.** Default for most modules (page/limit, max 100). Deep
offsets on large tables are inherently expensive. The public catalog uses
**cursor** pagination (good) — prior traversal of 100 cursor pages averaged
~168 ms/page.

**Not found:** no `SELECT *` via raw SQL on hot paths beyond explicit column lists;
`find()` without `select` returns all columns but no entity uses huge blobs.
No database calls inside transactions that escape the transaction.

## 9. Query Findings (measured, one request each)

Counted by running a second `NODE_ENV=development` instance with TypeORM logging
(broadcast worker disabled) and diffing the SQL log per request
(`performance-reports/_query-counts.json`):

| Request | SQL queries | Latency (dev-logging instance) |
|---|---:|---:|
| `GET /health` | **1** (settings lookup) | 19 ms |
| `GET /public/catalog/search` | 4 | 261 ms |
| `GET /public/catalog/featured` | 4 | 285 ms |
| `GET /public/catalog/brands` | 2 | 146 ms |
| `GET /public/catalog/:slug` | 4 | 301 ms |
| `GET /auth/me` | 2 | 25 ms |
| `GET /orders` | 4 | 65 ms |
| `GET /notifications` | 5 | 36 ms |
| `GET /wishlists` | 6 | 223 ms |
| `GET /reviews/product/:id` | 4 | 255 ms |
| `GET /seller-portal/dashboard` | **18** | 124 ms |
| `GET /seller-portal/products` | 10 | 92 ms |
| `GET /seller-portal/orders` | 6 | 71 ms |
| `GET /deliveries/rider/assigned` | 4 | 41 ms |
| `GET /admin/analytics/dashboard` | **18** | 203 ms |
| `GET /users` | 6 | 60 ms |
| `GET /orders/admin/all` | 6 | 43 ms |
| `GET /products` (admin) | 4 | 515 ms |
| `GET /deliveries/admin` | 6 | 48 ms |
| `GET /reviews/admin` | 6 | 1168 ms |
| `GET /categories` (admin) | 4 | 58 ms |
| `GET /brands` (admin) | 2 | 181 ms |
| `GET /admin/settings` | 4 | 36 ms |
| `POST /auth/login` | 10 | 192 ms |

Query count is a lower bound on DB round-trips; several are unindexed scans whose
*time* is the real cost (reviews, products, categories). The de-facto per-request
overhead is ≥1 (settings) and ≥2 for any authenticated request (+ user/roles).

`EXPLAIN ANALYZE` of the `productCounts()` subquery: Planning 18.2 ms, **Execution
55,824.8 ms**, top node **Seq Scan over 9,700 rows**.

## 10. Cache Findings

- **Redis is not actually in use locally.** The CacheModule only builds a Redis
  store when `NODE_ENV=production` **and** `REDIS_URL` is set; otherwise it uses
  the in-memory store (60 s default TTL). Redis is not running on this host.
- **Only two endpoints use Nest's cache:** `GET /inventory/seller-products` and
  `GET /inventory/seller-products/:id`, both `@UseInterceptors(CacheInterceptor)`
  `@CacheTTL(60000)`. TTL 60 s, keyed by request URL. Invalidation is purely
  TTL-based — a seller who edits a product can see stale data for up to a minute.
  (A clean hit/miss measurement was not obtained: the dev-logging instance became
  saturated during the audit window; the code path and TTL are unambiguous.)
- **One ad-hoc in-process cache:** `CatalogService.getHomepage()` keeps a 30 s
  `homepageCache` object. It is **per-process** (not shared across instances, lost
  on restart, no invalidation).
- **No caching** for the highest-traffic endpoints: `public/catalog/search`,
  `public/catalog/featured`, `public/catalog/brands`, `public/catalog/:slug`,
  `public/categories*`, `reviews/product/:id`, analytics.
- **No cache stampede protection** (no lock/soft-TTL); a TTL expiry on a hot key
  would fan out to the DB.
- **Not cached but cheap already:** `banners/public`, `flash-sales/active`,
  `notifications/*`, `locations/divisions`.
- Potential stale-data risks if caching is extended naively: session/user due to
  eager relations, order status, stock, prices.

## 11. CPU / Memory / Resource Findings (measured)

Sampled the production benchmark process every 2 s across the load run
(135 samples, OS-level counters only — `performance-reports/_resource-samples.csv`):

| Metric | Min | Avg | Max |
|---|---:|---:|---:|
| Working set | 316 MB | **441 MB** | 525 MB |
| Private bytes | 317 MB | 444 MB | 530 MB |
| CPU (% of all 8 logical cores) | 0% | **9.1%** | 16.0% |

- Peak RSS ~525 MB on a 15.9 GB box — no memory pressure observed.
- CPU stayed well under saturation at C10 for this mixed workload; the bottleneck
  is database/query time and connection-pool serialization, not CPU.
- **Not measurable with the current environment/tooling:** Node.js heap
  (used/total), event-loop lag, GC pause, and per-connection DB wait time — the app
  exposes no instrumentation for these. Only a `/health` uptime probe exists.
- Observed incidental: the broadcast worker polls `broadcast_recipients` on a timer
  even with no active campaign (visible in the query log), and an announcements
  cron runs every minute.

## 12. Existing Test Coverage (actual)

- **Tooling exists:** `test:cov` → `vitest run --coverage` with
  `@vitest/coverage-v8`.
- **Actual suite result (run this phase):** `Test Files 64 passed | 1 failed (65)`,
  `Tests 281 passed | 3 failed (284)`.
- **Failing:** `src/reviews/reviews.service.spec.ts` — 3 tests fail with
  `this.dataSource.transaction is not a function` (the service was refactored to
  `DataSource.transaction`; the mock was not updated). This contradicts the
  earlier claim that the suite is green.
- **Coverage percentage: NOT MEASURABLE in the current state** — the coverage run
  aborts on the failing suite and produces no report. No coverage percentage is
  reported rather than guessed.
- **E2E:** `apps/e2e` Playwright specs (customer/seller/rider/admin/chat/wishlist/
  notifications/otp/catalog/payments) plus `apps/api/test/*.e2e-spec.ts`.
- **Module coverage (static):** focused specs exist for auth, users, orders,
  coupons, reviews, roles, settings, audit-logs, notifications, chat, deliveries,
  disputes, payouts, wallets, banners, flash-sales, locations, addresses,
  applications, admins, impersonation, broadcast, catalog/medicine, seeder.
  **No service spec** for: `public/catalog`, `public/categories`, `public/cart`,
  `catalog/categories`, `catalog/brands`, `catalog/products`, `catalog/product-types`,
  `catalog/importer`, `shops`, `inventory/seller-products`, `seller-portal/seller-analytics`,
  `announcements` — i.e. several of the *slowest and highest-traffic* paths are untested.

## 13. Maintainability Findings

- **Very large units:** `seeder.service.ts` 2,883 lines; `public/catalog/catalog.service.ts`
  886; `payments.service.ts` 821; `seller-products.service.ts` 789; `chat.service.ts`
  713; `orders.service.ts` 644; `seller-portal.controller.ts` 612. Several mix
  query construction, mapping, business rules and side effects.
- **Business logic embedded in raw SQL** (catalog ratings/facets, seller analytics,
  broadcasts) — hard to test, duplicated in several methods (`populateProductsMetadata`,
  `getProductDetails`, `getRelatedProducts`, `getCategorySections` repeat the same
  ratings-attachment block four times).
- **250 explicit `any` occurrences** in non-spec source.
- **Duplicated patterns:** four near-identical "attach ratings" blocks; repeated
  `{data, meta:{total,page,limit,totalPages}}` envelopes hand-rolled in ~25 services;
  raw DuckDB-style `dataSource.query` fragments duplicated across modules.
- **Eager-loading coupling:** `User`/`Role` eager relations mean any `User` fetch
  silently fans out — hard to reason about cost locally.
- **`synchronize` + code-managed schema:** `NotificationsService.ensureNotificationSchema()`
  and `ChatService` run `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` at boot; some
  services auto-repair schema on column errors at request time.
- **Error handling:** global filter is consistent, but services mix `throw` and
  silent `catch` returning empty results (e.g. `createMany` returns `[]`).
- **Maintenance guard coupling:** a global guard depends on a repository and
  performs I/O on every request — an architectural smell as well as a cost.
- **`app.service.ts`** embeds ~700 lines of HTML in the backend.

No circular dependencies were detected while reading the modules.

## 14. Performance Risks (security-related)

- **Unbounded pagination / payloads:** several list endpoints return entire
  collections (`orders`, `wishlists`, `deliveries/rider/assigned`, `brands`,
  `public/catalog/brands`). `GET /brands` returns ~950 kB. These amplify load and
  enable memory/DoS pressure.
- **Unrestricted search:** `public/catalog/search?q=` uses `ILIKE %q%` across
  multiple columns with `pg_trgm` **missing**; a crafted broad query can force
  full scans on 196 k products.
- **Expensive endpoints with only the global 500/min throttle:**
  `/public/categories` (55 s DB), `/reviews/admin` (5 s), `/products` (2.5 s),
  `/admin/analytics/*`, `/auth/login` (5/min but bcrypt-expensive).
- **Login brute-force surface:** `POST /auth/login` is capped at 5/min per IP
  (production) — good — but each attempt costs ~2 s of CPU (bcrypt cost 10), so a
  distributed burst is a CPU-exhaustion vector.
- **Repeated auth work:** every authenticated request re-loads the user + eager
  roles/permissions and re-checks maintenance settings (≥2 extra queries).
- **Unrestricted file operations:** upload endpoints accept images up to 5 MB
  (auth avatar) — validation is by buffer signature, size-capped.
- **`public/categories` is public and unauthenticated** yet costs ~56 s of DB CPU
  per call — trivially weaponizable as a denial-of-service.
- No response-size limits or `limit` upper bound on several list endpoints.

## 15. Recommended Optimization Areas (direction only — NOT implemented)

1. Restore/deliver the missing performance indexes and stop `synchronize` from
   dropping them (migration-only schema in every environment; consider making the
   index migration idempotent/re-runnable).
2. Rewrite `public/categories` counts as a single set-based aggregate (recursive
   CTE or pre-aggregated `product_count` on categories) instead of a per-category
   correlated subquery; cache the category tree.
3. Add indexes: `reviews(product_id, is_approved)`, `coupon_usages(coupon_id, user_id)`.
4. Cache read-mostly public catalog/category responses (Redis) with explicit keys
   and invalidation; add stampede protection.
5. Make `name_asc` sortable (covering index / denormalized sort key).
6. Fix `admin/analytics/demand` (functional bug) and make analytics aggregation
   set-based/parallel and/or pre-computed.
7. Paginate the unbounded lists (`orders`, `wishlists`, `deliveries/rider/assigned`,
   `brands`); trim payloads (field selection, no deep nested relations).
8. Cache/avoid the per-request `MaintenanceGuard` settings query and the eager
   role/permission loading on the JWT path.
9. Offload bcrypt and/or batch/queue login; keep per-IP throttling.
10. Add observability (query timing, heap, event-loop lag) so the next baseline
    can be measured rather than inferred.

## 16. Priority Classification

**Critical**
- `GET /public/categories` and `/public/categories/tree` — 55.8 s DB query; public DoS vector.
- Missing migration performance indexes on the live DB (and `synchronize` dropping them).
- `reviews` table has no usable index for the hottest aggregate query.
- `GET /admin/analytics/demand` returns HTTP 500 (broken).

**High**
- `public/catalog/search?sort=name_asc` (4.7 s), `/public/catalog/brands` (0.8 s, 856 kB).
- `reviews/admin` (5.4 s), `products` admin (2.5 s), `public/catalog/featured` (0.78 s).
- Unbounded list payloads (`orders` 115 kB, `brands` 953 kB, rider deliveries 53 kB).
- Per-request settings query + eager role/permission loading on auth path.
- `login` renders ~2 s of CPU per attempt.

**Medium**
- `wishlists` (0.66 s), `public/catalog/:slug` (0.63 s), `seller-portal/dashboard` (18 queries),
  `analytics/dashboard` (18 queries), `getCategorySections` N+1, `public/cart/validate`.
- Cache only covers two endpoints; no invalidation; no Redis locally.
- Test suite failing (`reviews.service.spec`) and no coverage report.
- Large services / duplicated query blocks / 250 `any`s.

**Low**
- `brands`/`coupons`/`audit-logs` list latency (~0.1 s), `locations/divisions`,
  `banners/public`, `flash-sales/active`, `suggestions`, `notifications/*`.
- `app.service.ts` embedded HTML.

---

### Methodology & honesty notes

- Latency numbers are HTTP-level autocannon measurements on a production-mode
  instance against the real local PostgreSQL dataset (196 k products / 728 k reviews).
  Server-side query times come from `EXPLAIN (ANALYZE, BUFFERS)`.
- The benchmark instance disabled rate limiting **only to remove the 500/min and
  5/min production caps from the measurement**; this is a local test instance, not
  a config change to the repo.
- `p95` is reported from autocannon's p97.5 bucket; autocannon has no p95.
- Two admin endpoints (`users`, `orders/admin/all`) were re-measured in isolation
  because a preceding pathological endpoint (`analytics/demand`) exhausted the DB
  connection pool and produced misleading zeros in the sequential sweep.
- No application code, schema, index, cache or configuration was modified.
