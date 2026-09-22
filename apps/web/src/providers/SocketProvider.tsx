'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGetProfileQuery } from '@/features/auth/authApi';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: profile } = useGetProfileQuery();

  useEffect(() => {
    // Only connect if the user is logged in
    if (!profile?.id) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) return;

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const socketUrl = backendUrl.includes('/api/v1') 
      ? backendUrl.replace('/api/v1', '') 
      : new URL(backendUrl).origin;

    const socketInstance = io(socketUrl, {
      auth: {
        token: `Bearer ${token}`
      }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // eslint-disable-next-line
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [profile?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
