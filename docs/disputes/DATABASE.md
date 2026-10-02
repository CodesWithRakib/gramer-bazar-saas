# Dispute Database Architecture

This document describes the relational schema, tables, and constraints powering the Disputes system.

---

## 1. Schema Diagram

```mermaid
erDiagram
    USERS ||--o{ DISPUTES : "customerId"
    USERS ||--o{ DISPUTES : "sellerId"
    ORDERS ||--|| DISPUTES : "orderId (unique)"
    DISPUTES ||--o{ DISPUTE_MESSAGES : "disputeId"
    DISPUTES ||--o{ DISPUTE_INTERNAL_NOTES : "disputeId"
    USERS ||--o{ DISPUTE_MESSAGES : "senderId"
    USERS ||--o{ DISPUTE_INTERNAL_NOTES : "createdById"

    DISPUTES {
        uuid id PK
        uuid orderId FK "unique"
        uuid customerId FK
        uuid sellerId FK
        enum reason
        text description
        json evidenceImages
        enum status
        varchar resolutionType
        numeric refundAmount
        text adminDecision
        timestamp createdAt
        timestamp updatedAt
    }

    DISPUTE_MESSAGES {
        uuid id PK
        uuid disputeId FK
        uuid senderId FK
        varchar senderRole
        text message
        varchar attachment
        timestamp createdAt
    }

    DISPUTE_INTERNAL_NOTES {
        uuid id PK
        uuid disputeId FK
        uuid createdById FK
        text note
        timestamp createdAt
    }
```

---

## 2. Enums

### `DisputeStatus`
- `OPEN` — Dispute submitted by customer, awaiting initial review or seller response.
- `UNDER_REVIEW` — Actively being reviewed or conversation is ongoing.
- `RESOLVED` — Admin made a final decision (refund, replacement, or settlement).
- `REJECTED` — Admin determined dispute is invalid or unsubstantiated.

### `DisputeReason`
- `DAMAGED`
- `MISSING_ITEM`
- `NOT_AS_DESCRIBED`
- `WRONG_ITEM`
- `QUALITY_ISSUE`
- `ITEM_NOT_RECEIVED`
- `QUANTITY_ISSUE`
- `PAYMENT_ISSUE`
- `OTHER`

### `DisputeResolutionType`
- `FULL_REFUND`
- `PARTIAL_REFUND`
- `REPLACEMENT`
- `NO_REFUND`
- `REJECTED`
