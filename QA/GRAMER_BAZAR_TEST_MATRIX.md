# Gramer Bazar Test Matrix

Coverage map of every documented journey, as executed by the automated suites
(`apps/e2e` Playwright specs + `apps/api` Vitest unit specs). Last verified:
2026-09-23.

Legend: ✅ covered and passing · 🟡 covered, minor gaps noted · ❌ not covered

## Customer

| Feature | Happy Path | Negative | Mobile | BN | EN | Permission | API | E2E |
| ---- | ------- | ---------- | -------- | ------ | -- | -- | ---------- | --- | --- |
| Auth (password login) | ✅ customer-flow | ✅ wrong password unit-tested (`auth.service.spec`) | ✅ responsive forms | ✅ | ✅ | ✅ route guards E2E | ✅ | ✅ |
| Auth (OTP) | ✅ unit-tested (`sendOtp`/`verifyOtp` paths) | ✅ blocked user, missing password | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 UI journey not scripted |
| Browse & search | ✅ customer-flow | ✅ empty results render | ✅ | ✅ | ✅ | — public | ✅ | ✅ |
| Product details | ✅ customer-flow | — | ✅ | ✅ | ✅ | — public | ✅ | ✅ |
| Cart management | ✅ customer-flow + cart drawer test | ✅ max-inventory cap | ✅ | ✅ | ✅ | — client-side | n/a (Redux + `POST /public/cart/validate`) | ✅ |
| Checkout (COD) | ✅ customer-flow full purchase | ✅ insufficient stock, wrong address owner (unit) | ✅ | ✅ | ✅ | ✅ JWT | ✅ (`POST /orders/checkout` unit + E2E) | ✅ |
| Order lifecycle | ✅ rider-flow cross-role test | ✅ cancel restores inventory (unit) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Wishlist | ✅ API wired | — | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 not scripted |
| Reviews | ✅ unit-tested (purchase gating, moderation) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 not scripted |
| Notifications | ✅ API wired | — | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ not scripted |
| Profile / account info | ✅ seller profile E2E covers `PATCH /auth/me` | ✅ phone format (unit) | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 |
| Product Request | ✅ API wired | — | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 not scripted |

## Seller

| Feature | Happy Path | Negative | Mobile | BN | EN | Permission | API | E2E |
| ---- | ------- | ---------- | -------- | ------ | -- | -- | ---------- | --- | --- |
| Dashboard KPIs | ✅ seller-flow | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Products / inventory | ✅ seller-flow (data matches API) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Shop settings save | ✅ seller-flow round-trip | ✅ DTO rejects unknown fields (unit of DTO via 500-fix) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Account contact (phone) | ✅ seller profile page form → `PATCH /auth/me` | ✅ zod phone regex | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 not scripted |
| Wallet / payouts | ✅ seller-flow | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Customer blocked from /seller | — | ✅ seller-flow | — | — | ✅ | ✅ | ✅ | ✅ |

## Rider

| Feature | Happy Path | Negative | Mobile | BN | EN | Permission | API | E2E |
| ---- | ------- | ---------- | -------- | ------ | -- | -- | ---------- | --- | --- |
| Seeded rider login | ✅ rider-flow (uses seeded `rider1@gramerbazar.com`) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delivery lifecycle (accept → pickup → out for delivery → delivered) | ✅ rider-flow cross-role: customer order → admin assignment → rider actions | ✅ COD marked paid on delivery | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Customer blocked from /rider | — | ✅ rider-flow | — | — | ✅ | ✅ | ✅ | ✅ |

## Admin

| Feature | Happy Path | Negative | Mobile | BN | EN | Permission | API | E2E |
| ---- | ------- | ---------- | -------- | ------ | -- | -- | ---------- | --- | --- |
| Dashboard metrics | ✅ admin-flow | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sidebar sweep (all 20 pages) | ✅ admin-flow | ✅ every page renders without error boundary | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Platform settings persistence | ✅ admin-flow round-trip | ✅ | ✅ | ✅ | ✅ | ✅ admin-only | ✅ unit-tested (`settings.service.spec`) | ✅ |
| Seller-registration toggle enforced | ✅ admin-flow + `auth.service.spec` | ✅ | — | — | ✅ | ✅ | ✅ | ✅ |
| Audit log feed | ✅ admin-flow | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Seller blocked from /admin | — | ✅ admin-flow | — | — | ✅ | ✅ | ✅ | ✅ |

## Chat / Realtime

| Feature | Happy Path | Negative | Mobile | BN | EN | Permission | API | E2E |
| ---- | ------- | ---------- | -------- | ------ | -- | -- | ---------- | --- | --- |
| Single socket provider | ✅ chat-flow (one connection across navigation) | — | ✅ | — | ✅ | — | ✅ | ✅ |
| No anonymous `/auth/me` | ✅ chat-flow (0 calls logged out) | ✅ all post-login calls carry `Authorization` | ✅ | — | ✅ | ✅ | ✅ | ✅ |

## Known coverage gaps (by design, documented in the audit doc)

- Notifications and wishlist E2E scripts (APIs unit/wired-verified only).
- OTP login UI journey (service paths unit-tested).
- Maintenance mode is intentionally out of scope (no enforcement exists).
