export enum NotificationType {
  // Order Lifecycle
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_PROCESSING = 'ORDER_PROCESSING',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',

  // Delivery & Rider
  DELIVERY_ASSIGNED = 'DELIVERY_ASSIGNED',
  DELIVERY_PICKED_UP = 'DELIVERY_PICKED_UP',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',

  // Applications
  SELLER_APPLICATION_SUBMITTED = 'SELLER_APPLICATION_SUBMITTED',
  SELLER_APPLICATION_APPROVED = 'SELLER_APPLICATION_APPROVED',
  SELLER_APPLICATION_REJECTED = 'SELLER_APPLICATION_REJECTED',
  RIDER_APPLICATION_SUBMITTED = 'RIDER_APPLICATION_SUBMITTED',
  RIDER_APPLICATION_APPROVED = 'RIDER_APPLICATION_APPROVED',
  RIDER_APPLICATION_REJECTED = 'RIDER_APPLICATION_REJECTED',

  // Payments & Payouts
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
  PAYOUT_REQUESTED = 'PAYOUT_REQUESTED',
  PAYOUT_APPROVED = 'PAYOUT_APPROVED',
  PAYOUT_REJECTED = 'PAYOUT_REJECTED',

  // General & System
  SYSTEM = 'SYSTEM',
  INFO = 'INFO',
  ALERT = 'ALERT',

  // Backward compatibility aliases
  ORDER_UPDATE = 'ORDER_UPDATE',
  REQUEST = 'REQUEST',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface NotificationData {
  orderId?: string;
  orderNumber?: string;
  deliveryId?: string;
  applicationId?: string;
  payoutId?: string;
  requestId?: string;
  shopName?: string;
  applicantName?: string;
  customerName?: string;
  riderName?: string;
  sellerName?: string;
  amount?: string | number;
  itemCount?: string | number;
  status?: string;
  [key: string]: unknown;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  titleKey?: string | null;
  messageKey?: string | null;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string | null;
  data?: NotificationData | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: AppNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface QueryNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface RealtimeNotificationPayload extends AppNotification {}
