# Gramer Bazar — Production Messaging & Chat Architecture

This document specifies the design, database constraints, WebSocket protocols, API contracts, authorization rules, and scalability considerations for the real-time messaging system across Gramer Bazar.

---

## 1. High-Level Architecture Flow

```text
┌────────────────────────────────────────────────────────┐
│                   Authenticated User                   │
│   (JWT verified in handshake auth & per-request guard) │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │     Socket Connection     │
              │   (Singleton in lib/socket)│
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │         User Room         │
              │       `user_{userId}`     │
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │ Conversation Authorization│
              │  (Backend access check)   │
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │      Message Dispatch     │
              │(Idempotent DB persistence)│
              └─────────────┬─────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    Recipient Online?           Recipient Offline?
              │                           │
              ├─ Yes: Status = DELIVERED  └─ Status = SENT
              │       Emit `message:delivered`
              ▼
    Recipient opens chat
              │
              ▼
    Status = READ (Cursor mark_read)
    Emit `message:read` (✓✓ Highlighted)
```

---

## 2. Conversation Rules & Data Integrity

### Rule 1: One Canonical Direct Conversation per User Pair
- Normal direct communication between any pair of users (Customer ↔ Seller, Customer ↔ Rider, Seller ↔ Rider) is mapped to **exactly one** conversation.
- The identity is **order-independent** and determined canonically:
  $$\text{canonicalKey} = \text{"direct:"} + \min(\text{userAId}, \text{userBId}) + \text{":"} + \max(\text{userAId}, \text{userBId})$$
- Whether User A initiates or User B initiates, the exact same conversation is returned.
- Switching between product inquiries and order inquiries between the same users updates the context reference without creating fragmented conversations.

### Rule 2: Database-Level Duplicate Protection
- Uniqueness is strictly guaranteed by a database index:
  ```sql
  CREATE UNIQUE INDEX "idx_conversations_canonical_key" 
  ON "conversations" ("canonical_key") 
  WHERE "canonical_key" IS NOT NULL;
  ```
- Concurrent race conditions (e.g. both parties sending their first message simultaneously) are safely caught (PostgreSQL error code `23505`) and resolved to the single created conversation.

