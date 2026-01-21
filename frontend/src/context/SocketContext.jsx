import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('https://quiz-app-backend-o4nv.onrender.com/api'); // backend URL
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to socket:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from socket');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
