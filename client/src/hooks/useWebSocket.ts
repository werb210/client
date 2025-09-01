import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    // Initialize Socket.IO connection
    const socket = io({
      transports: ['websocket', 'polling'],
      timeout: 5000,
      retries: 1
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      // Socket.IO connected successfully
    });
    
    socket.on('disconnect', () => {
      // Socket.IO disconnected
    });
    
    socket.on('connect_error', (error) => {
      console.warn("⚠️ Socket.IO connection error:", error.message);
    });
    
    // Listen for chat responses
    socket.on('chat-response', (data) => {
      // Chat response received
      // Dispatch custom event for chat components to listen to
      window.dispatchEvent(new CustomEvent('socket-chat-response', { detail: data }));
    });
    
    // Listen for application status updates
    socket.on('application-status', (data) => {
      // Application status update received
      // Dispatch custom event for application components to listen to
      window.dispatchEvent(new CustomEvent('socket-application-update', { detail: data }));
    });
    
    // Socket.IO initialized for real-time updates
    
    return () => {
      // Cleaning up Socket.IO connection
      socket.disconnect();
    };
  }, []);
  
  // Return socket instance for components that need direct access
  return socketRef.current;
}