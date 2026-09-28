# Authentication & Authorization Architecture

## Overview

Gramer Bazar implements a JWT-based stateless authentication flow with refresh tokens and role-based access control (RBAC).

---

## Authentication Flow

```text
User                      Frontend                         Backend
 |                           |                                |
 |-- Enter Credentials ----->|-- POST /auth/login ----------->|
 |                           |                                |-- Validate password (bcrypt)
 |                           |                                |-- Generate Access & Refresh Tokens
 |                           |<-- { accessToken, user } ------|
 |                           |                                |
 |-- Authenticated State --->|-- Attach Bearer Token -------->|-- Passport JwtStrategy validates token
 |                           |                                |-- RolesGuard verifies permissions
```

### 1. User Registration (`POST /api/v1/auth/register`)
- Accepts `email`, `phone`, `password`, `firstName`, `lastName`, and optionally `role` (`CUSTOMER`, `SELLER`, `RIDER`).
- Hashes password using `bcryptjs` (salt rounds: 10).
- Assigns requested role and creates associated database record.

### 2. User Login (`POST /api/v1/auth/login`)
- Accepts `emailOrPhone` and `password`.
- Resolves user by email or phone number.
- Verifies password against stored `passwordHash`.
- Generates:
  - **Access Token**: Short-lived JWT (Expires: `1h`), signed with `JWT_ACCESS_SECRET`.
  - **Refresh Token**: Long-lived JWT (Expires: `7d`), stored as a hashed token in database `refreshTokenHash`.

### 3. Session Refresh (`POST /api/v1/auth/refresh`)
- Accepts valid refresh token, matches hash against database, and issues a new access token.

### 4. Logout (`POST /api/v1/auth/logout`)
- Invalidates refresh token in database (`refreshTokenHash = null`).
- Frontend clears Redux auth state and local storage tokens.

---

## Role-Based Access Control (RBAC)

Backend controllers use custom decorators and guards:
- `@UseGuards(JwtAuthGuard, RolesGuard)`
- `@Roles(Role.ADMIN, Role.SUPER_ADMIN)`

If access token is missing or expired, `JwtAuthGuard` throws `401 Unauthorized`.
If user role is not allowed, `RolesGuard` throws `403 Forbidden`.
