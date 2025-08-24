import { io, Socket } from 'socket.io-client';

// Centralized Socket.IO instance to prevent multiple connections
let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    // Use dynamic URL construction to avoid undefined env vars
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socketInstance = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 5000,
      forceNew: false,
      withCredentials: true,
    });

    // Clean error handling
    socketInstance.on("connect", () => {
      console.log("✅ [Socket] Connected successfully");
    });
    
    socketInstance.on("disconnect", (reason) => {
      console.log(`🔌 [Socket] Disconnected: ${reason}`);
    });
    
    socketInstance.on("connect_error", (error) => {
      console.warn(`⚠️ [Socket] Connection failed, retrying...`);
    });
  }
  
  return socketInstance;
}

// Export the getter function as default
export const socket = getSocket();