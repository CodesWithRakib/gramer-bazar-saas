# Gramer Bazar — Comprehensive Testing Strategy

Version: 1.0.0-GA
Scope: Permanent, Autonomous QA Automation System

---

## 1. Testing Pyramid Architecture

```
                    ▲
                   / \
                  /   \     E2E Playwright Suite (42 tests)
                 / E2E \    Multi-role Journeys, Real Browsers, Sockets, i18n
                /-------\
               /         \   Vitest Integration Tests
              / Integrate. \  Controllers, Services, DB Transactions, Guards
             /-------------\
            /               \ Vitest Unit Tests (258 tests)
           /    Unit Tests   \ Domain Entities, Utilities, DTOs, State Machine
          /-------------------\
```

---

## 2. Test Execution Protocols

### 2.1 Backend Unit & Integration Tests (Vitest)

- **Directory**: `apps/api`
- **Execution Command**: `pnpm -C apps/api test`
- **Scope**: 60 test suites, 258 automated tests.
- **Constraints**: Runs against in-memory or localized test database transactions. All assertions strictly validate return payload envelopes `{ success: true, statusCode: 200, data: ... }`.

### 2.2 End-to-End Automated Workflows (Playwright)

- **Directory**: `apps/e2e`
- **Execution Command**: `pnpm -C apps/e2e exec playwright test`
- **Configuration**: `apps/e2e/playwright.config.ts`
- **Concurrency**: 1 worker in local dev environment to prevent CPU/database contention on background services.

### 2.3 Individual Test Suite Commands

```bash
# Public marketplace & catalog search
pnpm -C apps/e2e exec playwright test tests/public-marketplace.spec.ts

# Phone OTP & passwordless login
pnpm -C apps/e2e exec playwright test tests/otp-login-flow.spec.ts

# Customer checkout, addresses, cart
pnpm -C apps/e2e exec playwright test tests/customer-flow.spec.ts

# Seller portal, product creator, inventory, shop settings
pnpm -C apps/e2e exec playwright test tests/seller-flow.spec.ts

# Rider logistics, assignments, delivery state progression
pnpm -C apps/e2e exec playwright test tests/rider-flow.spec.ts

# Platform administration & operational audit
pnpm -C apps/e2e exec playwright test tests/admin-flow.spec.ts

# Payments, transactions, and digital wallet
pnpm -C apps/e2e exec playwright test tests/orders-payments-wallet.spec.ts

# Chat & Socket.io singleton consistency
pnpm -C apps/e2e exec playwright test tests/chat-flow.spec.ts

# Multichannel notifications journey
pnpm -C apps/e2e exec playwright test tests/notifications-flow.spec.ts

# Wishlist persistence & cart transfers
pnpm -C apps/e2e exec playwright test tests/wishlist-flow.spec.ts

# Internationalization & responsive accessibility
pnpm -C apps/e2e exec playwright test tests/i18n-responsive-accessibility.spec.ts

# Public route crawler
pnpm -C apps/e2e exec playwright test tests/link-crawler.spec.ts
```

---

## 3. Playwright Best Practices in Gramer Bazar

### 3.1 Hydration Synchronization

Next.js App Router renders initial HTML on the server before client-side React takes over. To prevent synthetic event drops on client-hydrated elements (such as Radix dropdowns and Redux state listeners), always wait for hydration:

```typescript
export const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};
```

### 3.2 Client-Side URL Verification

Next.js client-side navigations using `next/navigation` do not emit browser window `load` events. Never use `page.waitForURL` on client-side pushes. Always use:

```typescript
await expect(page).toHaveURL(/\/en\/seller\/products/, { timeout: 25000 });
```

### 3.3 Request Context Isolation (No Cross-Role Cookie Bleed)

NestJS authentication extracts JWT tokens from either `req.cookies['access_token']` or `Authorization: Bearer <token>`. Because cookies take precedence, making API requests for multiple roles using the same `playwrightRequest` context causes role contamination. Always instantiate separate contexts:

```typescript
const customerCtx = await playwrightRequest.newContext();
const adminCtx = await playwrightRequest.newContext();
```

### 3.4 Responsive Testing Dimensions

Automated tests validate across key mobile, tablet, and desktop breakpoints:

- `375 x 812` (Mobile - iPhone X/11/12 mini)
- `390 x 844` (Mobile - iPhone 12/13/14)
- `768 x 1024` (Tablet - iPad Portrait)
- `1280 x 800` (Laptop Display)
- `1440 x 900` (Standard Desktop Display)

---

## 4. Continuous Integration Pipeline (GitHub Actions)

In CI (`.github/workflows/ci.yml`), automated testing runs in three parallel matrix jobs:

1. `backend-tests`: Runs `pnpm -C apps/api test` with coverage.
2. `web-build-check`: Runs `pnpm -C apps/web build` to verify type safety and bundle generation.
3. `e2e-automation`: Boots PostgreSQL, seeds the test database, runs API in daemon mode, boots Next.js, and executes the complete 42-test Playwright suite.