### Rule 3: Support Conversation System
- Support threads between users (Customer, Seller, Rider) and Platform Admin/Support are separated from direct commerce conversations.
- Conversation type: `SUPPORT` (vs. `DIRECT`).
- Includes case management fields: `supportCaseNumber` (e.g. `SUP-1024`), `status` (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and `assignedAdminId`.
- Active support conversations persist ongoing thread history so users and admins can continue support cases seamlessly.

---

## 3. WhatsApp-Style Delivery & Read Status Flow

Messages progress through explicit states:

1. **`SENDING`** (Optimistic Client State):
   - Immediately rendered on the client with a pulsing clock indicator and temporary `clientMessageId`.
2. **`SENT`** (Server Acceptance):
   - Message persisted in database. Single checkmark (`✓`) rendered.
3. **`DELIVERED`** (Recipient Received):
   - If recipient is connected on socket, the server immediately marks `status = 'DELIVERED'` and sets `deliveredAt`.
   - Double checkmark (`✓✓`) rendered in gray.
   - When offline recipients reconnect and join `join_user`, pending messages are marked `DELIVERED` and receipts emitted to senders.
4. **`READ`** (Conversation Opened / Viewed):
   - Emitted when recipient views the conversation via `mark_read` (cursor-based: marks messages up to `lastReadMessageId`).
   - Double checkmark turns sky blue (`✓✓`).
5. **`FAILED`** (Network or Error State):
   - Failed messages offer an inline `Retry` button that resends with the same idempotency key, preventing duplicates.

---

## 4. Real-Time Socket Events Specification

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join_user` | Client → Server | `{}` (authenticated via JWT) | Joins user room `user_{userId}` and role rooms (`admin_room`, etc.). Triggers delivery checks for undelivered messages. |
| `join_conversation` | Client → Server | `{ conversationId: string }` | Verifies participant/admin access and joins `conversation_{conversationId}`. |
| `leave_conversation` | Client → Server | `{ conversationId: string }` | Leaves conversation room. |
| `send_message` | Client → Server | `{ conversationId, content, messageType?, clientMessageId?, metadata? }` | Validates, persists, checks delivery, and broadcasts to room. |
| `new_message` | Server → Client | `ChatMessage` | Broadcast to conversation room and recipient personal room. |
| `message:ack_delivered` | Client → Server | `{ messageId, conversationId }` | Recipient client confirms packet receipt. |
| `message:delivered` | Server → Client | `{ messageId, conversationId, status: 'DELIVERED', deliveredAt }` | Notifies sender of message delivery. |
| `mark_read` | Client → Server | `{ conversationId, lastReadMessageId? }` | Recipient marks thread messages as read. |
| `messages_read` / `message:read` | Server → Client | `{ conversationId, readBy, lastReadMessageId?, readAt }` | Notifies room and sender that messages have been read. |
| `typing:start` | Client → Server | `{ conversationId }` | Emitted when user types (debounced). Zero database writes. |
| `typing:stop` | Client → Server | `{ conversationId }` | Emitted when typing ceases or after 2s timeout. |
| `user_typing` | Server → Client | `{ conversationId, userId, userName, isTyping }` | Broadcast to conversation room for live typing indicator. |
| `conversation_updated` | Server → Client | `{ conversationId, lastMessage }` | Updates sidebar previews and moves active conversation to top. |

---

## 5. API Contracts

### Conversations & Messages
- `GET /api/v1/chat/unread-count`: Returns aggregate `{ unreadCount, unreadConversationsCount }` for nav badges.
- `GET /api/v1/chat/conversations?type=DIRECT|SUPPORT`: Lists threads for the authenticated user, ordered by `updatedAt DESC`.
- `POST /api/v1/chat/conversations`: Finds or atomically creates a conversation for participants (DIRECT) or opens support (SUPPORT).
- `GET /api/v1/chat/conversations/:id`: Retrieves conversation details and participant information.
- `GET /api/v1/chat/conversations/:id/messages?limit=50&before=:cursor`: Cursor-paginated message history.
- `POST /api/v1/chat/conversations/:id/messages`: REST message dispatch fallback (idempotency key supported).
- `PATCH /api/v1/chat/conversations/:id/read`: Marks messages as read up to `lastReadMessageId`.

### Support Ticket Management (Admin / Super Admin)
- `GET /api/v1/chat/support/cases?status=...&priority=...&page=...&limit=...`: Paginated list of support tickets.
- `PATCH /api/v1/chat/support/cases/:id`: Updates support status, priority, or assigns an admin.

---

## 6. Authorization & Security

1. **Never Trust Client-Supplied Identity**:
   - `userId`, `senderRole`, and room memberships are derived exclusively from verified JWT tokens on the server.
2. **Access Control Matrix**:
   - **Direct Conversations**: Visible only to the 2 participants and authorized platform Admins / Super Admins.
   - **Support Conversations**: Visible only to the requesting user and Admins / Super Admins.
   - **Strangers / Unrelated Users**: Return `403 Forbidden` / `WsException('Access denied')`.
3. **Admin Audit Logging**:
   - Admin interventions, viewing non-participant conversations, sending administrative moderation messages, and updating support case statuses are automatically recorded in `audit_logs` without storing sensitive message bodies.
4. **Sender Identity Distinction**:
   - Server reliably tags `senderRole`: `CUSTOMER`, `SELLER`, `RIDER`, `ADMIN`, or `SUPER_ADMIN`. In UI, role indicators are cleanly badged with accessible contrast and no visual clutter.

---

## 7. Performance & Scalability Considerations

- **Composite Database Indexes**:
  - `idx_conversations_canonical_key`: Instant lookups for existing user pairs.
  - `idx_conversations_updated_at`: Fast sorting for conversation lists.
  - `idx_conversations_type_status`: Fast filtering for support queues.
  - `idx_messages_conversation_created`: Fast cursor pagination on message history.
  - `idx_messages_unread`: Fast unread count calculations skipping read messages.
  - `idx_messages_client_id`: Enforces idempotency per conversation.
- **Batched Read Receipts**: Cursor-based mark read updates all pending messages in a single atomic SQL query.
- **Zero DB Writes for Ephemeral Events**: Live typing indicators and socket presence bypass the database entirely.
- **Horizontal Scaling Path**: The gateway architecture is designed to support the `@socket.io/redis-adapter` when clustering backend nodes across multiple containers.
