# Wallet & Financial Ledger Architecture

## Overview

The wallet module maintains double-entry transaction ledgers for customers, sellers, riders, and platform revenue.

---

## Entity Definitions

- **Wallet (`Wallet`)**:
  - `userId` / `shopId`: Owner relation.
  - `balance`: Current total balance (decimal).
  - `pendingBalance`: Locked or processing balance.
  - `currency`: Default `BDT` (৳).
- **Wallet Transaction (`WalletTransaction`)**:
  - `walletId`: Target wallet.
  - `amount`: Transaction value (positive for CREDIT, negative for DEBIT).
  - `type`: `CREDIT`, `DEBIT`, `COMMISSION`, `PAYOUT`, `REFUND`.
  - `status`: `PENDING`, `COMPLETED`, `FAILED`.
  - `referenceType` & `referenceId`: Linked Order or Payout ID.

---

## Payout Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Seller
    participant Portal as Seller Portal (5000)
    participant API as NestJS API (4000)
    participant Admin as Admin Portal

    Seller->>Portal: Request Payout (e.g. ৳5,000 to bKash)
    Portal->>API: POST /api/v1/payouts/request
    API->>API: Verify wallet.balance >= amount
    API->>API: Deduct balance & create Payout (PENDING)
    API-->>Portal: Payout Request Submitted
    Admin->>API: GET /api/v1/payouts/admin/pending
    Admin->>API: PATCH /api/v1/payouts/admin/[id]/approve
    API->>API: Set Payout status to APPROVED & record audit log
    API-->>Seller: Send Notification ("Payout approved")
```

---

## Integrity Rules

1. **Transaction Safety**: All wallet balance updates execute inside TypeORM database transactions with row-level locks (`SELECT ... FOR UPDATE`).
2. **Negative Balance Guard**: Debits are rejected if `wallet.balance < requested_amount`.
3. **Auditability**: Every balance change requires an immutable `WalletTransaction` audit entry.
