# Database

Migration: `apps/api/src/migrations/1791200000000-BroadcastSystem.ts`
(idempotent — safe alongside synchronize-created development databases).

## `broadcast_templates`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid (PK) | |
| `name` | varchar(150) | |
| `description` | text, null | |
| `language` | varchar(10) | default `en` |
| `category` | enum | `MARKETING`, `UTILITY`, `AUTHENTICATION` |
| `body` | text | contains `{{variables}}` |
| `variables` | jsonb | structured `[{ key, label, example, required }]` |
| `provider` | enum | `MOCK`, `WHATSAPP` |
| `provider_template_id` | varchar(200), null | future WhatsApp mapping |
| `provider_status` | enum | `LOCAL_ONLY`, `PENDING`, `APPROVED`, `REJECTED` |
| `status` | enum | `DRAFT`, `ACTIVE`, `ARCHIVED` |
| `created_by` / `updated_by` | uuid, null | |
| `created_at` / `updated_at` | timestamp | |

Indexes: `idx_broadcast_templates_status`, `idx_broadcast_templates_category`.

## `broadcasts`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid (PK) | |
| `title` | varchar(200) | |
| `template_id` | uuid, null | FK → `broadcast_templates` `ON DELETE SET NULL` |
| `template_name` | varchar(150), null | snapshot so history survives deletion |
| `provider` | enum | `MOCK`, `WHATSAPP` |
| `audience_type` | enum | see audience types |
| `audience_config` | jsonb, null | `{ customerIds, districtId, areaId, inactiveDays, isOptInRequired, variables }` |
| `status` | enum | `DRAFT`, `SCHEDULED`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED` |
| `scheduled_at`, `started_at`, `completed_at`, `cancelled_at` | timestamp, null | |
| `failure_reason` | text, null | |
| `total_recipients`, `sent_count`, `delivered_count`, `read_count`, `failed_count` | int | denormalized counters |
| `created_by`, `created_by_name` | | audit snapshot |
| `created_at`, `updated_at` | timestamp | |

Indexes: `idx_broadcasts_status`, `idx_broadcasts_scheduled_at`,
`idx_broadcasts_created_at`.

**Design decision:** counters are denormalized for fast analytics, but the
**source of truth is `broadcast_recipients`**; counters are incremented as
recipients progress.

## `broadcast_recipients`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid (PK) | |
| `broadcast_id` | uuid | FK → `broadcasts` `ON DELETE CASCADE` |
| `customer_id` | uuid, null | not an FK — snapshot survives account deletion |
| `customer_name` | varchar(200), null | snapshot |
| `phone` | varchar(20) | snapshot |
| `personalized_message` | text, null | rendered body |
| `status` | enum | `PENDING`, `QUEUED`, `SENDING`, `SENT`, `DELIVERED`, `READ`, `FAILED` |
| `provider_message_id` | varchar(200), null | |
| `attempt_count` | int | retry tracking |
| `next_retry_at` | timestamp, null | backoff scheduling |
| `sent_at`, `delivered_at`, `read_at`, `failed_at` | timestamp, null | |
| `failed_reason` | text, null | |
| `created_at`, `updated_at` | timestamp | |

Indexes: `idx_broadcast_recipients_broadcast_status`,
`idx_broadcast_recipients_customer`, `idx_broadcast_recipients_next_retry`.
Unique: `uq_broadcast_recipients_broadcast_customer (broadcast_id, customer_id)`
— the idempotency guard against double-sending a recipient.

**Design decision:** recipient name/phone are intentionally denormalized as a
campaign snapshot. This keeps history accurate even if the customer later
changes their phone or is deleted.

## `customer_marketing_preferences`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid (PK) | |
| `user_id` | uuid | unique |
| `whatsapp_marketing_opt_in` | boolean | default `true` |
| `opted_out_at` | timestamp, null | |
| `source` | varchar(50), null | e.g. `default`, `profile`, `import` |
| `consent_updated_at` | timestamp, null | |
| `created_at`, `updated_at` | timestamp | |

**Design decision (soft opt-in):** consent lives in its own table rather than on
`users` to keep the core table lean and the consent model explicit. A customer
with **no row** is treated as opted-in; a row with
`whatsapp_marketing_opt_in = false` is a hard opt-out honoured by every
marketing audience. Transactional notifications (order/payment/delivery) are
separate and unaffected by this flag.

## Status enums

- Template: `DRAFT | ACTIVE | ARCHIVED`
- Template provider: `LOCAL_ONLY | PENDING | APPROVED | REJECTED`
- Campaign: `DRAFT | SCHEDULED | PROCESSING | COMPLETED | FAILED | CANCELLED`
- Recipient: `PENDING | QUEUED | SENDING | SENT | DELIVERED | READ | FAILED`
- Audience: `ALL_CUSTOMERS | SELECTED_CUSTOMERS | ACTIVE_CUSTOMERS |
  INACTIVE_CUSTOMERS | ORDERED_BEFORE | NO_RECENT_ORDER | AREA_BASED`
