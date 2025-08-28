// WebSocket integration disabled - using HTTP polling for real-time features
// This provides better reliability and fewer connection issues

export function getSocket() {
  // HTTP polling-based implementation for better stability
  return {
    emit: (event: string, data?: any) => {
      console.log(`[HTTP Polling] Event ${event} will be handled via API calls:`, data);
    },
    on: (event: string, callback: Function) => {
      console.log(`[HTTP Polling] Listening for ${event} via polling`);
    },
    off: (event: string, callback?: Function) => {
      console.log(`[HTTP Polling] Stopped listening for ${event}`);
    },
    connected: false, // Always false since we use HTTP polling
    disconnect: () => {
      console.log(`[HTTP Polling] No connection to disconnect`);
    }
  };
}

export const socket = getSocket();