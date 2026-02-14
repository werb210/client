import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ChatSocketStatus = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";

interface UseChatSocketOptions {
  enabled: boolean;
  sessionId: string | null;
  readinessToken?: string | null;
  onHumanActive?: () => void;
  onMessage?: (message: string) => void;
}

const MAX_RETRY_DELAY_MS = 30000;
const MAX_RETRY_ATTEMPTS = 8;

function getSocketUrl() {
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws/chat`;
}

export function useChatSocket({
  enabled,
  sessionId,
  readinessToken,
  onHumanActive,
  onMessage,
}: UseChatSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);
  const enabledRef = useRef(enabled);
  const onMessageRef = useRef(onMessage);
  const onHumanActiveRef = useRef(onHumanActive);
  const [status, setStatus] = useState<ChatSocketStatus>("idle");

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onHumanActiveRef.current = onHumanActive;
  }, [onHumanActive]);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const setSafeStatus = useCallback((next: ChatSocketStatus) => {
    if (mountedRef.current) {
      setStatus(next);
    }
  }, []);

  const disconnect = useCallback(() => {
    clearRetryTimer();
    retryCountRef.current = 0;
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setSafeStatus("disconnected");
  }, [clearRetryTimer, setSafeStatus]);

  const connect = useCallback(() => {
    if (!enabledRef.current || !sessionId || typeof window === "undefined") return;

    const socketUrl = getSocketUrl();
    if (!socketUrl) return;

    clearRetryTimer();

    try {
      setSafeStatus(retryCountRef.current > 0 ? "reconnecting" : "connecting");
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        retryCountRef.current = 0;
        setSafeStatus("connected");
        socket.send(JSON.stringify({ type: "join", sessionId, readinessToken: readinessToken || undefined }));
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as {
            type?: string;
            mode?: string;
            message?: string;
            content?: string;
          };

          if (payload.type === "HUMAN_ACTIVE" || payload.mode === "HUMAN_ACTIVE") {
            onHumanActiveRef.current?.();
            return;
          }

          if (payload.type === "AI_ACTIVE" || payload.mode === "AI_ACTIVE") {
            return;
          }

          const nextMessage = payload.message || payload.content;
          if (nextMessage) {
            onMessageRef.current?.(nextMessage);
          }
        } catch {
          // ignore malformed payloads
        }
      };

      socket.onclose = () => {
        socketRef.current = null;
        if (!enabledRef.current) {
          setSafeStatus("disconnected");
          return;
        }

        retryCountRef.current += 1;
        if (retryCountRef.current > MAX_RETRY_ATTEMPTS) {
          setSafeStatus("disconnected");
          return;
        }

        const delay = Math.min(1000 * 2 ** (retryCountRef.current - 1), MAX_RETRY_DELAY_MS);
        setSafeStatus("reconnecting");
        retryTimerRef.current = window.setTimeout(connect, delay);
      };

      socket.onerror = () => {
        setSafeStatus("reconnecting");
      };
    } catch {
      setSafeStatus("reconnecting");
    }
  }, [clearRetryTimer, readinessToken, sessionId, setSafeStatus]);

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
    socket.send(JSON.stringify({ type: "message", sessionId, readinessToken: readinessToken || undefined, message }));
    return true;
  }, [readinessToken, sessionId]);

  return useMemo(() => ({ status, send, disconnect }), [disconnect, send, status]);
}
