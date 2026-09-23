import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { RootState } from '@/store/store';
import { getSocket } from '@/lib/socket';
import { ChatMessage, chatApi } from '@/features/chat/chatApi';

/**
 * Chat hook over the SINGLE app-wide socket owned by `SocketProvider`
 * (singleton in `lib/socket.ts`).
 *
 * Responsibilities:
 * - join/leave the given conversation room
 * - listen for `new_message` and sync it into the RTK Query cache
 * - expose `sendMessage`
 *
 * It never opens or closes a socket itself — that lifecycle lives in
 * `SocketProvider` (connect on login, disconnect on logout).
 */
export const useChatSocket = (conversationId?: string) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  // Connectivity mirrors the live socket; the render-time adjustment keeps it
  // in sync with connect/disconnect events without setState in effect bodies.
  const socket = getSocket();
  const [isConnected, setIsConnected] = useState<boolean>(() => socket?.connected ?? false);
  if ((socket?.connected ?? false) !== isConnected) {
    setIsConnected(socket?.connected ?? false);
  }

  // Track the conversation the socket is currently joined to so cleanup always
  // leaves the right room even if `conversationId` changed mid-flight.
  const joinedRef = useRef<string | null>(null);

  // Global message listener → RTK Query cache sync.
  useEffect(() => {
    if (!isAuthenticated) return;
    const socketInstance = getSocket();
    if (!socketInstance) return;

    const handleNewMessage = (message: ChatMessage) => {
      dispatch(
        chatApi.util.updateQueryData('getMessages', message.conversationId, (draft) => {
          const exists = draft.find((m) => m.id === message.id);
          if (!exists) {
            draft.push(message);
          }
        }),
      );
      dispatch(chatApi.util.invalidateTags(['Conversation']));
    };

    socketInstance.on('new_message', handleNewMessage);

    return () => {
      socketInstance.off('new_message', handleNewMessage);
    };
  }, [isAuthenticated, dispatch]);

  // Join / leave the conversation room.
  useEffect(() => {
    const socketInstance = getSocket();
    if (!socketInstance || !conversationId || !isConnected) return;

    socketInstance.emit('join_conversation', { conversationId });
    joinedRef.current = conversationId;

    return () => {
      if (joinedRef.current) {
        socketInstance.emit('leave_conversation', { conversationId: joinedRef.current });
        joinedRef.current = null;
      }
    };
  }, [conversationId, isConnected]);

  const sendMessage = useCallback(
    (content: string) => {
      const socketInstance = getSocket();
      if (socketInstance && conversationId && isConnected) {
        socketInstance.emit('send_message', { conversationId, content });
        return true;
      }
      return false;
    },
    [conversationId, isConnected],
  );

  return { isConnected, sendMessage };
};
