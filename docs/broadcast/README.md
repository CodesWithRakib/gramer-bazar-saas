# Broadcast & Marketing Communication

A **Super Admin only** module for sending marketing/communication campaigns to
customers.

> **CURRENT STATUS: NO REAL MESSAGES ARE SENT.**
> The platform currently runs the **`MockBroadcastProvider`**. It simulates
> `QUEUED → SENDING → SENT → DELIVERED → READ / FAILED` transitions for
> development and demos. Delivery statistics are **simulated** and must never be
> presented as real WhatsApp delivery.

## What it does

- **Templates** — reusable message bodies with structured `{{variables}}`,
  language, category, and provider mapping metadata.
- **Audience** — extensible customer segmentation plus marketing opt-out
  handling.
- **Campaigns** — build → preview → send now or schedule → track delivery.
- **Analytics** — campaign-level recipient/delivery counters.
- **Audit** — every create/update/delete/send/schedule/cancel is written to the
  existing audit log.

## Who can use it

**Only `SUPER_ADMIN`.** Enforced on the controller with
`@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.SUPER_ADMIN)`. Frontend
route protection is a convenience only — the backend is authoritative.

## Current provider

`BROADCAST_PROVIDER=mock` (default). See
[PROVIDER_ARCHITECTURE.md](./PROVIDER_ARCHITECTURE.md).

## Architecture overview

```
Super Admin UI (apps/web/src/features/super-admin/broadcast)
        │  RTK Query
        ▼
REST API  /api/v1/super-admin/broadcast/*   (NestJS controllers)
        │
        ▼
Application services
  BroadcastTemplatesService · BroadcastAudienceService
  BroadcastCampaignsService · BroadcastProcessorService
        │
        ▼
BroadcastProviderRegistry ──▶ BroadcastProvider
                                 ├── MockBroadcastProvider       (implemented)
                                 └── WhatsAppBroadcastProvider   (placeholder)
```

Business logic (templates, audience, campaigns, scheduling, recipients,
analytics, audit, UI) is **provider-independent**. Only code behind
`BroadcastProvider` is provider-specific.

### Backend layout

```
apps/api/src/broadcast/
├── controllers/           # HTTP layer (Super Admin only)
├── dto/                   # validation + Swagger
├── entities/              # TypeORM entities
├── enums/                 # statuses + audience types + transitions
├── providers/
│   ├── broadcast-provider.interface.ts
│   ├── broadcast-provider.registry.ts
│   ├── mock/mock-broadcast.provider.ts
│   └── whatsapp/whatsapp-broadcast.provider.ts   # TODO(WHATSAPP)
├── seed/                  # development demo templates
├── services/              # application services + background processor
├── utils/                 # template renderer, actor helper
└── broadcast.module.ts
```

## How to run / test

```bash
# typecheck + tests
pnpm -C apps/api run typecheck
pnpm -C apps/api run test

# run migrations (non-synchronize environments)
pnpm -C apps/api run migration:run

# seed development demo templates (idempotent)
pnpm -C apps/api run seed
```

Environment (see apps/api/.env.example):

```env
BROADCAST_PROVIDER=mock
# BROADCAST_MOCK_FAILURE_RATE=0
# BROADCAST_SIMULATED_RECEIPT_DELAY_MS=15000
# BROADCAST_MOCK_READ_RATE=0.7
```

## Further reading

- [PROVIDER_ARCHITECTURE.md](./PROVIDER_ARCHITECTURE.md)
- [BROADCAST_FLOW.md](./BROADCAST_FLOW.md)
- [DATABASE.md](./DATABASE.md)
- [API.md](./API.md)
- [WHATSAPP_INTEGRATION.md](./WHATSAPP_INTEGRATION.md)
