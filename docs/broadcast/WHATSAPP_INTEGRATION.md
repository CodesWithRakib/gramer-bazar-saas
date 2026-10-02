# WhatsApp Integration (Future)

> **IMPORTANT**
> Before implementing the real WhatsApp provider, verify the current
> Meta/WhatsApp Business Platform documentation, pricing, template, messaging,
> webhook, and policy requirements because these **may change**. Do not assume
> exact API shapes, limits or prices — confirm them at implementation time.

This document explains how to replace `MockBroadcastProvider` with a real
`WhatsAppBroadcastProvider` **without changing any other part of the system**.

---

## 1. Why real WhatsApp is not connected yet

- It requires a verified Meta Business account, a WhatsApp Business Account, an
  approved business phone number, and approved message templates.
- Promotional messaging has strict opt-in and template-approval rules that must
  be confirmed against the current Meta policy.
- The module is built so the switch is configuration-only. Today the platform
  runs the mock provider and clearly labels simulated delivery.

---

## 2. Current implementation (summary)

| Concern | Where |
| --- | --- |
| Provider contract | `broadcast/providers/broadcast-provider.interface.ts` |
| Active provider selection | `broadcast/providers/broadcast-provider.registry.ts` |
| Mock provider | `broadcast/providers/mock/mock-broadcast.provider.ts` |
| Placeholder provider | `broadcast/providers/whatsapp/whatsapp-broadcast.provider.ts` |
| Queue / worker | `broadcast/services/broadcast-processor.service.ts` |
| Recipient status writes | `BroadcastProcessorService.applyResult()` |
| Template metadata | `broadcast_templates.provider*` columns |

Config: `BROADCAST_PROVIDER` (`mock` | `whatsapp`, default `mock`).

---

## 3. WhatsApp Business setup checklist

Complete all of the following **before** writing the provider:

- [ ] Create/verify a **Meta Business account**.
- [ ] Create a **WhatsApp Business Account (WABA)**.
- [ ] Register a **business phone number** (not currently on WhatsApp).
- [ ] Enable the **WhatsApp Cloud API** for the WABA.
- [ ] Generate a **permanent system-user access token**.
- [ ] Record the **Phone Number ID**.
- [ ] Record the **WhatsApp Business Account ID (WABA ID)**.
- [ ] Configure a **webhook URL** and **verify token**.
- [ ] Create and submit **message templates** for approval.
- [ ] Confirm **opt-in** collection and a documented **opt-out** path.

### Environment variables (placeholders — NOT used yet)

```env
# Future WhatsApp integration. Do NOT commit real values.
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_API_BASE_URL=
```

These are already declared (optional, empty) in `.env.example` and accepted by
`config/env.validation.ts`. Never log tokens or secrets.

---

## 4. Provider template mapping

A local template has a provider-independent body with `{{variables}}`. WhatsApp
requires **provider-approved templates** with named/positional parameters.

`TODO(WHATSAPP): Map the local template to the provider-approved template ID.
Verify current WhatsApp template requirements before implementation.`

Mapping steps:

1. Create the equivalent template on the WhatsApp side and get it approved.
2. Store the approved name/ID in `broadcast_templates.provider_template_id` and
   set `provider_status = APPROVED`.
3. When sending, resolve the local template → provider template name + language,
   and map the ordered `variables` to the provider's parameter list.
4. WhatsApp templates may restrict the number/order of variables and separate
   header/body/button components — model these explicitly at implementation time.

---

## 5. Implementing `WhatsAppBroadcastProvider`

File: `broadcast/providers/whatsapp/whatsapp-broadcast.provider.ts`

```ts
// TODO(WHATSAPP): implement the real provider here.
async sendMessage(input: BroadcastMessageInput): Promise<BroadcastSendResult> {
  // 1. Read credentials from ConfigService (never hardcode).
  // 2. Build the Cloud API request body from input.template + input.body.
  // 3. POST to `${WHATSAPP_API_BASE_URL}/{PHONE_NUMBER_ID}/messages`.
  // 4. Map the response to BroadcastSendResult { providerMessageId, status, ... }.
  // 5. Map provider error codes to { status: FAILED, retryable }.
}
```

