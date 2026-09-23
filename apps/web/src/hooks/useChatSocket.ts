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
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const socket = getSocket();
  const [isConnected, setIsConnected] = useState<boolean>(() => socket?.connected ?? false);
  if ((socket?.connected ?? false) !== isConnected) {
    setIsConnected(socket?.connected ?? false);
  }

  const joinedRef = useRef<string | null>(null);

  // Global socket listeners for real-time messages, conversation updates, and read receipts
  useEffect(() => {
    if (!isAuthenticated) return;
    const socketInstance = getSocket();
    if (!socketInstance) return;

    const handleNewMessage = (message: ChatMessage) => {
      // 1. Sync into messages cache if this message belongs to any cached conversation
      dispatch(
        chatApi.util.updateQueryData('getMessages', message.conversationId, (draft) => {
          const exists = draft.find((m) => m.id === message.id);
          if (!exists) {
            draft.push(message);
          }
        }),
      );

      // 2. Optimistically update conversations list in cache
      dispatch(
        chatApi.util.updateQueryData('getConversations', undefined, (draft) => {
          const conv = draft.find((c) => c.id === message.conversationId);
          if (conv) {
            conv.lastMessage = message;
            conv.messages = [message];
            conv.updatedAt = message.createdAt;
            if (message.senderId !== user?.id && conversationId !== message.conversationId) {
              conv.unreadCount = (conv.unreadCount || 0) + 1;
            }
          }
        }),
      );

      // 3. Invalidate tags to ensure consistency across unread counts and conversation list
      dispatch(chatApi.util.invalidateTags(['Conversation']));
    };

    const handleConversationUpdated = () => {
      dispatch(chatApi.util.invalidateTags(['Conversation']));
    };

    const handleMessagesRead = ({ conversationId: readConvId }: { conversationId: string }) => {
      dispatch(
        chatApi.util.updateQueryData('getMessages', readConvId, (draft) => {
          for (const msg of draft) {
            msg.isRead = true;
          }
        }),
      );
      dispatch(
        chatApi.util.updateQueryData('getConversations', undefined, (draft) => {
          const conv = draft.find((c) => c.id === readConvId);
          if (conv) {
            conv.unreadCount = 0;
            if (conv.lastMessage) {
              conv.lastMessage.isRead = true;
            }
          }
        }),
      );
    };

    socketInstance.on('new_message', handleNewMessage);
    socketInstance.on('conversation_updated', handleConversationUpdated);
    socketInstance.on('messages_read', handleMessagesRead);

    return () => {
      socketInstance.off('new_message', handleNewMessage);
      socketInstance.off('conversation_updated', handleConversationUpdated);
      socketInstance.off('messages_read', handleMessagesRead);
    };
  }, [isAuthenticated, user?.id, conversationId, dispatch]);

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
    (content: string, messageType = 'TEXT') => {
      const socketInstance = getSocket();
      if (socketInstance && conversationId && isConnected) {
        socketInstance.emit('send_message', { conversationId, content, messageType });
        return true;
      }
      return false;
    },
    [conversationId, isConnected],
  );

  const markRead = useCallback(
    (convId: string) => {
      const socketInstance = getSocket();
      if (socketInstance && isConnected) {
        socketInstance.emit('mark_read', { conversationId: convId });
      }
    },
    [isConnected],
  );

  return { isConnected, sendMessage, markRead };
};

