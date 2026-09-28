# Automated Regression Test Suite

## Overview

This regression suite protects critical business fixes against future regressions.

---

## Test Categories & Specs

### 1. Development Environment & Port Standards
- **File**: `docs/system/LOCAL_DEVELOPMENT.md`
- **Invariants**:
  - Frontend MUST run on `http://localhost:5000`.
  - Backend MUST run on `http://localhost:4000`.
  - Playwright base URL MUST point to `http://localhost:5000`.

### 2. Public Marketplace & Search
- **File**: `apps/e2e/tests/public-marketplace.spec.ts`
- **Coverage**:
  - Homepage discovery components load without auth calls.
  - Category list loads from backend API.
  - Keyword search filters products gracefully.
  - Guest direct navigation to protected routes is blocked by AuthGuard.

### 3. Authentication & Authorization Lifecycle
- **Files**: `apps/e2e/tests/auth/` and `apps/e2e/tests/otp-login-flow.spec.ts`
- **Coverage**:
  - Password login with email or phone.
  - Mobile OTP dispatch and verification.
  - Customer role redirects to `/[lang]/customer`.
  - Protected API endpoints reject unauthenticated requests with `401 Unauthorized`.
  - Non-authorized role access returns `Access Denied (403)` screen.

### 4. Customer Checkout & Commerce
- **File**: `apps/e2e/tests/customer-flow.spec.ts` and `orders-payments-wallet.spec.ts`
- **Coverage**:
  - Full purchase journey: Product selection -> Cart -> Address -> COD Checkout.
  - Order creation deducts stock in database transaction.
  - Payment initiation generates valid SSLCOMMERZ-compliant transaction IDs.

### 5. Seller Portal Operations
- **File**: `apps/e2e/tests/seller-flow.spec.ts`
- **Coverage**:
  - Seller dashboard KPIs render active shop metrics.
  - Inventory management updates stock & pricing.
  - Order fulfillment advances status timeline.
  - Seller wallet displays earnings & pending payouts.

### 6. Rider Logistics & Delivery
- **File**: `apps/e2e/tests/rider-flow.spec.ts`
- **Coverage**:
  - Rider delivery dashboard renders assigned orders.
  - Delivery status progression (`ACCEPTED` -> `PICKED_UP` -> `OUT_FOR_DELIVERY` -> `DELIVERED`).
  - Order and payment status updated upon delivery completion.

### 7. Admin & Super Admin Governance
- **File**: `apps/e2e/tests/admin-flow.spec.ts`
- **Coverage**:
  - Platform overview telemetry.
  - Navigation across primary admin hub routes (`Users & Partners`, `Products`, `Finance`, `Promotions`, `Settings`).
  - Application review & rider order assignment.

### 8. Realtime Chat & Notifications
- **Files**: `apps/e2e/tests/chat-flow.spec.ts` and `notifications-flow.spec.ts`
- **Coverage**:
  - Singleton Socket.IO connection maintained across client navigation.
  - Realtime order status event broadcasts.
  - Live chat message receipt.

### 9. Broken Link Crawler
- **File**: `apps/e2e/tests/link-crawler.spec.ts`
- **Coverage**:
  - Automated crawl of all primary navigation paths.
  - Asserts status < 400 and zero error boundary screens.

---

## Execution Command

```bash
pnpm test:e2e:web
```
