# Realtime Architecture (Socket.IO)

## Overview

Realtime communication in Gramer Bazar is powered by NestJS WebSockets (`@nestjs/platform-socket.io`) on backend port `4000` and `socket.io-client` on frontend port `5000`.

---

## Singleton Connection Pattern

The client maintains a single app-wide Socket.IO instance initialized via `SocketProvider`.
Navigating between client routes does NOT tear down or re-open WebSocket connections.

```text
Connection URL: http://localhost:4000
Transport: ['websocket', 'polling']
Auth Payload: { token: JWT_ACCESS_TOKEN }
```

---

## Events & Broadcast Rooms

| Event Name | Direction | Payload | Description |
| ---------- | --------- | ------- | ----------- |
| `order.status.updated` | Server -> Client | `{ orderId, currentStatus, updatedAt }` | Realtime order timeline sync |
| `notification` | Server -> Client | `{ id, title, message, type }` | Realtime toast & unread counter |
| `send_message` | Client -> Server | `{ conversationId, content }` | Send chat message |
| `new_message` | Server -> Client | `{ id, conversationId, content, senderId }` | Receive message in thread |
| `typing_start` | Client -> Server | `{ conversationId }` | Transient typing indicator |
| `typing_stop` | Client -> Server | `{ conversationId }` | Clear typing indicator |
| `mark_read` | Client -> Server | `{ conversationId }` | Reset unread message count |
