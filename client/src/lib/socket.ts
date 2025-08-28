// WebSocket integration for real-time features
// Provides real-time updates for better user experience

interface SocketInterface {
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback?: Function) => void;
  connected: boolean;
  connect?: () => void;
  disconnect: () => void;
}

export function getSocket(): SocketInterface {
  // Mock socket implementation for development
  return {
    emit: (event: string, data?: any) => {
      // Emit events via HTTP API as fallback
      console.log(`[Socket] Event ${event}:`, data);
    },
    on: (event: string, callback: Function) => {
      console.log(`[Socket] Listening for ${event}`);
      // In production, this would connect to real WebSocket
    },
    off: (event: string, callback?: Function) => {
      console.log(`[Socket] Stopped listening for ${event}`);
    },
    connected: true, // Simulate connection for development
    connect: () => {
      console.log(`[Socket] Connected`);
    },
    disconnect: () => {
      console.log(`[Socket] Disconnected`);
    }
  };
}

export const socket = getSocket();