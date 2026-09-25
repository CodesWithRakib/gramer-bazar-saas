'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { getSocket } from '@/lib/socket';
import { ordersApi, OrderStatusHistoryItem } from '@/features/orders/ordersApi';
import { toast } from 'sonner';

export interface OrderStatusUpdatedPayload {
  orderId: string;
  previousStatus: string;
  currentStatus: string;
  updatedAt: string;
}

/**
 * Global Realtime Order Synchronization Hook
 *
 * Listens to the canonical `order.status.updated` WebSocket event on the single
 * app-wide socket and:
 * 1. Optimistically updates RTK Query cache for `getOrderById`.
 * 2. Selectively invalidates `Order` tags so active customer, seller, rider,
 *    and admin order lists re-synchronize without a destructive global reset.
 * 3. Prevents duplicate notifications/updates using a sliding-window deduplication map.
 */
export const useOrderRealtimeSync = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const lastProcessedRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();
    if (!socket) return;

    const handleOrderStatusUpdated = (payload: OrderStatusUpdatedPayload) => {
      if (!payload || !payload.orderId || !payload.currentStatus) return;

      const dedupeKey = `${payload.orderId}-${payload.currentStatus}`;
      const lastSeen = lastProcessedRef.current.get(dedupeKey);
      const now = Date.now();
      if (lastSeen && now - lastSeen < 3000) {
        return;
      }
      lastProcessedRef.current.set(dedupeKey, now);

      // Clean up older keys from the map periodically
      if (lastProcessedRef.current.size > 100) {
        lastProcessedRef.current.forEach((timestamp, key) => {
          if (now - timestamp > 10000) {
            lastProcessedRef.current.delete(key);
          }
        });
      }

      // 1. Optimistically update single order detail in RTK Query cache
      dispatch(
        ordersApi.util.updateQueryData('getOrderById', payload.orderId, (draft) => {
          draft.status = payload.currentStatus;
          if (!draft.statusHistory) {
            draft.statusHistory = [];
          }
          const exists = draft.statusHistory.some(
            (h) => h.status === payload.currentStatus && h.createdAt === payload.updatedAt,
          );
          if (!exists) {
            const newHistoryItem: OrderStatusHistoryItem = {
              id: `rt-${Date.now()}`,
              status: payload.currentStatus,
              fromStatus: payload.previousStatus,
              toStatus: payload.currentStatus,
              remark: `Status changed to ${payload.currentStatus}`,
              createdAt: payload.updatedAt || new Date().toISOString(),
            };
            draft.statusHistory.push(newHistoryItem);
          }
        }),
      );

      // 2. Selectively invalidate order tags (order detail + list)
      dispatch(
        ordersApi.util.invalidateTags([
          { type: 'Order', id: payload.orderId },
          'Order',
        ]),
      );

      // 3. User feedback
      const shortId = payload.orderId.slice(0, 8).toUpperCase();
      const formattedStatus = payload.currentStatus.replace(/_/g, ' ');
      toast.info(`Order #${shortId} status: ${formattedStatus}`);
    };

    socket.on('order.status.updated', handleOrderStatusUpdated);

    return () => {
      socket.off('order.status.updated', handleOrderStatusUpdated);
    };
  }, [isAuthenticated, dispatch]);
};
