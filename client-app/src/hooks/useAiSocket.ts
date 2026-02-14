import { useEffect } from "react";

export function useAiSocket(sessionId: string | null) {
  useEffect(() => {
    if (!sessionId) return;

    const socket = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/ai?sessionId=${sessionId}`
    );

    return () => socket.close();
  }, [sessionId]);
}
