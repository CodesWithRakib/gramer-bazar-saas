# Gramer Bazar — System Audit & Completion Status

> As-built source of truth. This document describes what the code **actually does**,
> not what the original design documents aspire to. Where the two disagree, the
> discrepancy is called out explicitly.

Last updated: 2026-09-23 (phases 6–9 complete; notifications pipeline fixed, OTP shadow-account fix, full E2E coverage)

---

## 1. Repository shape

| Area | Path | Stack |
|---|---|---|
| Web app | `apps/web` | Next.js 16 (App Router, `[lang]` locale segment), React 19, Redux Toolkit + RTK Query, Tailwind v4, shadcn/ui, Socket.IO client, Serwist PWA, Sentry |
| API | `apps/api` | NestJS 12, TypeORM (Postgres), Passport JWT, Socket.IO gateway, Swagger, class-validator, SSLCommerz, Resend |
| Shared | `packages/types`, `packages/tsconfig`, `packages/eslint-config` | workspace packages |
| E2E | `apps/e2e` | Playwright — `customer-flow`, `seller-flow`, `rider-flow`, `admin-flow`, `chat-flow` specs |
| Docs | `Gramer_Bazar_*_Document.md`, `QA/*` | design intent + QA scaffolding |

Commands (root): `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`,
`pnpm test:e2e:api`, `pnpm test:e2e:web`. Per app: `pnpm -C apps/web|apps/api <script>`.

Localization: `/en/...` and `/bn/...`; default locale `en`; locale redirect is done in
`apps/web/proxy.ts` (Next 16 replacement for `middleware.ts`).

---

## 2. Actors & role model

`SUPER_ADMIN`, `ADMIN`, `SELLER`, `RIDER`, `CUSTOMER` (`roles/enums/role.enum.ts`).
Guards: `JwtAuthGuard` + `RolesGuard` (`common/guards`). JWT payload `{ sub, phone }`;
`JwtStrategy.validate` loads the user and attaches it to `req.user`.

---

## 3. Feature inventory (as built)

Legend: ✅ complete · 🟡 partial · 🔴 broken/missing · 📄 doc-only

| Feature | Doc | Frontend | Backend | API wired | Status |
|---|---|---|---|---|---|
| Auth (OTP + password) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile / password / avatar | ✅ | ✅ | ✅ | ✅ | ✅ |
| Addresses + locations (BD geo) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Catalog (categories, brands, products, search, featured, related) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Product details | ✅ | ✅ | ✅ | ✅ | ✅ (hooks-order bug fixed) |
| Cart (client-side Redux) | ✅ | ✅ | n/a | n/a | ✅ |
| Checkout (COD + SSLCommerz) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Orders (customer list/detail/cancel) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Order lifecycle (admin status, history, delivery) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Wishlist | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reviews + admin moderation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ (creation wired this pass — finding 27) |
| Chat (customer/seller/rider/admin) | ✅ | ✅ | ✅ | ✅ | ✅ (single socket provider, fixed this pass) |
| Seller portal (shop, products, orders, wallet, payouts, reports) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rider (assigned deliveries, status, location) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin (users, sellers, products, categories, orders, riders, deliveries, product requests, coupons, flash sales, banners, reviews, disputes, payouts, settings) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Product Request (customer + admin) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Flash sales | ✅ | ✅ | ✅ | ✅ | ✅ |
| Coupons | ✅ | ✅ | ✅ | ✅ | ✅ |
| Disputes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Payments (SSLCommerz success/fail/cancel/ipn) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Analytics (dashboard, demand) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audit Logs | ✅ | ✅ | ✅ | ✅ | ✅ (implemented in this pass) |
| Shop settings (seller) | ✅ | ✅ | ✅ | ✅ | ✅ (contract repaired in this pass) |
| Platform settings (admin) | ✅ | ✅ | ✅ | ✅ | ✅ (real persistence added in this pass) |
| Rider earnings | 📄 | — | 🔴 | — | Out of scope (no fee model) |
| Product moderation workflow | ✅ | 🟡 | ✅ | ✅ | Admin product management exists |
| Maintenance mode | 📄 | 🔴 | 🔴 | — | Out of scope — needs request gating (see §4) |

