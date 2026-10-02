# Broadcast Flow

## Template lifecycle

```
DRAFT ──▶ ACTIVE ──▶ ARCHIVED
   ▲         │
   └─────────┘
```

- Created as `DRAFT` (or the requested status) with `provider = <active provider>`
  and `providerStatus = LOCAL_ONLY`.
- The body is validated: malformed `{{ ... }}` and undeclared variables are
  rejected.
- Structured variables are **derived from the body** and stored in
  `broadcast_templates.variables` as `[{ key, label, example, required }]`.
- Future provider mapping sets `providerTemplateId` / `providerStatus`
  (`PENDING → APPROVED | REJECTED`).

## Audience flow

1. Admin picks an audience type:
   `ALL_CUSTOMERS`, `SELECTED_CUSTOMERS`, `ACTIVE_CUSTOMERS`,
   `INACTIVE_CUSTOMERS`, `ORDERED_BEFORE`, `NO_RECENT_ORDER`, `AREA_BASED`.
2. `BroadcastAudienceService.preview()` returns the estimated recipient count,
   a small sample, and how many customers were excluded by opt-out.
3. At **send time** the audience is resolved to a final recipient list and
   snapshotted into `broadcast_recipients` (name + phone preserved for history).

Marketing consent: a `customer_marketing_preferences` row with
`whatsapp_marketing_opt_in = false` excludes the customer from every audience
when `isOptInRequired` is true (the default).

## Campaign lifecycle

```
        ┌─────────── cancel ──────────┐
        ▼                             │
     DRAFT ──▶ SCHEDULED ──▶ PROCESSING ──▶ COMPLETED
                  │              │
                  └── cancel ────┘   └──▶ FAILED
```

| Transition | Allowed |
| --- | --- |
| `DRAFT → SCHEDULED` | yes |
| `DRAFT → PROCESSING` | yes (send now) |
| `SCHEDULED → PROCESSING` | yes (send now or scheduler) |
| `PROCESSING → COMPLETED` | yes (all recipients terminal) |
| `PROCESSING → FAILED` | yes (catastrophic error) |
| `DRAFT/SCHEDULED → CANCELLED` | yes |
| anything → `PROCESSING` from a final state | **rejected** |

Invalid transitions raise `400` (see `BROADCAST_ALLOWED_TRANSITIONS`).

## Recipient lifecycle

```
PENDING ──▶ QUEUED ──▶ SENDING ──▶ SENT ──▶ DELIVERED ──▶ READ
                              └────────────────▶ FAILED
```

- Recipients are created as `QUEUED` when a campaign starts.
- The processor claims a recipient (`SENDING`), calls the provider, then applies
  the result.
- Terminal statuses: `DELIVERED`, `READ`, `FAILED`.

## Queue processing

`BroadcastProcessorService` runs an in-process timer (every 5s):

1. `processScheduledCampaigns()` — starts due `SCHEDULED` campaigns.
2. `processQueuedRecipients()` — claims `QUEUED` (and stale `SENDING`) recipients,
   sends via the active provider, applies the result.
3. `advanceSimulatedReceipts()` — **mock only**, fakes `SENT → DELIVERED → READ`.
4. `finalizeCompletedCampaigns()` — marks a drained campaign `COMPLETED`.

The timer is skipped when `NODE_ENV=test` or `DISABLE_BROADCAST_WORKER=true`.

> **Scaling note.** The timer assumes a single worker instance. When
> horizontally scaled, replace it with the shared Redis/BullMQ queue; the
> business methods above stay unchanged.

## Cancellation

Only `DRAFT` and `SCHEDULED` campaigns can be cancelled. Cancellation sets
`status = CANCELLED`, `cancelledAt`, and writes an audit entry.

## Retry & duplicate prevention

- Transient provider failures are retried up to **3 attempts** with exponential
  backoff (30s → 60s → 120s, capped at 5 min).
- A non-retryable failure goes straight to `FAILED`.
- Each provider call carries an idempotency key
  (`broadcast:<broadcastId>:recipient:<recipientId>`).
- The unique constraint `(broadcast_id, customer_id)` plus `ON CONFLICT DO
  NOTHING` inserts prevent a recipient from being enqueued twice.
- Stale `SENDING` recipients (older than 2 minutes) are reclaimed so a crashed
  worker cannot strand them.
