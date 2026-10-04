# Gramer Bazar — Backend Optimization Backlog (Phase 1 output)

> **Nothing here is implemented.** This is a prioritized list produced from the
> Phase 1 baseline (`performance/baseline/backend-performance-baseline.md`).
> Priorities: Critical / High / Medium / Low.

---

## CRITICAL

### 1. Public category counts execute a 55-second query
```
Issue: GET /public/categories and /public/categories/tree compute per-category
       product counts with a correlated subquery per category.
Location: apps/api/src/public/categories/categories.service.ts :: productCounts()
Evidence: EXPLAIN (ANALYZE) of the exact SQL = Execution 55,824.8 ms, Seq Scan over
          9,700 categories; both HTTP endpoints exceed a 20s cold timeout at C10;
          productCounts() also runs under findBySlug().
Impact: Critical — storefront category navigation is effectively non-functional and
        is a public, unauthenticated DoS vector.
Priority: Critical
Possible Solution: Replace with a single set-based aggregate (recursive CTE over the
        materialized path, or maintain a product_count column updated on change) and
        serve it from cache. Do not change schema in this phase.
Expected Benefit: 55,000ms -> target < 200ms server-side; removes a public DoS vector.
Risk: Medium — taxonomy counts must stay correct across product add/remove.
How We Will Measure Improvement: EXPLAIN ANALYZE execution time and HTTP p95 for both
        endpoints before/after; correctness check on a sample of categories.
```

### 2. Migration performance indexes absent from the live database
```
Issue: The partial and pg_trgm indexes created by SearchAndPaginationIndexes are not
       present in pg_indexes, even though the migration is recorded as run — the dev
       server's synchronize=true appears to have dropped them.
Location: apps/api/src/migrations/1792000000000-SearchAndPaginationIndexes.ts;
          apps/api/src/app.module.ts (synchronize)
Evidence: 10/10 migration indexes missing (idx_categories_path_pattern,
          idx_sp_created_at_id_active, idx_sp_price_asc_id_active,
          idx_sp_price_desc_id_active, idx_products_category_active,
          idx_products_brand_active, idx_products_name_en_trgm,
          idx_products_name_bn_trgm, idx_products_slug_trgm, idx_products_rating_active).
Impact: Critical — every catalog/search measurement in this baseline is degraded vs
        the intended schema; production may behave differently.
Priority: Critical
Possible Solution: Enforce migration-only schema (synchronize=false everywhere) and
        make the index migration idempotent/verifiable; ensure environments converge.
Expected Benefit: Restores the intended query plans for search and sorting.
Risk: Medium — applying indexes online on large tables takes time/locks.
How We Will Measure Improvement: pg_indexes presence + EXPLAIN ANALYZE plans and p95
        for search/sort endpoints before/after.
```

### 3. `reviews` has no index for its hottest query
```
Issue: Every product list/detail/wishlist/review endpoint aggregates reviews by
       product_id + is_approved, but the table has only a primary key.
Location: db table "reviews" (728,295 rows) — migration/entity index definitions.
Evidence: pg_indexes shows only PK; query counts show ratings aggregates on most
          product endpoints; reviews/product and wishlists measure 0.58-0.66s.
Impact: Critical — repeated full scans of a 728k-row table on hot storefront paths.
Priority: Critical
Possible Solution: Add a composite index on (product_id, is_approved) (and consider a
       denormalized rating already partially present on products).
Expected Benefit: Large latency drop for catalog detail/ratings and admin reviews.
Risk: Low-Medium — index build cost only.
How We Will Measure Improvement: EXPLAIN ANALYZE the ratings query; p95 of
       /public/catalog/:slug, /reviews/product/:id, /wishlists, /reviews/admin.
```

### 4. `GET /admin/analytics/demand` is broken
```
Issue: The endpoint throws on every request.
Location: apps/api/src/analytics/analytics.service.ts :: getDemandAnalytics()
Evidence: HTTP 500, body "column request.productname does not exist" (QueryFailedError).
Impact: Critical (functionally) — admin demand analytics is unusable; also an
        accidental query amplifier for anyone probing it.
Priority: Critical
Possible Solution: Align the raw query column aliases with the ProductRequest entity's
        mapped columns (function fix), then re-benchmark.
Expected Benefit: Endpoint returns data; removes a 500-returning endpoint.
Risk: Low.
How We Will Measure Improvement: HTTP 200 with valid payload; p95 latency once fixed.
```

---

## HIGH

### 5. Cross-table `name_asc` catalog sort
```
Issue: GET /public/catalog/search?sort=name_asc sorts by products.name_en across a
       join with no covering index.
Location: apps/api/src/public/catalog/catalog.service.ts (search(), name_asc branch)
Evidence: avg 4,718ms / p95 5,467ms / 0.84 rps at C10.
Impact: High — a core storefront sort; effectively unavailable under load.
Priority: High
Possible Solution: Provide a sortable key (covering index or denormalized sort column),
       or isolate this sort behind a bounded strategy. Requires schema/index work.
Expected Benefit: Sub-second p95 comparable to price sorts.
Risk: Medium — index/denormalization maintenance.
How We Will Measure Improvement: p50/p95/p99 and RPS before/after at the same concurrency.
```

