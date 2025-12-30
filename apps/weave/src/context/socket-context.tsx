import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
        // TODO: Make URL configurable via ENV
        const newSocket = io('http://localhost:3001', {
            auth: {
                token: localStorage.getItem('access_token'),
            },
            transports: ['websocket'], 
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    } else {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
    }
  }, [isAuthenticated]); // removed user dependency to avoid reconnects on user profile updates if token is same

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
