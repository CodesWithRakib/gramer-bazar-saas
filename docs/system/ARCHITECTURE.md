# System Architecture Documentation

## Monorepo Layout

Gramer Bazar uses a `pnpm` workspace monorepo structure:

```text
gramer-bazar/
├── apps/
│   ├── api/             # NestJS 12 API backend service (Port 4000)
│   ├── web/             # Next.js 16 App Router frontend (Port 5000)
│   └── e2e/             # Playwright E2E testing workspace
├── packages/
│   ├── types/           # Shared TypeScript interfaces & DTOs
│   ├── eslint-config/   # Shared ESLint configuration
│   └── tsconfig/        # Shared TypeScript configuration
├── docs/                # System & QA documentation
└── package.json         # Workspace root package definition
```

---

## High-Level Architecture Diagram

```text
                                 +-------------------------+
                                 |   Web Browser / Client  |
                                 +------------+------------+
                                              |
                                              | HTTP / WebSocket
                                              v
                                 +------------+------------+
                                 |  Next.js Frontend (5000)|
                                 |  App Router + RTK Query |
                                 +------------+------------+
                                              |
                                              | REST API / Socket.IO
                                              v
                                 +------------+------------+
                                 |  NestJS Backend (4000)  |
                                 | Controllers/Services/Guards|
                                 +------+-----+-----+------+
                                        |     |     |
            +---------------------------+     |     +--------------------------+
            |                                 |                                |
            v                                 v                                v
+-----------+-----------+         +-----------+-----------+        +-----------+-----------+
| PostgreSQL Database   |         | Supabase Cloud Storage|        | SSLCOMMERZ Sandbox Gateway|
| TypeORM Entities/Migr |         | Product Images/Docs   |        | Payment Processing        |
+-----------------------+         +-----------------------+        +-----------------------+
```

---

## Core Technologies

### Frontend (`apps/web`)
- **Framework**: Next.js 16 (App Router) running on `http://localhost:5000`.
- **State Management**: Redux Toolkit & RTK Query for caching and API data fetching.
- **Styling**: TailwindCSS v4 with Vanilla CSS custom design system and Radix UI primitives (`@radix-ui/react-*`).
- **Realtime Connection**: `socket.io-client` v4 managing a singleton WebSocket connection.
- **Localization**: Localized route structure `/[lang]/...` with `en` and `bn` translations.

### Backend (`apps/api`)
- **Framework**: NestJS v12 running on `http://localhost:4000`.
- **ORM**: TypeORM v0.3 with PostgreSQL database.
- **Realtime Gateway**: `@nestjs/websockets` & `@nestjs/platform-socket.io` for event broadcasting.
- **Security & Auth**: Passport JWT strategies (`@nestjs/passport`), `bcryptjs`, and `cookie-parser`.
- **Validation**: `class-validator`, `class-transformer`, and `zod` for strict request DTO validation.
- **Documentation**: Swagger OpenAPI interactive documentation rendered at `http://localhost:4000/api/docs`.

### Database
- **Engine**: PostgreSQL 15+.
- **Entities**: Users, Roles, Permissions, Shops, Categories, SubCategories, Brands, Products, ProductVariants, SellerProducts, Inventories, Orders, OrderItems, OrderStatusHistories, Payments, Wallets, WalletTransactions, Payouts, Applications, Disputes, ProductRequests, Messages, Conversations, Notifications, Coupons, Reviews.
