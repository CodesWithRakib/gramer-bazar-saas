# Dispute Financial Settlement & Resolution Engine

When a Super Admin resolves a dispute with a refund, the **Resolution Engine** interacts directly with the `WalletsService` to ensure double-entry ledger consistency.

---

## 1. Financial Settlement Logic

### Full / Partial Refund Execution

```text
Admin submits Resolve (FULL_REFUND / PARTIAL_REFUND with amount)
                    │
                    ▼
       1. Request Payout Debit from Seller
          walletsService.requestPayoutDebit(sellerId, amount)
                    │
                    ▼
       2. Approve Payout Debit from Seller
          walletsService.approvePayout(sellerId, amount, "Dispute Refund: {id}")
                    │
                    ▼
       3. Credit Refund Earnings to Customer Wallet
          walletsService.creditEarnings(customerId, amount, "Dispute Refund: {id}", disputeId)
                    │
                    ▼
       4. Update Dispute Status to RESOLVED & Persist
                    │
                    ▼
       5. Audit Log (AuditLogsService.record)
                    │
                    ▼
       6. Real-time Event (EventEmitter2 ──▶ ChatGateway)
                    │
                    ▼
       7. Multi-Channel Notifications (Customer & Seller)
```

---

## 2. Invariants & Security Guardrails

1. **Window Guard**: Only orders in `OrderStatus.DELIVERED` within 7 days can be disputed.
2. **Order Idempotency**: Exactly 1 dispute can exist per order (`orderId` is unique).
3. **Authorization Isolation**:
   - Customer can only see/message their own disputes.
   - Seller can only see/message disputes for orders containing their shop's products.
   - Internal notes are completely scrubbed from Customer and Seller queries.
4. **Audit Immutability**: Every status update and financial trigger writes an audit log entry.
