import { useCallback, useEffect, useRef, useState } from "react";
import type { AiMessage } from "../api/ai";

type SocketState = "idle" | "connecting" | "connected" | "disconnected";

type UseStaffChatSocketArgs = {
  sessionId: string;
  enabled: boolean;
  onStaffMessage: (message: AiMessage) => void;
};

function getWebSocketUrl(sessionId: string) {
  if (import.meta.env.VITE_AI_STAFF_WS_URL) {
    return `${import.meta.env.VITE_AI_STAFF_WS_URL}?sessionId=${encodeURIComponent(sessionId)}`;
  }

  if (typeof window === "undefined") {
    return "";
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/ai/staff?sessionId=${encodeURIComponent(sessionId)}`;
}

export function useStaffChatSocket({ sessionId, enabled, onStaffMessage }: UseStaffChatSocketArgs) {
  const socketRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<SocketState>("idle");

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setState("disconnected");
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }

    const wsUrl = getWebSocketUrl(sessionId);
    if (!wsUrl) return;

    setState("connecting");
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setState("connected");
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as Partial<AiMessage>;
        if (!payload.content) {
          return;
        }

        onStaffMessage({
          role: "staff",
          content: payload.content,
          timestamp: payload.timestamp || new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to parse staff websocket message", error);
      }
    };

    socket.onerror = () => {
      setState("disconnected");
    };

    socket.onclose = () => {
      setState("disconnected");
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [disconnect, enabled, onStaffMessage, sessionId]);

  return { state, disconnect };
}