Rules:

- Keep all WhatsApp-specific logic **inside this file**.
- Never leak WhatsApp error shapes into `BroadcastService`.
- Return `simulated: false` and populate `providerMessageId` and `retryable`
  accurately. Retryable = transient (rate limit, 5xx); not retryable = invalid
  number, policy rejection, template mismatch.

Then switch:

```env
BROADCAST_PROVIDER=whatsapp
```

---

## 6. Webhook handling

Planned architecture (not implemented):

```
WhatsApp
   ↓
Webhook (HTTPS, public)
   ↓
WhatsAppWebhookController         ← new
   ↓
Provider Event Parser             ← provider-specific
   ↓
BroadcastService (provider-independent status update method)
   ↓
broadcast_recipients (SENT / DELIVERED / READ / FAILED)
```

Requirements:

- **Verification:** respond to Meta's `GET` verification challenge using
  `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
- **Signature validation:** verify the `X-Hub-Signature-256` header before
  trusting any payload.
- **Idempotency:** webhook events can be delivered more than once. Status
  updates must be monotonic (never move `READ` back to `SENT`).
- **Mapping:** resolve incoming `providerMessageId` → `broadcast_recipients` row
  and advance status.
- Do **not** implement the webhook endpoint until the Cloud API integration is
  actually being built and the current payload shape is verified.

---

## 7. Delivery status updates

For the mock provider, `BroadcastProcessorService.advanceSimulatedReceipts()`
fakes receipts. For WhatsApp, **replace this** with webhook-driven updates:

- `sent` → recipient `SENT`
- `delivered` → `DELIVERED`
- `read` → `READ`
- `failed` → `FAILED` with `failed_reason`

The processor should stop simulating receipts when `provider.simulated === false`
(already the case).

---

## 8. Error mapping

Map provider errors to `BroadcastSendResult`:

| Provider condition | `status` | `retryable` |
| --- | --- | --- |
| Accepted / queued | `SENT` (or `QUEUED`) | — |
| Rate limited | `FAILED` | `true` |
| Transient 5xx / timeout | `FAILED` | `true` |
| Invalid recipient number | `FAILED` | `false` |
| Template mismatch / not approved | `FAILED` | `false` |
| Policy / opt-out violation | `FAILED` | `false` |

Retry behaviour is bounded (3 attempts, exponential backoff) by
`BroadcastProcessorService` — see [BROADCAST_FLOW.md](./BROADCAST_FLOW.md).

---

## 9. Rate limits & throttling

Do not invent exact provider limits — **verify current Meta documentation**.
Design implications already in place:

- Batched processing (`processQueuedRecipients(batchSize)`).
- Bounded retries with backoff.
- Idempotency key per recipient → no duplicate sends on retry.
- When implementing, add provider-level throttling inside
  `WhatsAppBroadcastProvider` (e.g. token-bucket) rather than in business logic.

---

## 10. Opt-in / opt-out and transactional vs marketing

- **Marketing** messages (flash sale, discount, coupon, new products) must
  respect `customer_marketing_preferences.whatsapp_marketing_opt_in`. The
  audience resolver already excludes opted-out customers by default.
- **Transactional** notifications (order confirmed, payment received, shipped,
  delivery update) are a **separate** concern and are not sent through this
  module.
- Provide a recorded opt-out path and honour it before every marketing send.

---

## 11. Production rollout checklist

- [ ] Meta/WABA/phone number/token configured as secrets (never committed).
- [ ] Approved templates mapped to `provider_template_id`, status `APPROVED`.
- [ ] `WhatsAppBroadcastProvider` implemented and unit tested.
- [ ] Webhook endpoint implemented + verified + signature validated.
- [ ] Idempotent, monotonic status updates.
- [ ] Rate limiting/throttling inside the provider.
- [ ] Marketing opt-out honoured end to end.
- [ ] `BROADCAST_PROVIDER=whatsapp` set in the target environment.
- [ ] Re-run the broadcast test suite and a staged real campaign.