---

## 4. Findings & fixes (Phase 0 / Phase 1)

### Blocking (fixed)

1. **API `typecheck` failed** — 10 spec files imported local modules without the
   `.js` extension required by `moduleResolution: node16`. Fixed → `apps/api`
   typechecks clean. Web also typechecks clean.
2. **Stray `apps/web/pnpm-workspace.yaml`** declared `apps/web` as a 1-package
   workspace root, so `pnpm -C apps/web <script>` failed with
   "no package named @gramer-bazar/eslint-config". Removed.
3. **Duplicate `/[lang]` route** — `app/[lang]/(customer)/page.tsx` shadowed
   `app/[lang]/page.tsx`. The Turbopack build silently dropped the former; the
   duplicate was dead and a latent conflict. Removed the dead page.
4. **`ProductDetailsClient` violated the Rules of Hooks** — `useState`/`useEffect`/
   RTK hooks were called after an early `return` for empty products. Reordered so
   all hooks run unconditionally. Verified with `react-hooks` lint.

### Correctness / security (fixed)

5. **Chat was non-functional on the profile messages page.** `components/chat/
   ChatInterface.tsx` used a different event contract (`sendMessage`, `newMessage`)
   than the gateway (`send_message`, `new_message`), never joined the conversation
   room, and read the JWT from a `token=` cookie that is never set (the app stores
   the token in `localStorage`). It now uses the working `useChatSocket` hook. The
   obsolete/broken `hooks/useSocket.ts` was deleted. Also fixed `markMessagesAsRead`
   (was `POST`, backend is `PATCH /chat/conversations/:id/read`).
