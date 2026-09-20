import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGetProfileQuery } from '@/features/auth/authApi';

export function useSocket(): { socket: Socket | null; isConnected: boolean } {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: user } = useGetProfileQuery();

  useEffect(() => {
    // Only connect if the user is logged in and we have a token
    const token = typeof document !== 'undefined' 
      ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] 
      : null;
    
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    if (!socket) {
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      const newSocket = io(socketUrl, {
        auth: {
          token: `Bearer ${token}`
        },
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return { socket, isConnected };
}
