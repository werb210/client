import { useEffect, useState } from "react";

export type PollingState =
  | "polling"
  | "paused"
  | "reconnecting"
  | "terminal";

type VisibilitySubscriber = (handler: () => void) => () => void;

export type ProcessingStatusPollerOptions<T> = {
  enabled?: boolean;
  fetchStatus: () => Promise<T>;
  onUpdate: (status: T) => void;
  onError?: (error: unknown) => void;
  isTerminal?: (status: T) => boolean;
  onStateChange?: (state: PollingState) => void;
  getVisibility?: () => boolean;
  getOnline?: () => boolean;
  subscribeVisibility?: VisibilitySubscriber;
  subscribeOnline?: VisibilitySubscriber;
  initialDelayMs?: number;
  maxDelayMs?: number;
};

const DEFAULT_INITIAL_DELAY_MS = 5000;
const DEFAULT_MAX_DELAY_MS = 60000;

function defaultGetVisibility() {
  if (typeof document === "undefined") return true;
  return document.visibilityState === "visible";
}

function defaultSubscribeVisibility(handler: () => void) {
  if (typeof document === "undefined") return () => undefined;
  window.addEventListener("visibilitychange", handler);
  window.addEventListener("focus", handler);
  return () => {
    window.removeEventListener("visibilitychange", handler);
    window.removeEventListener("focus", handler);
  };
}

function defaultGetOnline() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

function defaultSubscribeOnline(handler: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("online", handler);
  window.addEventListener("offline", handler);
  return () => {
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);
  };
}

export function createProcessingStatusPoller<T>({
  fetchStatus,
  onUpdate,
  onError,
  isTerminal = () => false,
  onStateChange,
  getVisibility = defaultGetVisibility,
  getOnline = defaultGetOnline,
  subscribeVisibility = defaultSubscribeVisibility,
  subscribeOnline = defaultSubscribeOnline,
  initialDelayMs = DEFAULT_INITIAL_DELAY_MS,
  maxDelayMs = DEFAULT_MAX_DELAY_MS,
}: ProcessingStatusPollerOptions<T>) {
  let stopped = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let delayMs = initialDelayMs;
  let state: PollingState = "polling";

  const setState = (next: PollingState) => {
    state = next;
    onStateChange?.(next);
  };

  const clearTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const shouldPause = () => !getVisibility() || !getOnline();

  const schedule = () => {
    if (stopped || shouldPause() || state === "terminal") return;
    clearTimer();
    timeoutId = setTimeout(() => {
      void poll();
    }, delayMs);
    delayMs = Math.min(maxDelayMs, delayMs * 2);
  };

  const poll = async () => {
    if (stopped || shouldPause()) return;
    try {
      const nextStatus = await fetchStatus();
      if (stopped) return;
      onUpdate(nextStatus);
      if (isTerminal(nextStatus)) {
        setState("terminal");
        clearTimer();
        return;
      }
      setState(state === "reconnecting" ? "polling" : state);
      schedule();
    } catch (error) {
      if (stopped) return;
      onError?.(error);
      if (!shouldPause()) {
        setState("reconnecting");
      }
      schedule();
    }
  };

  const handleConnectivityChange = () => {
    if (stopped) return;
    if (shouldPause()) {
      setState("paused");
      clearTimer();
      return;
    }
    if (state === "paused") {
      setState("reconnecting");
      void poll();
    }
  };

  const unsubscribeVisibility = subscribeVisibility(handleConnectivityChange);
  const unsubscribeOnline = subscribeOnline(handleConnectivityChange);

  if (shouldPause()) {
    setState("paused");
  } else {
    void poll();
  }

  return () => {
    stopped = true;
    clearTimer();
    unsubscribeVisibility();
    unsubscribeOnline();
  };
}

export function useProcessingStatusPoller<T>({
  enabled = true,
  fetchStatus,
  onUpdate,
  onError,
  isTerminal,
  getVisibility,
  getOnline,
  subscribeVisibility,
  subscribeOnline,
  initialDelayMs,
  maxDelayMs,
}: ProcessingStatusPollerOptions<T>) {
  const [state, setState] = useState<PollingState>("polling");

  useEffect(() => {
    if (!enabled) {
      setState("paused");
      return;
    }
    const stop = createProcessingStatusPoller({
      fetchStatus,
      onUpdate,
      onError,
      isTerminal,
      getVisibility,
      getOnline,
      subscribeVisibility,
      subscribeOnline,
      initialDelayMs,
      maxDelayMs,
      onStateChange: setState,
    });
    return () => stop();
  }, [
    enabled,
    fetchStatus,
    getOnline,
    getVisibility,
    initialDelayMs,
    isTerminal,
    maxDelayMs,
    onError,
    onUpdate,
    subscribeOnline,
    subscribeVisibility,
  ]);

  return { state };
}
