# Provider Architecture

The single most important design rule of this module:

> **Only provider-specific code lives behind `BroadcastProvider`.**
> Template management, audience management, campaign management, scheduling,
> recipient tracking, analytics, audit logs and the admin UI are all
> provider-independent.

## The contract

`apps/api/src/broadcast/providers/broadcast-provider.interface.ts`

```ts
interface BroadcastProvider {
  readonly name: BroadcastProviderName;
  readonly simulated: boolean;
  sendMessage(input: BroadcastMessageInput): Promise<BroadcastSendResult>;
  isReady?(): Promise<boolean>;
}
```

`BroadcastMessageInput` contains only what **any** provider needs:

- `recipientId`, `to` (phone), `body` (rendered message)
- optional `template` reference (`providerTemplateId`, `name`, `language`, `variables`)
- `idempotencyKey` (so retries cannot double-send)
- `metadata` (logging only, never secrets)

`BroadcastSendResult` returns a provider message id, a status
(`QUEUED | SENT | DELIVERED | READ | FAILED`), a `simulated` flag, an optional
`failureReason`, and `retryable`.

## Registry / selection

`BroadcastProviderRegistry` is the **only** place that decides which provider is
active. It reads `BROADCAST_PROVIDER` (`mock` | `whatsapp`, default `mock`) via
`ConfigService.broadcast.provider`.

```ts
providerRegistry.getActive();      // provider used for sends
providerRegistry.getActiveName();  // persisted on templates/campaigns
providerRegistry.isSimulated();    // drives "simulated" flags in responses
```

No other module may instantiate a provider directly.

## Providers

| Provider | Status | Delivery |
| --- | --- | --- |
| `MockBroadcastProvider` | Implemented | Simulated (no network) |
| `WhatsAppBroadcastProvider` | **Placeholder** | Not implemented — throws `503` |

### Mock provider

- Returns `SENT` with a synthetic `mock-<uuid>` message id.
- `BROADCAST_MOCK_FAILURE_RATE` (0–1) can inject transient failures so retry
  handling can be exercised.
- `simulated: true` on every result.
- Delivery/read receipts are **simulated asynchronously** by
  `BroadcastProcessorService.advanceSimulatedReceipts()`.

### WhatsApp provider

`sendMessage()` is intentionally unimplemented and throws
`ServiceUnavailableException`. It exists so the system can be switched with one
env var once implemented. See [WHATSAPP_INTEGRATION.md](./WHATSAPP_INTEGRATION.md).

## Why an interface rather than a direct SDK call

- Swapping providers cannot touch business logic.
- Tests can run against the deterministic mock.
- Provider-specific concerns (template approval, error codes, rate limits,
  webhooks) stay isolated.

## Outbound receipts vs. inbound webhooks

- **Mock**: the background processor fakes `SENT → DELIVERED → READ`.
- **Real WhatsApp**: provider status arrives via **webhooks**, which will call
  back into the provider-independent recipient update path. See the integration
  doc for the planned `WhatsAppWebhookController`.
