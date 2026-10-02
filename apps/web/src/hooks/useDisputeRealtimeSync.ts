'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useSocket } from '@/providers/SocketProvider';
import { disputesApi } from '@/features/disputes/disputesApi';

export interface DisputeSocketPayload {
  disputeId: string;
  orderId?: string;
  customerId?: string;
  sellerId?: string;
  reason?: string;
  status?: string;
  messageId?: string;
  senderRole?: string;
  message?: string;
  resolutionType?: string;
  refundAmount?: number;
  adminDecision?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Global Realtime Dispute Synchronization Hook
 *
 * Listens to `dispute:created`, `dispute:message`, and `dispute:updated` WebSocket events and:
 * 1. Deduplicates events with a sliding 3-second window.
 * 2. Selectively invalidates RTK Query `Dispute` tags to refresh customer, seller,
 *    and admin dispute lists and conversation threads in real time without manual reload.
 */
export const useDisputeRealtimeSync = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const lastProcessedRef = useRef<Map<string, number>>(new Map());
  const { socket } = useSocket();

  useEffect(() => {
    if (!isAuthenticated || !socket) return;

    const handleDisputeEvent = (payload: DisputeSocketPayload) => {
      if (!payload || !payload.disputeId) return;

      const dedupeKey = `${payload.disputeId}-${payload.status || payload.messageId || 'event'}`;
      const lastSeen = lastProcessedRef.current.get(dedupeKey);
      const now = Date.now();
      if (lastSeen && now - lastSeen < 3000) {
        return;
      }
      lastProcessedRef.current.set(dedupeKey, now);

      if (lastProcessedRef.current.size > 100) {
        lastProcessedRef.current.forEach((timestamp, key) => {
          if (now - timestamp > 10000) {
            lastProcessedRef.current.delete(key);
          }
        });
      }

      // Invalidate dispute cache tags for real-time refetch
      dispatch(
        disputesApi.util.invalidateTags([
          { type: 'Dispute', id: payload.disputeId },
          'Dispute',
        ])
      );
    };

    socket.on('dispute:created', handleDisputeEvent);
    socket.on('dispute:message', handleDisputeEvent);
    socket.on('dispute:updated', handleDisputeEvent);

    return () => {
      socket.off('dispute:created', handleDisputeEvent);
      socket.off('dispute:message', handleDisputeEvent);
      socket.off('dispute:updated', handleDisputeEvent);
    };
  }, [isAuthenticated, dispatch, socket]);
};
