import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_SERVER_URL = 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    // Initialize Socket Connection
    const newSocket = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected to server with ID:', newSocket.id);
      // Emit online event with current logged in user ID
      newSocket.emit('user_online', user._id);
    });

    newSocket.on('online_users_list', (usersList) => {
      setOnlineUsers(usersList);
    });

    newSocket.on('user_status_changed', ({ userId, isOnline }) => {
      setOnlineUsers((prev) => {
        if (isOnline) {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
