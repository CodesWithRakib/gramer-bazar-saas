# AI System Context & Architectural Invariants

## Project Overview

**Gramer Bazar** is a multi-role, multi-tenant rural hyper-marketplace SaaS connecting customers, local sellers, and delivery riders in Bangladesh.

- **Frontend URL**: `http://localhost:5000` (Next.js 16 App Router)
- **Backend API URL**: `http://localhost:4000/api/v1` (NestJS 12 API)
- **Swagger Docs**: `http://localhost:4000/api/docs`
- **Realtime Server**: `http://localhost:4000` (Socket.IO)

---

## Technical Stack & Workspace Structure

```text
gramer-bazar/
├── apps/
│   ├── api/             # NestJS 12 REST API + WebSockets + TypeORM
│   ├── web/             # Next.js 16 App Router + Redux Toolkit + RTK Query
│   └── e2e/             # Playwright End-to-End test suite
├── packages/
│   ├── types/           # Shared TypeScript interfaces & DTO definitions
│   ├── eslint-config/   # Shared linting standards
│   └── tsconfig/        # Standardized TS configurations
├── docs/                # Comprehensive system and QA documentation
│   ├── system/          # Architecture, flow & component docs
│   └── qa/              # Test matrices, feature inventories & bug tracker
```

---

## User Roles & Key Rules

1. **Guest**: Can only browse public marketplace catalog (`/`, `/categories`, `/search`, `/products/[slug]`, `/shops/[id]`). Cannot place orders or access user APIs.
2. **Customer**: Can manage addresses, cart, wishlist, place COD/SSLCOMMERZ orders, track delivery timeline, view wallet, submit product requests/disputes, and message sellers/riders.
3. **Seller**: Owns a single `Shop`. Manages product inventory, variant stock, orders (`CONFIRMED` -> `PROCESSING` -> `READY_FOR_PICKUP`), earnings wallet, and requests payouts.
4. **Rider**: Accepts assigned deliveries (`ACCEPTED` -> `PICKED_UP` -> `OUT_FOR_DELIVERY` -> `DELIVERED`). Tracks delivery income.
5. **Admin**: Approves seller and rider onboarding applications, manages catalog categories/brands, assigns orders to riders, and approves seller payout requests.
6. **Super Admin**: Manages system roles, permissions, system configuration settings, and views audit logs.

---

## CRITICAL INVARIANTS - DO NOT BREAK THESE RULES

1. **Development Ports**:
   - Next.js frontend MUST run on port `5000` (`next dev -p 5000`).
   - NestJS backend MUST run on port `4000`.
   - Playwright `baseURL` MUST be `http://localhost:5000`.

2. **Authorization & Security**:
   - Backend APIs are the final authority for authorization. NEVER rely solely on frontend client redirects.
   - All protected routes MUST use NestJS `JwtAuthGuard` and `RolesGuard`.
   - Data ownership checks (e.g. `order.customerId === user.id`) MUST be enforced on the backend.

3. **Financial Safety**:
   - Payment amounts MUST be calculated server-side based on database product prices. NEVER trust client-submitted prices or subtotal amounts.
   - Wallet transactions (credits/debits) MUST run inside TypeORM database transactions to prevent race conditions or negative balances.

4. **Realtime Architecture**:
   - Socket.IO is purely a transport layer for live notifications and messaging events. The PostgreSQL database remains the absolute source of truth.
   - Client applications MUST use a singleton socket connection and re-synchronize state from REST APIs upon socket reconnection.

5. **UI & UX Quality Standards**:
   - NO background gradients or rainbow dashboards. Use clean, solid neutral colors with high contrast typography.
   - Dashboard sidebars MUST NOT contain logout buttons. Logout belongs in the dashboard header avatar menu.
   - Sidebars MUST remain flat without multi-level dropdown submenus.
   - Homepage is a discovery engine (`Discover -> Search -> Product Details -> Cart -> Checkout`). It MUST NOT render massive catalog datasets or act as a primary filter page.

6. **Internationalization**:
   - All user-facing strings MUST support both English (`en`) and Bangla (`bn`) translations. Avoid hardcoded strings in components.

7. **TypeScript & Code Hygiene**:
   - Use strict TypeScript typing (`noImplicitAny`). Avoid using `any` unless strictly necessary.

---

## Local QA Test Accounts

- **Super Admin**: `superadmin@gramerbazar.com` / `password123`
- **Admin**: `admin@gramerbazar.com` / `password123`
- **Seller**: `seller1@gramerbazar.com` / `password123`
- **Rider**: `rider1@gramerbazar.com` / `password123`
- **Customer**: `customer@gramerbazar.com` / `password123`

---

## Testing & Quality Assurance

- **Playwright E2E Suite**: Located in `apps/e2e/tests/`. Run with `pnpm test:e2e:web`.
- **Type Checking**: Run `pnpm run typecheck` across all workspace packages before committing code.
