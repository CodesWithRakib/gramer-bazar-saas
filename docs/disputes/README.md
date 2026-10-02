# Dispute & Review Resolution System

The **Disputes & Resolution System** is an end-to-end, multi-actor dispute management workflow in Gramer Bazar designed to protect buyers and sellers, ensure fair resolution, and automate financial ledger adjustments (refunds and wallet credits/debits).

---

## 1. Core Capabilities

- **Customer Dispute Initiation**: Customers can raise a dispute against delivered orders within 7 days of delivery with reason categorisation, narrative description, and photographic evidence.
- **Two-Way Evidence & Messaging**: Real-time conversation thread between Customer and Seller, with Super Admin oversight.
- **Internal Admin Notes**: Private support agent and Super Admin notes hidden from customers and sellers.
- **Automated Financial Resolution Engine**:
  - Full / Partial Refund debiting the seller's wallet and immediately crediting the customer's wallet ledger.
  - Replacement authorization.
  - Rejection with formal admin justification.
- **Real-Time Synchronization**:
  - WebSockets (Socket.IO) push live updates for dispute creation, new messages, and status changes across Customer, Seller, and Admin rooms.
  - Automatic RTK Query cache invalidation and notification toasts.
- **Audit Trail**: Every dispute lifecycle event (creation, message, internal note, resolution, rejection) is logged immutably via `AuditLogsService`.

---

## 2. Architecture & Modules

```text
Frontend (Customer / Seller / Super Admin)
            │  RTK Query & WebSockets
            ▼
REST API:  /api/v1/disputes/*
            │
            ▼
DisputesController ──▶ DisputesService
                          ├── WalletsService (Wallet debit/credit for refunds)
                          ├── NotificationsService (In-app notification + push)
                          ├── AuditLogsService (Immutable audit log trail)
                          └── EventEmitter2 ──▶ ChatGateway (Socket.IO real-time sync)
```

---

## 3. Directory Layout

### Backend (`apps/api/src/disputes/`)
```
apps/api/src/disputes/
├── controllers/
│   ├── disputes.controller.ts
│   └── disputes.controller.spec.ts
├── dto/
│   ├── create-dispute.dto.ts
│   ├── add-dispute-message.dto.ts
│   ├── resolve-dispute.dto.ts
│   ├── reject-dispute.dto.ts
│   ├── add-internal-note.dto.ts
│   ├── dispute-response.dto.ts
│   └── index.ts
├── entities/
│   ├── dispute.entity.ts
│   ├── dispute-message.entity.ts
│   └── dispute-internal-note.entity.ts
├── enums/
│   ├── dispute-status.enum.ts
│   ├── dispute-reason.enum.ts
│   ├── dispute-resolution-type.enum.ts
│   └── index.ts
├── disputes.service.ts
├── disputes.service.spec.ts
└── disputes.module.ts
```

### Frontend (`apps/web/`)
```
apps/web/
├── src/features/disputes/
│   ├── disputesApi.ts
│   ├── index.ts
│   ├── CustomerDisputesView.tsx
│   ├── CustomerDisputeDetailsView.tsx
│   ├── AdminDisputesView.tsx
│   └── AdminDisputeDetailsView.tsx
├── src/features/seller/disputes/components/
│   ├── SellerDisputesView.tsx
│   └── SellerDisputeDetailsView.tsx
├── src/hooks/
│   └── useDisputeRealtimeSync.ts
└── src/components/disputes/
    └── OpenDisputeDialog.tsx
```

---

## 4. Documentation Index

- [DISPUTE_LIFECYCLE_FLOW.md](./DISPUTE_LIFECYCLE_FLOW.md) — Step-by-step state machine and user journeys.
- [API.md](./API.md) — Complete endpoint reference with request/response schemas.
- [DATABASE.md](./DATABASE.md) — Entity-relationship diagrams and database schema.
- [RESOLUTION_ENGINE.md](./RESOLUTION_ENGINE.md) — Financial settlement and refund mechanics.