### 6. Unpaginated `brands` payloads (856 kB–953 kB)
```
Issue: GET /public/catalog/brands and GET /brands return the entire brand table.
Location: apps/api/src/public/catalog/catalog.service.ts :: getBrands(); brands module.
Evidence: 856 kB payload / 815ms (public) and 953 kB / 1,246ms (admin).
Impact: High — bandwidth + serialization + GC cost per request.
Priority: High
Possible Solution: Paginate and/or return only id + name + slug.
Expected Benefit: ~1MB -> ~50-100kB; lower latency and egress.
Risk: Low — frontend consumers must tolerate pagination.
How We Will Measure Improvement: payloadBytes and p95 before/after.
```

### 7. Unbounded customer order list
```
Issue: GET /orders returns every order (and every order item's nested relations) for
       a user with no pagination.
Location: apps/api/src/orders/orders.service.ts :: findCustomerOrders()
Evidence: 115 kB payload, 120ms avg (grows linearly with order history).
Impact: High — payload grows without bound for long-lived customers.
Priority: High
Possible Solution: Add offset/cursor pagination + field selection.
Expected Benefit: Bounded payload/time per request.
Risk: Low-Medium — API contract change for the frontend.
How We Will Measure Improvement: payloadBytes and p95 at increasing order counts.
```

### 8. Per-request settings query (global guard)
```
Issue: MaintenanceGuard runs SettingsService.getSettings() (a full table find) on
       every request, including public ones.
Location: apps/api/src/common/guards/maintenance.guard.ts;
          apps/api/src/settings/settings.service.ts
Evidence: query logging shows exactly 1 SQL query for GET /health and public endpoints.
Impact: High — a fixed DB round-trip added to 100% of traffic.
Priority: High
Possible Solution: Cache settings (short TTL / in-memory with invalidation on update)
       or read the maintenance flag without I/O on the hot path.
Expected Benefit: Removes one round-trip from every request.
Risk: Low — stale maintenance flag for the TTL window.
How We Will Measure Improvement: query count per request; p95 of /health and a
       lightweight public endpoint.
```

### 9. Eager role/permission loading on the auth path
```
Issue: User.roles, User.directPermissions and RoleEntity.permissions are eager=true,
       and JwtStrategy.findById loads them for every authenticated request.
Location: apps/api/src/users/entities/user.entity.ts, roles/entities/role.entity.ts,
          auth/strategies/jwt.strategy.ts, users/users.service.ts :: findById()
Evidence: /auth/me = 2 queries in the logging instance; authenticated endpoints show
          additional user/role queries.
Impact: High — extra joins/round-trips on every protected request.
Priority: High
Possible Solution: Load roles/permissions only where authorization needs them, or
       cache the principal per token.
Expected Benefit: Fewer queries per authenticated request.
Risk: Medium — must preserve RBAC correctness.
How We Will Measure Improvement: query counts for authenticated endpoints; p95 of
       representative protected routes.
```

### 10. Login cost (bcrypt)
```
Issue: POST /auth/login performs bcrypt (cost 10) inline.
Location: apps/api/src/auth/auth.service.ts; auth.controller.ts (5/min throttle)
Evidence: 1,919.9ms avg / 3,098ms p95 / 4.67 rps at C10.
Impact: High — CPU-bound latency and a brute-force/CPU-exhaustion surface.
Priority: High
Possible Solution: Keep the per-IP throttle; consider lower cost only with security
       review, or offload/queue hashing.
Expected Benefit: Lower p95 and better resilience under login bursts.
Risk: High (security) — must not weaken password hashing.
How We Will Measure Improvement: login p95 and CPU under a controlled burst.
```

---

## MEDIUM

### 11. Uncached high-traffic public reads
```
Issue: public/catalog/search, /featured, /brands, /:slug, /public/categories are
       uncached; cache exists but is only used by inventory/seller-products.
Location: apps/api/src/app.module.ts (CacheModule), seller-products.controller.ts
Evidence: featured 776ms, search 485ms, details 630ms; CacheInterceptor used on only
          2 endpoints (60s TTL, URL-keyed, TTL-only invalidation).
Impact: Medium — repeated identical work under traffic.
Priority: Medium
Possible Solution: Cache read-mostly catalog responses with explicit keys + invalidation
       on product/category/brand writes; add stampede protection; confirm Redis in prod.
Expected Benefit: Large p95/RPS gains on the storefront.
Risk: Medium — stale-data windows; needs invalidation design.
How We Will Measure Improvement: p95/RPS + cache hit ratio before/after.
```

