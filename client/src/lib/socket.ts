import { io, Socket } from 'socket.io-client';

// Centralized Socket.IO instance to prevent multiple connections
let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    // Use proper Socket.IO path that matches server setup
    const wsUrl = '/';
    
    socketInstance = io(wsUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      upgrade: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      timeout: 10000,
      forceNew: false,
      withCredentials: false,
    });

    // Minimal logging to reduce console noise
    socketInstance.on("connect", () => {
      console.log("✅ Socket connected");
    });
    
    socketInstance.on("disconnect", (reason) => {
      if (reason !== 'io client disconnect') {
        console.log(`🔌 Socket disconnected: ${reason}`);
      }
    });
    
    socketInstance.on("connect_error", () => {
      // Silent retry - no console spam
    });
  }
  
  return socketInstance;
}

// Export the getter function as default
export const socket = getSocket();