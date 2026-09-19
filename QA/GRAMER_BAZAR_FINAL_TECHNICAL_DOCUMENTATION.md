# Gramer Bazar Final Technical Documentation

## Architecture Overview
Gramer Bazar is built using a modern, scalable monorepo approach managed by Turborepo and pnpm.

### 1. Frontend (Next.js 14+)
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS, Framer Motion for micro-interactions, Lucide React for iconography.
- **State Management:** Redux Toolkit (RTK) and RTK Query for API fetching and caching.
- **Localization:** Dynamic `[lang]` routing supporting English (`/en`) and Bangla (`/bn`).
- **Components:** Modular atomic design located in `apps/web/src/components`. Layouts are strictly separated by role (`CustomerLayout`, `AdminLayout`, etc.).

### 2. Backend (NestJS 12+)
- **Framework:** NestJS
- **Database:** PostgreSQL accessed via TypeORM.
- **Authentication:** JWT-based stateless authentication with strict Role-Based Access Control (RBAC) via Guards.
- **Modules:**
  - `auth`: JWT generation and validation.
  - `users` / `roles`: User entities and role assignments.
  - `orders`: Core checkout and state machine logic for customer purchases.
  - `deliveries`: Rider assignment and status tracking.
  - `inventory`: Seller product listings and stock tracking.
  - `catalog`: Global products, brands, and categories.

### 3. API & Data Flow
- Clients communicate with the backend via REST endpoints located at `/api/v1/*`.
- RTK Query automatically deduplicates requests and maintains cache invalidation tags for immediate UI updates (e.g., when an order status changes).

### 4. Security
- **RBAC:** Endpoints are decorated with `@Roles(Role.ADMIN)` etc. to prevent IDOR and privilege escalation.
- **Validation:** `class-validator` and `zod` are used heavily for request body validation.