### 12. `reviews/admin` and `products` (admin) lists
```
Issue: Expensive admin listing queries.
Location: reviews module; catalog/products/products.service.ts
Evidence: reviews/admin 5,418ms avg / 5,906ms p95; products 2,478ms avg / 4,150ms p95.
Impact: Medium — admin UX and DB load (bounded frequency).
Priority: Medium
Possible Solution: Composite indexes, avoid deep relation loading in list views,
       count via estimated counts where exactness is unnecessary.
Expected Benefit: Sub-second admin lists.
Risk: Low.
How We Will Measure Improvement: p95 and EXPLAIN ANALYZE before/after.
```

### 13. `getCategorySections` N+1 (homepage)
```
Issue: CatalogService.getCategorySections() runs a product query, a ratings query and
       a sub-category query inside a loop over every root category.
Location: apps/api/src/public/catalog/catalog.service.ts:617
Evidence: static read; called by getHomepage().
Impact: Medium — homepage fan-out scales with root category count.
Priority: Medium
Possible Solution: Batch the per-category queries (single query with grouping).
Expected Benefit: Query count drops from O(categories) to O(1).
Risk: Low.
How We Will Measure Improvement: query count for /public/catalog/category-sections and
       /homepage.
```

### 14. Analytics aggregation is sequential and heavy
```
Issue: ~13 sequential queries in the admin dashboard; seller dashboard issues 18;
       demand endpoint (once fixed) runs multiple GROUP BY / correlated NOT EXISTS.
Location: analytics/analytics.service.ts; seller-portal/seller-analytics.service.ts
Evidence: measured 18 queries each for /admin/analytics/dashboard and
          /seller-portal/dashboard; demand query subqueries over seller_products/inventory.
Impact: Medium — cost scales with data volume.
Priority: Medium
Possible Solution: Pre-aggregate/materialize, parallelize independent queries, cap
       date ranges.
Expected Benefit: Lower DB load and better admin latency.
Risk: Medium.
How We Will Measure Improvement: query count + p95 before/after.
```

### 15. Test suite failing and no coverage
```
Issue: reviews.service.spec.ts fails (3 tests) and the coverage run produces no report.
Location: apps/api/src/reviews/reviews.service.spec.ts
Evidence: "this.dataSource.transaction is not a function"; 281/284 tests pass;
          coverage aborts.
Impact: Medium — no trustworthy regression signal before optimization.
Priority: Medium
Possible Solution: Update the spec's DataSource mock to provide transaction(); then run
       test:cov to obtain a real coverage baseline.
Expected Benefit: Green suite + measurable coverage.
Risk: Low — test-only change (not made in this phase).
How We Will Measure Improvement: suite exit 0 and coverage summary.
```

### 16. Maintainability debt on hot paths
```
Issue: Duplicated rating-attachment SQL (4 copies), ~25 hand-rolled envelopes, 250
       explicit any, several 600-800 line services; schema auto-repair at runtime.
Location: public/catalog/catalog.service.ts; notifications.service.ts;
          chat.service.ts; seller-portal/*; app.service.ts
Evidence: static read (see baseline §13).
Impact: Medium — raises the risk and cost of every optimization.
Priority: Medium
Possible Solution: Extract shared query/mapper helpers; type the raw query results;
       move schema repair to migrations.
Expected Benefit: Safer/faster future changes.
Risk: Low (refactor only).
How We Will Measure Improvement: duplication count, lint/typecheck, test suite.
```

---

## LOW

### 17. Rider delivery list is unbounded
```
Issue: GET /deliveries/rider/assigned returns all deliveries for a rider.
Location: apps/api/src/deliveries/deliveries.service.ts :: getRiderDeliveries()
Evidence: 53 kB payload, 110ms avg.
Impact: Low (rider histories are small today).
Priority: Low
Possible Solution: Paginate.
Expected Benefit: Bounded payload and stable latency as rider history grows.
Risk: Low.
How We Will Measure Improvement: payloadBytes + p95.
```

### 18. Working-set growth and missing observability
```
Issue: RSS ranged 316-525MB during load; no heap/event-loop/query-time metrics exist.
Location: apps/api/src/main.ts; app.controller.ts (/health)
Evidence: 135 OS-level samples; no instrumentation endpoints.
Impact: Low today; blocks precise future baselining.
Priority: Low
Possible Solution: Add lightweight metrics (heap, event-loop lag, slow-query log).
Expected Benefit: Enables precise, reproducible baselining of memory and event-loop health.
Risk: Low.
How We Will Measure Improvement: metric availability + trend across runs.
```

### 19. Oversized embedded HTML in a backend service
```
Issue: app.service.ts contains ~700 lines of landing-page HTML.
Location: apps/api/src/app.service.ts
Evidence: file size 704 lines.
Impact: Low — maintainability only.
Priority: Low
Possible Solution: Move markup to a template/static asset.
Expected Benefit: Smaller service module, clearer separation of concerns, easier review.
Risk: Low.
How We Will Measure Improvement: file size / separation of concerns.
```
