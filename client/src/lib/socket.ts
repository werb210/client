// DISABLED: Socket.IO causing console errors
// Using simple HTTP polling for chat instead

export function getSocket() {
  // Return a mock socket that doesn't actually connect
  return {
    emit: (event: string, data?: any) => {
      console.log(`[Mock Socket] Would emit ${event}:`, data);
    },
    on: (event: string, callback: Function) => {
      console.log(`[Mock Socket] Would listen for ${event}`);
    },
    off: (event: string, callback?: Function) => {
      console.log(`[Mock Socket] Would remove listener for ${event}`);
    },
    connected: false,
    disconnect: () => {
      console.log(`[Mock Socket] Would disconnect`);
    }
  };
}

export const socket = getSocket();