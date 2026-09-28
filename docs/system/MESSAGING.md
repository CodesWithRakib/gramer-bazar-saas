# Realtime Messaging Architecture

## Overview

The messaging system enables direct realtime chat between customers, sellers, riders, and platform administrators.

---

## Data Model & Constraints

- **Conversation (`Conversation`)**: Represents a 1-to-1 or group conversation thread between participants.
  - Fields: `id`, `title`, `type` (`DIRECT`, `SUPPORT`, `ORDER`), `orderId`, `createdAt`, `updatedAt`.
- **Conversation Participant (`ConversationParticipant`)**: Maps users to conversations with unread counters and read timestamps.
  - Fields: `conversationId`, `userId`, `unreadCount`, `lastReadAt`.
- **Message (`Message`)**: Individual text message record.
  - Fields: `id`, `conversationId`, `senderId`, `content`, `attachments`, `createdAt`.

### Uniqueness Rule
Direct 1-to-1 conversations between two participants are unique. Requesting a conversation between User A and User B will always return the existing `Conversation` entity rather than duplicating threads.

---

## WebSocket & REST Protocol

1. **Connection & Auth**: Client connects to `http://localhost:4000` with JWT access token (`auth: { token: '...' }`).
2. **Room Subscription**: User joins room `user_{id}` on socket connect. When viewing a thread, user joins room `conversation_{id}`.
3. **Sending Messages**:
   - Primary: Socket event `send_message` payload `{ conversationId, content }`.
   - Fallback: REST endpoint `POST /api/v1/chat/messages`.
4. **Typing Indicators**: Socket events `typing_start` and `typing_stop` broadcasted to room `conversation_{id}` (transient, no DB writes).
5. **Read Receipts**: Socket event `mark_read` updates `unreadCount = 0` and broadcasts `messages_read` event to participants.
