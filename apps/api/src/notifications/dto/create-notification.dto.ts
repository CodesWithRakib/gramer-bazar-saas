import { NotificationType, NotificationPriority } from '../entities/notification.entity.js';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  titleKey?: string | null;
  messageKey?: string | null;
  priority?: NotificationPriority;
  data?: Record<string, unknown> | null;
}

export interface NotifyRoleOptions {
  type: NotificationType;
  title: string;
  message: string;
  titleKey?: string | null;
  messageKey?: string | null;
  priority?: NotificationPriority;
  data?: Record<string, unknown> | null;
}
