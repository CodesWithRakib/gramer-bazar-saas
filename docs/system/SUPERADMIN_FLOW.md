# Super Admin Governance & System Administration

## Overview

The Super Admin portal (`/[lang]/super-admin`) provides governance and security capabilities restricted to system owners.

## Administrative Capabilities

1. **Role & Permission Management (`/[lang]/super-admin/users-management`)**:
   - Defines system roles (`SUPER_ADMIN`, `ADMIN`, `SELLER`, `RIDER`, `CUSTOMER`).
   - Assigns granular permissions (e.g. `users:manage`, `finance:approve`, `catalog:write`).

2. **System Settings & Gateway Credentials (`/[lang]/super-admin/settings`)**:
   - Configures default seller commission rate percentage.
   - Updates SSLCOMMERZ store ID, password, live/sandbox mode, and public callback URLs.

3. **Audit Logging & Security Audit (`/[lang]/super-admin`)**:
   - Reviews system-wide immutable action audit logs.
   - Monitors sensitive administrative operations.
