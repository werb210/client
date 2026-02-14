import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ChatSocketStatus = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";

interface UseChatSocketOptions {
  enabled: boolean;
  sessionId: string | null;
  onStaffJoined?: () => void;
  onMessage?: (message: string) => void;
}

const MAX_RETRY_DELAY_MS = 30000;

function getSocketUrl() {
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws/chat`;
}

export function useChatSocket({ enabled, sessionId, onStaffJoined, onMessage }: UseChatSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const [status, setStatus] = useState<ChatSocketStatus>("idle");

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearRetryTimer();
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setStatus("disconnected");
  }, [clearRetryTimer]);

  const connect = useCallback(() => {
    if (!enabled || !sessionId || typeof window === "undefined") return;

    const socketUrl = getSocketUrl();
    if (!socketUrl) return;

    clearRetryTimer();

    try {
      setStatus(retryCountRef.current > 0 ? "reconnecting" : "connecting");
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        retryCountRef.current = 0;
        setStatus("connected");
        socket.send(JSON.stringify({ type: "join", sessionId }));
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as {
            type?: string;
            message?: string;
            content?: string;
          };

          if (payload.type === "staff_joined") {
            onStaffJoined?.();
            return;
          }

          const nextMessage = payload.message || payload.content;
          if (nextMessage) {
            onMessage?.(nextMessage);
          }
        } catch {
          // ignore malformed payloads
        }
      };

      socket.onclose = () => {
        socketRef.current = null;
        if (!enabled) {
          setStatus("disconnected");
          return;
        }

        retryCountRef.current += 1;
        const delay = Math.min(1000 * 2 ** (retryCountRef.current - 1), MAX_RETRY_DELAY_MS);
        setStatus("reconnecting");
        retryTimerRef.current = window.setTimeout(connect, delay);
      };

      socket.onerror = () => {
        setStatus("reconnecting");
      };
    } catch {
      setStatus("reconnecting");
    }
  }, [clearRetryTimer, enabled, onMessage, onStaffJoined, sessionId]);

  useEffect(() => {
    if (!enabled || !sessionId) {
      disconnect();
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, enabled, sessionId]);

  const send = useCallback((message: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || !sessionId) return false;
    socket.send(JSON.stringify({ type: "message", sessionId, message }));
    return true;
  }, [sessionId]);

  return useMemo(
    () => ({ status, send, disconnect }),
    [disconnect, send, status]
  );
}
