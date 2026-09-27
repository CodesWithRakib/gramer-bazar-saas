'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getSocket } from '@/lib/socket';
import {
  notificationsApi,
  useMarkAsReadMutation,
} from '@/features/notifications/notificationsApi';
import {
  AppNotification,
  NotificationPriority,
  RealtimeNotificationPayload,
} from '@/types/notifications';
import { showNotificationToast } from '@/components/ui/NotificationToast';
import { playNotificationSound } from '@/lib/notification-sound';

/**
 * Global Real-time Notification Listener Hook
 *
 * Runs once at root/SocketProvider level.
 * 1. Listens to `notification:new` from backend socket.
 * 2. Deduplicates events with a sliding 10-second window.
 * 3. Optimistically updates RTK Query caches for notifications list and unread count.
 * 4. Shows custom minimal SaaS toast.
 * 5. Plays synthesized chime for HIGH/CRITICAL priority events.
 * 6. Synchronizes cross-tab read states via `notification:read` and `notification:all_read`.
 */
export function useNotificationListener() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const params = useParams();
  const lang = (typeof params?.lang === 'string' ? params.lang : 'bn') as string;
  const [markAsRead] = useMarkAsReadMutation();

  const processedIdsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notification: RealtimeNotificationPayload) => {
      if (!notification || !notification.id) return;

      // Sliding window deduplication (10s)
      const now = Date.now();
      const lastSeen = processedIdsRef.current.get(notification.id);
      if (lastSeen && now - lastSeen < 10000) {
        return;
      }
      processedIdsRef.current.set(notification.id, now);

      // Clean up old entries from deduplication map
      if (processedIdsRef.current.size > 100) {
        processedIdsRef.current.forEach((time, id) => {
          if (now - time > 15000) {
            processedIdsRef.current.delete(id);
          }
        });
      }

      // 1. Optimistically update notifications list cache
      dispatch(
        notificationsApi.util.updateQueryData('getUserNotifications', undefined, (draft) => {
          const exists = draft.items.some((item) => item.id === notification.id);
          if (!exists) {
            draft.items.unshift(notification);
            draft.total += 1;
            if (!notification.isRead) {
              draft.unreadCount += 1;
            }
          }
        })
      );

      // 2. Optimistically update unread count cache
      if (!notification.isRead) {
        dispatch(
          notificationsApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
            draft.count = (draft.count || 0) + 1;
          })
        );
      }

      // 3. Play sound for HIGH / CRITICAL events (gated by mute settings)
      if (
        notification.priority === NotificationPriority.HIGH ||
        notification.priority === NotificationPriority.CRITICAL
      ) {
        playNotificationSound(notification.priority);
      }

      // 4. Display toast (unless LOW priority, which only appears in notification center)
      if (notification.priority !== NotificationPriority.LOW) {
        const roles = Array.isArray(user?.roles) ? user.roles : [];
        showNotificationToast(notification, {
          roles,
          lang,
          onRead: (id: string) => {
            markAsRead(id);
          },
        });
      }
    };

    const handleNotificationRead = (payload: { id: string }) => {
      if (!payload?.id) return;

      // Update notifications list cache
      dispatch(
        notificationsApi.util.updateQueryData('getUserNotifications', undefined, (draft) => {
          const item = draft.items.find((n) => n.id === payload.id);
          if (item && !item.isRead) {
            item.isRead = true;
            draft.unreadCount = Math.max(0, draft.unreadCount - 1);
          }
        })
      );

      // Update unread count cache
      dispatch(
        notificationsApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
          draft.count = Math.max(0, (draft.count || 0) - 1);
        })
      );
    };

    const handleAllRead = () => {
      // Mark all in cache as read
      dispatch(
        notificationsApi.util.updateQueryData('getUserNotifications', undefined, (draft) => {
          draft.items.forEach((item) => {
            item.isRead = true;
          });
          draft.unreadCount = 0;
        })
      );

      dispatch(
        notificationsApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
          draft.count = 0;
        })
      );
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:read', handleNotificationRead);
    socket.on('notification:all_read', handleAllRead);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:read', handleNotificationRead);
      socket.off('notification:all_read', handleAllRead);
    };
  }, [isAuthenticated, user?.id, user?.roles, dispatch, lang, markAsRead]);
}