6. **JWT environment variable mismatch.** Runtime code read `JWT_SECRET` /
   `JWT_EXPIRES_IN`, while `.env.example` and `config/env.validation.ts` require
   `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `JWT_ACCESS_EXPIRES_IN`. The
   configured secrets were effectively ignored (a dev-default secret was used
   everywhere). Unified on `JWT_ACCESS_SECRET` / `JWT_ACCESS_EXPIRES_IN`, and
   updated `docker-compose.prod.yml` (which previously only set `JWT_SECRET`,
   meaning the production API would have failed env validation on boot).
7. **Socket fallback URL pointed at port 3001**; the API runs on 4000. Fixed.
8. **Admin area had no route guard.** `app/[lang]/admin/layout.tsx` was a server
   component with no auth/role check, unlike seller/rider. Converted to a guarded
   client layout requiring `ADMIN`/`SUPER_ADMIN`.
9. **`UsersController` required exactly `ADMIN`**, blocking `SUPER_ADMIN`. Now
   allows both.

### Dead code / fake data (fixed)

10. Deleted dead `components/checkout/CheckoutClient.tsx` + `features/checkout/
    checkoutApi.ts` (unreferenced duplicate checkout with fake "Add Address"
    buttons and a conflicting ৳50 fee vs the real page's ৳60). The real page is
    `app/[lang]/(customer)/checkout/page.tsx`.
11. Removed a cross-app import (`../../../../api/src/...`) from the web bundle.
12. Removed fabricated UI data: "15 people bought this in the last 24 hours" and
    rider "Today's Earnings = completed × ৳60" (no fee data exists in the model).
13. **Audit logs** were a mock table. Implemented a real backend
    (`audit-logs` module: entity + service + `GET /admin/audit-logs`) that records
    admin user/order/product-request changes, and rewired the admin page to it
    with loading/empty/error/pagination states.
14. Removed debug `console.log`s from the chat gateway and socket provider.
15. **Dashboard navigation pointed at non-existent pages** (`/admin/shops`,
    `/admin/offers`, `/seller/settings`, `/rider/earnings`, `/rider/settings`,
    `/settings`). Rewrote `config/dashboard-routes.ts` to match real routes and
    surface implemented admin/seller pages. Also removed an in-render `require()`
    and a `SidebarContent` defined inside render in `DashboardLayout`.

### Test suite (fixed)

16. **API unit suite was red (31/32 files).** The specs were Nest CLI scaffolding
    (`Test.createTestingModule` with no providers), so DI could not resolve
    repositories, services, `DataSource`, `EventEmitter2`, `ConfigService`, or the
    `@UseGuards` guards. Every spec now supplies the required mocks
    (`getRepositoryToken`, service stubs) and overrides guards where needed.
    **`pnpm -C apps/api test` → 32/32 files pass** (33/33 after the settings
    spec added in the journey pass). `oxlint` is down to 0 errors / 30 warnings.

### Web lint (fixed)

17. **Web ESLint had 91 errors** (80 `no-explicit-any`, 9
    `react-hooks/set-state-in-effect`, 2 `react/no-unescaped-entities`). All
    errors are now resolved:
    - Introduced `src/lib/apiError.ts` (`getApiErrorMessage`) and replaced every
      `catch (err: any)` with a typed `unknown` + helper (29 sites).
    - Replaced `any` in DataTables/dialogs/callbacks with the real API types
      (`Brand`, `Category`, `Product`, `Delivery`, `Order`, `Coupon`, `FlashSale`,
      `ProductRequest`, `User`, `WishlistItem`, `SellerProductItem`, `ChatMessage`,
      `Role`), and typed `sitemap.ts`, `InstallPrompt`, and the `Button` motion
      spread.
    - Reworked all `set-state-in-effect` sites to the React "adjust state during
      render" pattern (URL/prop sync) or lazy initialisation (geolocation,
      locale in error boundary, hydration flag via `useSyncExternalStore`).
    - **This surfaced and fixed 5 latent bugs**: seller product list rendered
      `productVariant.product.name` (a non-existent field instead of
      `nameEn`/`nameBn`); the floating chat widget read `conv.lastMessage`
      (field does not exist on `Conversation`).
    - `pnpm -C apps/web lint` now **exits 0** (86 warnings remain, mostly
      pre-existing unused imports).

### Journey execution — phases 3/4/5 (fixed)

Driving the seller, rider and admin journeys with Playwright against the live
stack surfaced four more real defects, all fixed:

18. **Seller "Shop Settings" was broken end-to-end.** `PATCH
    /seller-portal/shop` accepted `name` / `address` / `phone`, but the `Shop`
    entity (and the `shops` table) has `nameEn` / `nameBn` / `slug` /
    `description` / `logo` / `banner` — there is no phone or address column, and
    the storefront reads the contact number from `shop.seller.phone`. Saving the
    form therefore failed: `name` returned
    `EntityPropertyNotFoundError: Property "name" was not found in "Shop"` (500),
    and `phone` was rejected by `@IsPhoneNumber`. The DTO, the service and both
    seller forms (`/seller/shop` and `/seller/profile`) now use `nameEn`,
    `nameBn`, `description`, and the service ignores undefined keys so a partial
    payload can never clear unrelated columns.
19. **Dashboard header/sidebar highlighted the wrong item on nested routes.**
    `DashboardLayout` resolved the active route with `routes.find()` (first
    prefix match), so `/rider/deliveries` activated **Dashboard** — the header
    read "Dashboard" on every rider sub-page. It now resolves the **longest**
    matching href, and both the header title and the sidebar active state use it.
20. **Login rate limiting blocked automated journeys.** `POST /auth/login` is
    capped at 5 requests/60 s per IP (and `/auth/send-otp` at 3). A single dev
    IP triggered `429`s after ~three logins, so E2E journeys silently stalled on
    the login screen. The limits stay production-safe but are now
    env-configurable (`AUTH_LOGIN_THROTTLE_LIMIT`, `AUTH_SEND_OTP_THROTTLE_LIMIT`,
    `AUTH_VERIFY_OTP_THROTTLE_LIMIT`, `AUTH_REGISTER_THROTTLE_LIMIT`,
    `THROTTLE_LIMIT`, `THROTTLE_TTL_MS`), documented in `.env.example`.
21. **Admin Settings was a fake form.** `/admin/settings` rendered `defaultValue`
    inputs, a Save button with no handler and unchecked/unwired checkboxes, and
    there was no settings API at all. Added a real `settings` module
    (`platform_settings` key/value table, `GET`/`PATCH /admin/settings` guarded to
    admin, audit-logged on write) and rewired the page to it with
    loading/error/dirty states. `allowSellerRegistration` is **enforced** in
    `AuthService.registerStaff`.
22. **Maintenance mode removed from the UI.** The checkbox promised "only admins
    can access the website", which needs request gating (edge/proxy or a global
    API guard with admin bypass) that the current build does not have. Persisting
    the flag without honouring it would be a fake control, so the toggle was
    removed and the capability is recorded as out of scope (§3).

The E2E suite itself also had two credibility problems that were fixed: it was
running 2 workers against a dev server that compiles routes on first hit (causing
multi-second stalls), and it never actually placed an order. The config now runs
one worker with a warm-up pass per route, a 90 s test timeout, and the journeys
cover real order placement and the full delivery lifecycle.

### Cross-system consistency — phase 6 (fixed)

23. **The shared `DataTable` had no error state and hardcoded English strings.**
    When an admin API call failed (401, 500, network), all nine DataTable-backed
    admin pages (users, sellers, riders, orders, deliveries, product-requests,
    products, categories, brands) silently rendered the empty state — a real
    failure looked identical to an empty table. The shared component now accepts
    `isError` / `onRetry` / `emptyMessage` / `errorMessage` / `isBn`, renders a
    distinct error row with a retry button, and localizes the loading/empty/
    pagination chrome into Bangla/English. All nine pages pass `isError` and
    `refetch` through.

An envelope audit confirmed the rest of the list endpoints are **already
consistent** and were left alone: every paginated service (users, orders,
products, categories, brands, coupons, flash-sales, deliveries, product-requests,
reviews, audit-logs, public catalog) returns the same `{ data, meta: { total,
page, limit, totalPages } }` shape, and every frontend consumer types it through
the shared `PaginationMeta`. Non-paginated admin lists (payouts, banners,
disputes, shops) intentionally return bare arrays — they are small bounded
lists, documented as such rather than wrapped for symmetry.

### Unit spec gaps — phase 6 (fixed)

24. **Modules with business-critical logic had no unit specs.** Added focused
    service specs:

    - `orders.service.spec.ts` (11 tests) — checkout math (subtotal, ৳50 delivery
      fee, coupon discount incl. max-cap and subtotal clamp), stock deduction and
      insufficient-stock rejection, address-ownership rejection, expired/limit
      coupon rejections, online payment initiation, cancellation restoring
      inventory and refusing non-cancellable statuses.
    - `auth.service.spec.ts` (12 tests) — password login happy path + wrong
      password / unknown user / blocked account / OTP-only account, staff
      registration incl. the seller-registration gate, duplicate rejection, OTP
      first-verification account creation.
    - `coupons.service.spec.ts` (10 tests) — percentage/fixed discount math, cap,
      clamp, and every validation rejection path.
    - `users.service.spec.ts` (9 tests) — lookups, role attachment on create,
      update merge, pagination envelope + role filter.
    - `reviews.service.spec.ts` (7 tests) — verified-purchase rule, duplicate
      rule, moderation, admin envelope.
    - `audit-logs.service.spec.ts` (6 tests) — best-effort `record()` semantics
      (null fallbacks, swallowed failures), search + pagination.

    Combined with the earlier suites: **39 spec files / 93 tests pass.**

### Socket consolidation & anonymous auth noise — fixed

25. **Two parallel socket clients and anonymous `/auth/me` calls, fixed
    together.**

    - **One socket for the whole app.** `SocketProvider` now exclusively owns the
      singleton from `lib/socket.ts` (whose stale `:3001` fallback is corrected
      to `:4000`): it connects when the auth slice has a token and disconnects on
      logout. `useChatSocket` was rewritten to consume that shared socket —
      join/leave rooms, sync `new_message` into the RTK Query cache, expose
      `sendMessage` — and no longer opens its own connection. `SocketProvider`
      itself no longer runs an eager `useGetProfileQuery()`; it keys off the
      Redux auth slice (populated from `localStorage` on boot, refreshed by
      `AuthInitializer`).
    - **No anonymous `/auth/me`.** `ChatInterface` and `FloatingChatWidget` now
      read identity from the auth slice and `skip` their chat queries while
      logged out (the dead `ChatInbox.tsx`, never imported anywhere, was
      deleted); the customer profile page also passes `skip: !isAuthenticated`.
    - **Locked in by tests.** New `chat-flow.spec.ts` (4 E2E tests): anonymous
      visitors trigger zero `/auth/me` calls; every `/auth/me` after login
      carries an `Authorization` header; the messages page renders ChatInterface
      live; and client-side navigation reuses exactly **one** socket.io
      connection instead of opening parallel ones.

### Seller contact editor & seeded riders — fixed

26. **Seller contact editor and seeded riders, closed together.**

    - **Seeded riders.** `SeederService.seedUsersAndShops` now creates
      `rider1@gramerbazar.com` (Babul Mia, `+8801700000005`) and
      `rider2@gramerbazar.com` (Kamal Sheikh, `+8801700000006`), both
      `password123`, ACTIVE, email-verified — every actor in the BRD (admin,
      customer, sellers, riders) now has a seeded account out of the box. The
      rider E2E logs in with the seeded rider and only falls back to public
      registration when the database predates this seeder.
    - **Seller contact editor.** The seller profile page gained an **Account
      Info** form (first/last name, contact phone → `PATCH /auth/me`), closing
      the gap where the storefront contact number was uneditable by sellers.
      Both forms (account + shop) localize to Bangla/English. A new E2E test
      fills the phone, saves, asserts the toast, verifies the change through
      `GET /auth/me`, and restores the seeded value.
    - **Coverage cleanup.** `roles` and `seeder` unit specs added (role seeding
      idempotency; six seeded accounts with hashed passwords; two shops);
      empty `QA/BUG_REPORT.md` removed; `QA/TEST_MATRIX.md` filled with real
      per-journey coverage; root scratch scripts moved to `QA/scratch/`.

### Notifications were never created; OTP login created shadow accounts — fixed

27. **In-app notifications could never appear, and OTP login created shadow
    accounts.** Discovered while closing the E2E coverage gaps:

    - **Dead notifications pipeline.** The `Notification` entity, service,
      REST endpoints, bell dropdown and `/notifications` page all existed — but
      **no code path ever created an in-app notification** (only order
      confirmation emails were sent). Every documented "customer/rider is
      notified" journey was dead on arrival. Fixed at the two existing
      lifecycle transaction points: `updateAdminOrderStatus` now inserts an
      `ORDER_UPDATE` notification for the customer, and delivery assignment
      inserts one for the rider. Verified end-to-end by a new E2E test
      (customer checkout → admin status change → notification visible on
      `/notifications` → mark-all-read).
    - **OTP login shadow accounts.** `POST /auth/send-otp` accepts local
      Bangladeshi numbers (`01700000002`) but users are stored E.164
      (`+8801700000002`), and `verifyOtp` looked users up with the raw input —
      so an existing customer OTP-ing in got a **brand-new duplicate account**
      instead of logging in. `UsersService` now normalizes BD numbers
      (`01XXXXXXXXX` / `880…` → `+88…`) on lookup and `AuthService` stores the
      normalized form when creating first-time OTP customers. Verified live:
      OTP verify now returns a token for the existing user and the users table
      keeps exactly one row for the phone.
    - **Dev OTP peek.** `GET /dev/otp/:phone` (dev-only, guarded like
      `POST /dev/seed`) lets automated tests read the generated code since no
      SMS provider is wired; the OTP login UI journey is now covered by two
      E2E tests (happy path + wrong-code rejection).
    - **Wishlist a11y/testability.** The heart button on product details had
      no accessible name; it now has localized `Add to wishlist` /
      `Remove from wishlist` labels (the wishlist page trash button likewise),
      and a wishlist add → view → remove E2E journey locks the flow in.

### Not yet addressed (remaining work)

- **Web lint warnings (4)** — React Compiler informational notes only:
  TanStack Table `useReactTable()` and react-hook-form `form.watch()` return
  non-memoizable functions, so the compiler skips those 3 components. All
  actionable warnings/errors are gone (was 86 warnings + 15 errors).
- ~~**Two parallel socket clients**~~ **Consolidated (this pass, finding 25).**
- **Auth token stored in `localStorage`** (not httpOnly cookie) — XSS exposure.
  Documented as security debt; changing it touches the whole auth flow.
- **Design documents are aspirational.** The Backend design doc lists routes such
  as `/api/v1/admin/categories`, `/api/v1/products/:slug`, `/api/v1/locations/:id`
  that do **not** match the implemented API (e.g. `GET /categories`, `GET
  /public/catalog/:slug`, `GET /locations/divisions`). Treat the route table in
  this document as authoritative.
- ~~Empty scaffold docs in `QA/`~~ — the empty `BUG_REPORT.md` scaffold was
  deleted; `TEST_MATRIX.md` is now filled with real coverage status; the root
  scratch scripts moved to `QA/scratch/`.
- ~~**Eager `useGetProfileQuery()`** in chat components fires `/auth/me` for
  anonymous visitors~~ **Fixed (this pass, finding 25).**
- **Maintenance mode is not implemented.** The setting is gone from the admin UI
  because nothing enforced it; adding it means gating requests (edge/proxy or a
  global API guard with an admin bypass) plus a safe "stuck in maintenance"
  recovery path. Out of scope until that is designed.
- ~~**Rider accounts are not seeded.**~~ **Fixed (this pass, finding 26).**
  `seeder.service.ts` now creates two riders (`rider1@gramerbazar.com` /
  `rider2@gramerbazar.com`, `password123`, phones `+8801700000005/6`); the rider
  E2E uses the seeded account (registration remains a fallback for databases
  seeded by an older build).
- ~~**Seller account phone/address has no editor.**~~ **Fixed (this pass,
  finding 26).** The seller profile page now has an **Account Info** section
  (first/last name, contact phone) wired to the existing `PATCH /auth/me`,
  with a note that this is the number customers see on the storefront;
  validated by a new E2E round-trip test.
- **E2E scripts for wishlist/notifications/OTP were missing.** All three
  journeys are now scripted and passing (finding 27); the automated suite
  covers every documented customer feature and both login modes.

---

## 5. Implemented API map (authoritative)

All routes are under the global prefix `/api/v1`. Auth column: `-` public,
`JWT` any authenticated user, role names otherwise.

| Group | Routes |
|---|---|
| Auth | `POST /auth/send-otp`, `/auth/verify-otp`, `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` · `GET/PATCH /auth/me` · `PATCH /auth/me/password` · `POST /auth/me/avatar` · `DELETE /auth/me` |
| Addresses | `GET/POST /addresses`, `GET/PATCH/DELETE /addresses/:id` |
| Locations | `GET /locations/countries|divisions|districts|upazilas|unions|areas` |
| Categories | `GET /categories`, `GET /categories/:id` (+ admin create/update/delete) |
| Brands | `GET /brands`, `GET /brands/:id` (+ admin CRUD) |
| Products | `GET /products`, `GET /products/:id` (+ admin CRUD) |
| Public catalog | `GET /public/categories`, `/public/catalog/search`, `/public/catalog/featured`, `/public/catalog/brands`, `/public/catalog/:slug`, `/public/catalog/:slug/related`, `POST /public/cart/validate` |
| Cart/Checkout | Cart is client-side (Redux); `POST /orders/checkout` |
| Orders | `GET /orders`, `GET /orders/:id`, `POST /orders/:id/cancel` · admin: `GET /orders/admin/all`, `PATCH /orders/admin/:id/status` |
| Wishlists | `GET /wishlists`, `POST/DELETE /wishlists/:productId` |
| Reviews | `GET /reviews/product/:productId`, `POST /reviews`, `GET /reviews/user` · admin: `GET /reviews/admin`, `PATCH /reviews/admin/:id/moderate` |
| Notifications | `GET /notifications`, `/notifications/unread-count`, `PATCH /notifications/:id/read`, `/notifications/read-all` |
| Chat | `GET/POST /chat/conversations`, `GET /chat/conversations/:id/messages`, `PATCH /chat/conversations/:id/read`; socket events `join_conversation`, `leave_conversation`, `send_message`, server emits `new_message` |
| Seller portal | `GET /seller-portal/dashboard`, `GET/PATCH /seller-portal/shop` (`nameEn`, `nameBn`, `description`, `logo`, `banner`, `isActive`), `GET/POST /seller-portal/products`, `PATCH /seller-portal/products/:id`, `GET /seller-portal/orders`, `GET /seller-portal/orders/:id` |
| Inventory | `GET/POST /inventory`, `GET/PATCH/DELETE /inventory/:id`; `GET/POST /seller-products`, `PATCH/DELETE /seller-products/:id` |
| Deliveries | admin: `GET /deliveries/admin`, `POST /deliveries/admin/assign`, `GET /deliveries/admin/riders`; rider: `GET /deliveries/rider/assigned`, `GET /deliveries/rider/:id`, `PATCH /deliveries/rider/:id/status`, `PATCH /deliveries/rider/:id/location`; `GET /deliveries/customer/:orderId` |
| Product requests | `POST/GET /product-requests`, `GET /product-requests/:id`; admin: `GET /admin/product-requests`, `GET /admin/product-requests/:id`, `PATCH /admin/product-requests/:id/status` |
| Coupons | admin `POST/GET /admin/coupons`, `GET/PATCH/DELETE /admin/coupons/:id`; seller `POST/GET /seller/coupons`, `PATCH/DELETE /seller/coupons/:id`; `POST /coupons/validate`, `GET /coupons/shop/:shopId` |
| Flash sales | `GET /flash-sales/active`, CRUD `/flash-sales` |
| Banners | `GET /banners/public`; admin CRUD `/banners` |
| Wallets / payouts | `GET /wallets/my-wallet`, `/wallets/my-transactions`; `POST /payouts/request`, `GET /payouts/my-requests`, `GET /payouts`, `PATCH /payouts/:id/review` |
| Disputes | customer `POST/GET /disputes/customer`, `GET /disputes/customer/:id`, `POST /disputes/customer/:id/messages`; seller `/disputes/seller...`; admin `/disputes/admin...`, `PATCH /disputes/admin/:id/resolve` |
| Analytics | `GET /admin/analytics/dashboard`, `GET /admin/analytics/demand`, `POST /analytics/events/bulk` |
| Audit logs | `GET /admin/audit-logs` (paginated `{data, meta}`) |
| Settings (admin) | `GET /admin/settings`, `PATCH /admin/settings` |
| Payments | `POST /payments/success|fail|cancel|ipn` |
| Users (admin) | `GET /users`, `PATCH /users/:id/status`, `PATCH /users/:id/roles` |
| Shops | `GET /shops`, `GET /shops/:id` (+ admin CRUD) |
| Seeder | `POST /dev/seed` |
| Dev OTP peek | `GET /dev/otp/:phone` — dev-only (blocked in production); returns the latest active OTP so automated tests can complete the OTP journey without an SMS provider |

---

## 6. Phased plan

| Phase | Scope | Status |
|---|---|---|
| 0 | Audit, as-built map, feature inventory | ✅ this document |
| 1 | Foundation/blocking fixes: typecheck, workspace config, route conflict, JWT config, chat contract, guards, dead code, fake data | ✅ done |
| 2 | Customer journey end-to-end verification (auth → browse → product → cart → checkout → order) | ✅ E2E executed — 7/7 pass (cart persistence + hydration race fixed) |
| 3 | Seller journey (shop → products → inventory → orders → wallet) | ✅ E2E executed — 6/6 pass (shop settings contract fixed) |
| 4 | Rider journey (assigned → status → location) | ✅ E2E executed — 4/4 pass incl. full delivery lifecycle |
| 5 | Admin journey (incl. audit logs, settings) | ✅ E2E executed — 6/6 pass (settings made real) |
| 6 | Cross-system consistency (pagination, error shape, loading states) | ✅ envelope audit done; DataTable gained error/retry + i18n; error shape noted as accepted variance (see finding 23) |
| 7 | Test suite bootstrap + lint cleanup + full E2E | ✅ unit suites green (41/41 files, 101 tests), web lint 0 errors, E2E **32/32** on the live stack |

---

## 7. Verification performed

- `pnpm -C apps/web run typecheck` — clean.
- `pnpm -C apps/api run typecheck` — clean.
- `pnpm -C apps/web run build` — succeeds; route table confirmed.
- `pnpm -C apps/api test` — **41/41 files pass, 101 tests** (orders, auth,
  coupons, users, reviews, audit-logs, settings, roles and seeder specs).
- `pnpm -C apps/api run lint` (oxlint) — 0 errors, 30 warnings.
- `pnpm -r run typecheck` — all projects clean.
- `pnpm -C apps/web run lint` — **0 errors, 4 informational warnings** (React
  Compiler notes about TanStack Table / react-hook-form; not actionable).
- `pnpm -C apps/web run build` — succeeds after all refactors.
- **Playwright E2E (`apps/e2e`) — 32/32 pass (1 worker, ~2.5 min)** against the
  live stack (web :3000, API :4000, Postgres :5432):

| Spec | Tests | Covers |
|---|---|---|
| `customer-flow.spec.ts` | 7 | home, categories, search, product details, login, cart drawer, full purchase journey `login → product → add to cart → cart → checkout (COD)` |
| `seller-flow.spec.ts` | 7 | seller login→dashboard KPIs, sidebar sweep over all 11 seller pages, products/inventory vs API, shop settings save + API round-trip, wallet, **account contact-phone editor round-trip**, customer blocked from `/seller` |
| `rider-flow.spec.ts` | 4 | rider login→dashboard, sidebar sweep, **customer order → admin assignment → rider accept/pickup/out-for-delivery/delivered**, customer blocked from `/rider` |
| `admin-flow.spec.ts` | 6 | admin login→dashboard metrics, sidebar sweep over all 20 admin pages, settings persistence + seller-registration toggle, audit log feed, seller blocked from `/admin` |
| `chat-flow.spec.ts` | 4 | anonymous visitors trigger zero `/auth/me` calls, all post-login `/auth/me` carry `Authorization`, messages page renders chat live, client-side navigation reuses one socket connection |
| `wishlist-flow.spec.ts` | 1 | login → product details heart → wishlist page shows item → remove round-trip |
| `notifications-flow.spec.ts` | 1 | customer checkout → admin status change creates `ORDER_UPDATE` notification → visible on `/notifications` → mark all read |
| `otp-login-flow.spec.ts` | 2 | phone + OTP login via modal using dev OTP peek, wrong-code rejection |

Notes on running them: the dev server must be up (`pnpm dev`), and repeated
logins from one IP need the raised auth rate limits documented in
`apps/api/.env.example`, otherwise `POST /auth/login` returns `429`.

### E2E-driven product fixes

Executing the E2E suite surfaced six real journey bugs, all fixed:

1. **Cart was not persisted.** The cart lived only in Redux memory, so any full
   page load (refresh, direct URL, new tab) emptied it and checkout was
   unreachable. Added `localStorage` persistence in `cartSlice.ts`
   (`loadCartFromStorage` / `saveCartToStorage` / `hydrateCart`) wired through
   `store/provider.tsx` (hydrate on mount, save on change; SSR-safe).
2. **Hydration race on controlled inputs.** Playwright (and real users on slow
   devices) could submit forms before React attached controlled-input handlers,
   sending empty payloads — observed as silent 400s from `POST /auth/login`.
   The provider now sets `data-hydrated` on `<html>` after mount; tests wait
   for it. Login navigation now strictly asserts an authenticated URL
   (`/profile|/admin|/seller|/rider`) instead of any locale path.
3. **Seller shop settings returned 500 / 400 on save** (`name` / `phone` are not
   `Shop` columns) — DTO, service and both seller forms realigned on
   `nameEn` / `nameBn` / `description` (see finding 18).
4. **Dashboard header/sidebar activated the wrong nav item** on nested routes
   (see finding 19).
5. **Login throttling blocked automated journeys** — limits are now
   env-configurable with production-safe defaults (see finding 20).
6. **Admin Settings was a fake form** with no API behind it — replaced with a
   real `settings` module, persisted and enforced (see findings 21–22).
