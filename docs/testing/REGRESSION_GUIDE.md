# Gramer Bazar — QA Regression Testing & Maintenance Guide

This document establishes the permanent protocols for adding new regression tests, diagnosing test failures, and preventing system regressions.

---

## 1. When to Add a Regression Test

A new automated test MUST be added whenever:
1. **A New Backend Module or Controller** is implemented in `apps/api`.
2. **A New App Router Route** is created in `apps/web/app`.
3. **A Defect or Bug is Reported and Fixed**: An exact reproducing test case must be committed that fails without the fix and passes with it.
4. **State Machine Rules or Role Guards are Modified**: Every allowed and disallowed transition must have corresponding test coverage.

---

## 2. Regression Protocol for Bug Fixes

Follow the 4-step regression containment protocol:
```
1. Reproduce      → Write a failing test in apps/e2e/tests/ or apps/api/src/**/*.spec.ts
2. Fix Root Cause → Modify backend service, controller, or UI component
3. Verify Local   → Run Vitest and Playwright to verify green status
4. Commit         → Permanent inclusion in git repository (NEVER skip or delete tests)
```

---

## 3. Key Regression Checkpoints Verified in this Release

### Checkpoint A: Dev Rate Limiting & Throttler Evaluation
- **Issue**: In development mode, high-frequency test requests could trigger HTTP 429 Too Many Requests. Static controller annotations evaluate `process.env` at module import time before NestJS ConfigModule initializes.
- **Resolution**: Ensured `import 'dotenv/config'` is at line 1 of `apps/api/src/main.ts` and dev bypass returns high capacity (`100 req/s`) in non-production environments.
- **Verification**: `otp-login-flow.spec.ts` and multi-step checkouts pass without any 429 errors.

### Checkpoint B: TypeORM Outer-Join Locking on PostgreSQL
- **Issue**: PostgreSQL throws `QueryFailedError: FOR UPDATE cannot be applied to the nullable side of an outer join` when `lock: { mode: 'pessimistic_write' }` is used together with `relations: ['items', ...]`.
- **Resolution**: Always lock the root entity (`Order` or `SellerProduct`) first, then load related items in a separate non-locking query.
- **Verification**: Verified in `orders.service.ts` during order transitions (`PENDING` -> `CONFIRMED` -> `DELIVERED`).

### Checkpoint C: Request Context Cookie Bleed Across Roles
- **Issue**: Playwright's `APIRequestContext` persists cookies across requests. Logging in as Admin overwrites cookies for Customer if both share the same context.
- **Resolution**: Always instantiate separate `customerCtx` and `adminCtx` contexts.
- **Verification**: Verified in `rider-flow.spec.ts` and `notifications-flow.spec.ts`.

### Checkpoint D: Radix UI Dropdown Menu Selection
- **Issue**: Radix UI `@radix-ui/react-dropdown-menu` unmounts menu items on pointer up, potentially swallowing synthetic `onClick` events in headless browsers.
- **Resolution**: Use `onSelect` prop on `DropdownMenuItem` alongside `onClick`, and trigger selection with `.dispatchEvent('click')` in Playwright.
- **Verification**: Verified in `i18n-responsive-accessibility.spec.ts` for English ⇄ Bangla language switching.
