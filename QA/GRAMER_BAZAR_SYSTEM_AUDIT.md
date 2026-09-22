# Gramer Bazar — System Audit & Completion Status

> As-built source of truth. This document describes what the code **actually does**,
> not what the original design documents aspire to. Where the two disagree, the
> discrepancy is called out explicitly.

Last updated: 2026-09-22

---

## 1. Repository shape

| Area | Path | Stack |
|---|---|---|
| Web app | `apps/web` | Next.js 16 (App Router, `[lang]` locale segment), React 19, Redux Toolkit + RTK Query, Tailwind v4, shadcn/ui, Socket.IO client, Serwist PWA, Sentry |
| API | `apps/api` | NestJS 12, TypeORM (Postgres), Passport JWT, Socket.IO gateway, Swagger, class-validator, SSLCommerz, Resend |
| Shared | `packages/types`, `packages/tsconfig`, `packages/eslint-config` | workspace packages |
| E2E | `apps/e2e` | Playwright (single `customer-flow.spec.ts`) |
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
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat (customer/seller/rider/admin) | ✅ | ✅ | ✅ | ✅ | 🟡 (two socket mechanisms) |
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
| Rider earnings | 📄 | — | 🔴 | — | Out of scope (no fee model) |
| Product moderation workflow | ✅ | 🟡 | ✅ | ✅ | Admin product management exists |

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
    **`pnpm -C apps/api test` → 32/32 files pass.** `oxlint` is down to
    0 errors / 30 warnings.

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

### Not yet addressed (remaining work)

- **Web lint warnings (86)** — unused imports, `<img>` usage. Non-blocking.
- **Two parallel socket clients** (`providers/SocketProvider.tsx` context and
  `hooks/useChatSocket.ts` singleton) — works, but should be consolidated.
- **Auth token stored in `localStorage`** (not httpOnly cookie) — XSS exposure.
  Documented as security debt; changing it touches the whole auth flow.
- **Design documents are aspirational.** The Backend design doc lists routes such
  as `/api/v1/admin/categories`, `/api/v1/products/:slug`, `/api/v1/locations/:id`
  that do **not** match the implemented API (e.g. `GET /categories`, `GET
  /public/catalog/:slug`, `GET /locations/divisions`). Treat the route table in
  this document as authoritative.
- Empty scaffold docs in `QA/` (`BUG_REPORT`, `MASTER_QA_PLAN`, etc.).
- Root scratch files `test_full_flow.cjs`, `scratch_test_checkout.js` — move to
  `QA/` or delete.

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
| Seller portal | `GET /seller-portal/dashboard`, `GET/PATCH /seller-portal/shop`, `GET/POST /seller-portal/products`, `PATCH /seller-portal/products/:id`, `GET /seller-portal/orders`, `GET /seller-portal/orders/:id` |
| Inventory | `GET/POST /inventory`, `GET/PATCH/DELETE /inventory/:id`; `GET/POST /seller-products`, `PATCH/DELETE /seller-products/:id` |
| Deliveries | admin: `GET /deliveries/admin`, `POST /deliveries/admin/assign`, `GET /deliveries/admin/riders`; rider: `GET /deliveries/rider/assigned`, `GET /deliveries/rider/:id`, `PATCH /deliveries/rider/:id/status`, `PATCH /deliveries/rider/:id/location`; `GET /deliveries/customer/:orderId` |
| Product requests | `POST/GET /product-requests`, `GET /product-requests/:id`; admin: `GET /admin/product-requests`, `GET /admin/product-requests/:id`, `PATCH /admin/product-requests/:id/status` |
| Coupons | admin `POST/GET /admin/coupons`, `GET/PATCH/DELETE /admin/coupons/:id`; seller `POST/GET /seller/coupons`, `PATCH/DELETE /seller/coupons/:id`; `POST /coupons/validate`, `GET /coupons/shop/:shopId` |
| Flash sales | `GET /flash-sales/active`, CRUD `/flash-sales` |
| Banners | `GET /banners/public`; admin CRUD `/banners` |
| Wallets / payouts | `GET /wallets/my-wallet`, `/wallets/my-transactions`; `POST /payouts/request`, `GET /payouts/my-requests`, `GET /payouts`, `PATCH /payouts/:id/review` |
| Disputes | customer `POST/GET /disputes/customer`, `GET /disputes/customer/:id`, `POST /disputes/customer/:id/messages`; seller `/disputes/seller...`; admin `/disputes/admin...`, `PATCH /disputes/admin/:id/resolve` |
| Analytics | `GET /admin/analytics/dashboard`, `GET /admin/analytics/demand`, `POST /analytics/events/bulk` |
| Audit logs | `GET /admin/audit-logs` |
| Payments | `POST /payments/success|fail|cancel|ipn` |
| Users (admin) | `GET /users`, `PATCH /users/:id/status`, `PATCH /users/:id/roles` |
| Shops | `GET /shops`, `GET /shops/:id` (+ admin CRUD) |
| Seeder | `POST /dev/seed` |

---

## 6. Phased plan

| Phase | Scope | Status |
|---|---|---|
| 0 | Audit, as-built map, feature inventory | ✅ this document |
| 1 | Foundation/blocking fixes: typecheck, workspace config, route conflict, JWT config, chat contract, guards, dead code, fake data | ✅ done |
| 2 | Customer journey end-to-end verification (auth → browse → product → cart → checkout → order) | 🟡 core flows wired; needs E2E execution |
| 3 | Seller journey (shop → products → inventory → orders → wallet) | 🟡 |
| 4 | Rider journey (assigned → status → location) | 🟡 (earnings out of scope) |
| 5 | Admin journey (incl. audit logs) | 🟡 audit logs now real |
| 6 | Cross-system consistency (pagination, error shape, loading states) | ⬜ |
| 7 | Test suite bootstrap + lint cleanup + full E2E | 🟡 suites + lint green; E2E run pending (needs live stack) |

---

## 7. Verification performed

- `pnpm -C apps/web run typecheck` — clean.
- `pnpm -C apps/api run typecheck` — clean.
- `pnpm -C apps/web run build` — succeeds; route table confirmed.
- `pnpm -C apps/web run lint` on changed files — clean; repo-wide lint debt recorded above.
- `pnpm -C apps/api test` — **32/32 files pass**.
- `pnpm -C apps/api run lint` (oxlint) — 0 errors, 30 warnings.
- `pnpm -C apps/api run typecheck` — clean (specs included).
- `pnpm -C apps/web run lint` — **exits 0** (0 errors, 86 warnings).
- `pnpm -C apps/web run build` — succeeds after all refactors.
- `pnpm -r run typecheck` — all projects clean.
