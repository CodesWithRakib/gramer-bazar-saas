# Gramer Bazar Monorepo

Welcome to the Gramer Bazar project! This is a monorepo containing the Next.js frontend, NestJS backend, and shared packages.

## Prerequisites
- Node.js (v20+)
- pnpm (v12.4.2 or later)
- PostgreSQL (running locally)

## Local Setup Instructions

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env` in the root directory.
   - Copy `apps/api/.env.example` to `apps/api/.env`.
   - Update `DATABASE_URL` in your `.env` files to match your local PostgreSQL credentials.

3. **Database Setup**
   Ensure PostgreSQL is running and create a database named `gramer_bazar`:
   ```bash
   psql -U postgres -c "CREATE DATABASE gramer_bazar;"
   ```

4. **Run Development Servers**
   To start both frontend and backend in development mode:
   ```bash
   pnpm dev
   ```

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api/v1
   - Backend Swagger: http://localhost:4000/api/docs

## Available Commands

- `pnpm dev`: Runs both apps in development mode.
- `pnpm build`: Builds all apps and packages for production.
- `pnpm lint`: Runs ESLint on all apps and packages.
- `pnpm typecheck`: Runs TypeScript type checking across all workspaces.
