import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { initSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import { ChatMessage, chatApi } from '@/features/chat/chatApi';

export const useChatSocket = (conversationId?: string) => {
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = initSocket(token);
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      // Global message listener
      socket.on('new_message', (message: ChatMessage) => {
        // Optimistically update RTK Query cache for this conversation's messages
        dispatch(
          chatApi.util.updateQueryData('getMessages', message.conversationId, (draft) => {
            const exists = draft.find((m) => m.id === message.id);
            if (!exists) {
              draft.push(message);
            }
          })
        );
        // Also invalidate conversations list to update latest message snippets if needed
        dispatch(chatApi.util.invalidateTags(['Conversation']));
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('new_message');
      };
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, token, dispatch]);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket && conversationId && isConnected) {
      socket.emit('join_conversation', { conversationId });

      return () => {
        socket.emit('leave_conversation', { conversationId });
      };
    }
  }, [conversationId, isConnected]);

  const sendMessage = (content: string) => {
    const socket = socketRef.current;
    if (socket && conversationId && isConnected) {
      socket.emit('send_message', { conversationId, content });
    }
  };

  return { isConnected, sendMessage };
};
