# Gramer Bazar — Playwright E2E Developer & QA Guide

This guide establishes the permanent conventions and patterns for creating and maintaining Playwright end-to-end tests in Gramer Bazar.

---

## 1. Directory Structure

```
apps/e2e/
├── playwright.config.ts                       # Configuration file (baseURL, timeouts, workers)
└── tests/
    ├── admin-flow.spec.ts                     # Admin dashboard, audit logs, settings, registration toggle
    ├── chat-flow.spec.ts                      # WebSocket singleton, real-time message exchange
    ├── customer-flow.spec.ts                  # Customer storefront journeys, cart, orders
    ├── i18n-responsive-accessibility.spec.ts  # Language switcher, mobile/desktop viewports, ARIA landmarks
    ├── link-crawler.spec.ts                   # Broken link crawler across public routes
    ├── notifications-flow.spec.ts             # Notification triggering, delivery, and read state
    ├── orders-payments-wallet.spec.ts         # Payment methods, transactions, digital wallet ledger
    ├── otp-login-flow.spec.ts                 # Phone OTP registration & verification
    ├── public-marketplace.spec.ts             # Public catalog, filters, flash sales, search
    ├── rider-flow.spec.ts                     # Rider logistics, shift tracking, waypoint status flow
    ├── seller-flow.spec.ts                    # Merchant dashboard, products CRUD, inventory bulk edit
    └── wishlist-flow.spec.ts                  # Wishlist persistence and cart transfer
```

---

## 2. Writing Reliable Playwright Tests

### 2.1 Always Handle Hydration
Because the frontend utilizes Next.js with client-side state hydration, attempting to click interactive components (such as Radix UI dropdowns or cart buttons) prior to React hydration may cause clicks to be dropped:
```typescript
const waitForHydration = async (page: Page) => {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    undefined,
    { timeout: 20000 },
  );
};
```

### 2.2 Modal & Confirmation Dialogs
When interacting with actions that display an alert or confirmation modal (e.g. marking a delivery as delivered or archiving a product), always handle the secondary confirmation click:
```typescript
// Primary action triggers dialog
await page.getByRole('button', { name: 'Mark as Delivered' }).click();

// Dialog confirmation
await page.getByRole('button', { name: /Yes, mark delivered/i }).click();
```

### 2.3 Radix UI Dropdown Menus
Radix UI dropdown items are rendered in a portal at `document.body` with temporary pointer traps. In headless testing, dispatching a click event or using `{ force: true }` avoids synthetic mouse event race conditions:
```typescript
await page.getByRole('button', { name: /Select language/i }).click();
await page.waitForTimeout(400);
await page.getByRole('menuitem', { name: /বাংলা/i }).dispatchEvent('click');
```

### 2.4 Desktop vs Mobile Sidebar Navigation
When targeting sidebar navigation links on dashboard pages, always scope the locator to `<aside>` to prevent matching duplicate links present in the hidden mobile navigation drawer:
```typescript
await page
  .locator('aside')
  .getByRole('link', { name: 'Products', exact: true })
  .first()
  .click();
```

### 2.5 Accessing API Data Envelopes
All standard NestJS endpoints in Gramer Bazar wrap their return payloads in a standardized response envelope:
```typescript
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp?: string;
  path?: string;
}
```
In test helpers, always support accessing data from both wrapped and direct responses:
```typescript
const json = await response.json();
const result = json.data ?? json;
```
