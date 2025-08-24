import { useEffect } from "react";

export function useWebSocket() {
  useEffect(() => {
    // DISABLED: WebSocket causing console errors
    // Using HTTP polling for updates instead
    console.log("🔄 WebSocket disabled - using HTTP polling for updates");
    
    return () => {
      // Cleanup if needed
    };
  }, []);
}