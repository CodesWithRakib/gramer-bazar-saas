import { io, Socket } from 'socket.io-client';

/**
 * App-wide Socket.IO singleton. The connection lifecycle is owned by
 * `SocketProvider` (connect on login, disconnect on logout) so every chat
 * surface shares ONE socket instead of opening parallel connections.
 */
let socket: Socket | null = null;

export const resolveSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/+$/, '');
  }
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  return backendUrl.includes('/api/v1')
    ? backendUrl.replace('/api/v1', '')
    : new URL(backendUrl).origin;
};

export const initSocket = (token?: string | null): Socket => {
  if (socket) {
    if (token) {
      socket.auth = { token: `Bearer ${token}` };
    }
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(resolveSocketUrl(), {
    withCredentials: true,
    auth: token ? { token: `Bearer ${token}` } : undefined,
    transports: ['websocket', 'polling'],
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
