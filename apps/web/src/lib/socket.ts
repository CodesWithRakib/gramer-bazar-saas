import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socket) {
    if (socket.connected) {
      return socket;
    }
    socket.connect();
    return socket;
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const socketUrl = backendUrl.includes('/api/v1') 
    ? backendUrl.replace('/api/v1', '') 
    : new URL(backendUrl).origin;
  
  socket = io(socketUrl, {
    auth: {
      token: `Bearer ${token}`,
    },
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
