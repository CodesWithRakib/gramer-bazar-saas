'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { initSocket, disconnectSocket, getSocket } from '@/lib/socket';

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
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const socket = getSocket();

  // Connectivity mirrors the live socket. Event handlers keep it fresh, and the
  // render-time adjustment below self-heals any missed transition (React's
  // "adjust state when external state changes during render" pattern) — e.g. a
  // socket created between renders.
  const [isConnected, setIsConnected] = useState<boolean>(() => socket?.connected ?? false);
  if ((socket?.connected ?? false) !== isConnected) {
    setIsConnected(socket?.connected ?? false);
  }

  useEffect(() => {
    if (!isAuthenticated) {
      // Logout: tear the connection down. The resulting disconnect clears
      // `isConnected` via the render adjustment on the next pass.
      disconnectSocket();
      return;
    }

    const socketInstance = initSocket();
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket: getSocket(), isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
