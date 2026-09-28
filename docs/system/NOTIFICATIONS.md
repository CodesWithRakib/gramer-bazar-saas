# Realtime Notifications Architecture

## Overview

The notification subsystem delivers multi-channel (In-App live WebSocket, Database, Email) alerts for key system lifecycle events.

---

## Triggered Notification Events

| Event Type | Recipient Roles | Trigger Condition | Notification Message |
| ---------- | --------------- | ----------------- | -------------------- |
| `ORDER_CREATED` | Seller, Admin | Customer places new order | "New order #... placed for your shop" |
| `ORDER_STATUS_CHANGED` | Customer, Seller, Rider | Order status progresses | "Order #... is now OUT_FOR_DELIVERY" |
| `DELIVERY_ASSIGNED` | Rider | Admin assigns delivery to rider | "You have been assigned order #..." |
| `APPLICATION_APPROVED` | Seller / Rider | Admin approves onboarding application | "Your seller application has been approved!" |
| `APPLICATION_REJECTED` | Seller / Rider | Admin rejects application | "Your seller application was rejected." |
| `PAYOUT_APPROVED` | Seller / Rider | Admin approves wallet payout | "Your payout request of ৳... was approved" |
| `NEW_MESSAGE` | All Roles | New chat message received | "New message from ..." |

---

## Technical Flow

1. Service triggers event via `NotificationsService.createNotification(...)`.
2. Notification entity persisted in PostgreSQL table `notifications`.
3. Unread counter incremented in user context.
4. WebSocket Gateway broadcasts event `notification` to user's socket room (`user_{userId}`).
5. Client `SocketProvider` plays sound notification (if enabled) and triggers Sonner toast notification.
