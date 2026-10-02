'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { initSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useOrderRealtimeSync } from '@/hooks/useOrderRealtimeSync';
import { useNotificationListener } from '@/hooks/useNotificationListener';
import { useDisputeRealtimeSync } from '@/hooks/useDisputeRealtimeSync';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

/**
 * Owns the single app-wide Socket.IO connection (singleton in `lib/socket.ts`).
 *
 * The connection follows the auth slice: it opens when a token exists and is
 * torn down on logout. Components read `{ socket, isConnected }` from
 * `useSocket()`. The previous parallel connection in `useChatSocket` was merged
 * into this provider so chat surfaces never open a second socket.
 *
 * Auth state comes from the Redux slice (populated from localStorage on boot
 * and refreshed by `AuthInitializer`) — no eager `/auth/me` request here.
 */
const SocketListeners = () => {
  useOrderRealtimeSync();
  useNotificationListener();
  useDisputeRealtimeSync();
  return null;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);
  const socket = getSocket();

  const [isConnected, setIsConnected] = useState<boolean>(() => socket?.connected ?? false);
  if ((socket?.connected ?? false) !== isConnected) {
    setIsConnected(socket?.connected ?? false);
  }

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socketInstance = initSocket(accessToken);
    if (accessToken) {
      socketInstance.auth = { token: `Bearer ${accessToken}` };
    }

    if (socketInstance.connected) {
      socketInstance.disconnect();
      socketInstance.connect();
    }

    const handleConnect = () => {
      setIsConnected(true);
      socketInstance.emit('join_user');
    };
    const handleDisconnect = () => setIsConnected(false);

    if (socketInstance.connected) {
      socketInstance.emit('join_user');
    }

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
    };
  }, [isAuthenticated, accessToken]);

  return (
    <SocketContext.Provider value={{ socket: getSocket(), isConnected }}>
      <SocketListeners />
      {children}
    </SocketContext.Provider>
  );
};
