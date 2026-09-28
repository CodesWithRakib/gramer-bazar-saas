# Local Development Guide

## Overview

Gramer Bazar local development setup runs Next.js frontend on port `5000` and NestJS backend on port `4000`.

## System Architecture

```text
Browser
   |
   v
Frontend (Next.js)
http://localhost:5000
   |
   | HTTP / REST / Socket.IO
   v
Backend (NestJS)
http://localhost:4000
   |
   +---- PostgreSQL
   +---- Supabase Storage
   +---- Redis (Optional / Upstash)
   +---- SSLCommerz Sandbox
```

## Canonical URLs & Endpoints

| Component | URL |
| --------- | --- |
| Frontend | `http://localhost:5000` |
| Backend Base | `http://localhost:4000` |
| API Base | `http://localhost:4000/api/v1` |
| Swagger API Docs | `http://localhost:4000/api/docs` |
| Health Check | `http://localhost:4000/health` |
| Socket.IO Server | `http://localhost:4000` |

## Environment Variables

### Backend (`apps/api/.env`)

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5000
BACKEND_URL=http://localhost:4000
API_URL=http://localhost:4000
CORS_ORIGINS=http://localhost:5000,http://localhost:5001,http://127.0.0.1:5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/gramer_bazar
JWT_SECRET=change-this
UPLOAD_DIR=uploads
```

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## Running the Application

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Database & Seeding

```bash
pnpm migration:run
pnpm seed
```

### 3. Start Local Development

Start all services in parallel:

```bash
pnpm dev
```

Or run frontend and backend separately:

```bash
# Terminal 1 - Backend (Port 4000)
pnpm --filter api run dev

# Terminal 2 - Frontend (Port 5000)
pnpm --filter web run dev
```

## Running End-to-End Tests (Playwright)

```bash
# Run all Playwright tests
pnpm test:e2e:web

# Run a single spec
pnpm -C apps/e2e exec playwright test tests/auth/login.spec.ts

# Run Playwright UI mode
pnpm -C apps/e2e exec playwright test --ui
```

## Standard QA Test Accounts

| Role | Email | Password |
| ---- | ----- | -------- |
| Super Admin | `superadmin@gramerbazar.com` | `password123` |
| Admin | `admin@gramerbazar.com` | `password123` |
| Seller | `seller1@gramerbazar.com` | `password123` |
| Rider | `rider1@gramerbazar.com` | `password123` |
| Customer | `customer@gramerbazar.com` | `password123` |

## Troubleshooting

- **Port Conflict on 5000**: Ensure no other process is using port 5000 (`npx kill-port 5000`).
- **CORS Issues**: Verify `CORS_ORIGINS` in `apps/api/.env` includes `http://localhost:5000`.
- **Database Connection Error**: Ensure PostgreSQL is running on `localhost:5432` with database `gramer_bazar`.
