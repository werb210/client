import { useEffect, useState } from "react";
import { fetchProcessingStatus } from "@/api/processingStatus";
import type { ProcessingStatus } from "@/types/processing";

const POLL_INTERVAL_MS = 10_000;

type VisibilitySubscriber = (handler: () => void) => () => void;

type ProcessingStatusPollerOptions = {
  applicationId: string;
  fetchStatus: (applicationId: string) => Promise<ProcessingStatus>;
  onUpdate: (status: ProcessingStatus) => void;
  onError?: (error: unknown) => void;
  getVisibility: () => boolean;
  subscribeVisibility: VisibilitySubscriber;
  intervalMs?: number;
};

export function isProcessingComplete(status: ProcessingStatus | null): boolean {
  if (!status) return false;
  return status.ocr.status === "completed" && status.banking.status === "completed";
}

export function createProcessingStatusPoller({
  applicationId,
  fetchStatus,
  onUpdate,
  onError,
  getVisibility,
  subscribeVisibility,
  intervalMs = POLL_INTERVAL_MS,
}: ProcessingStatusPollerOptions) {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let stopped = false;
  let lastStatus: ProcessingStatus | null = null;

  const stopInterval = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const tick = async () => {
    if (stopped || !getVisibility()) return;
    try {
      const nextStatus = await fetchStatus(applicationId);
      lastStatus = nextStatus;
      onUpdate(nextStatus);
      if (isProcessingComplete(nextStatus)) {
        stopInterval();
      }
    } catch (error) {
      onError?.(error);
    }
  };

  const ensureInterval = () => {
    if (intervalId !== null) return;
    if (isProcessingComplete(lastStatus)) return;
    intervalId = setInterval(() => {
      void tick();
    }, intervalMs);
  };

  const handleVisibility = () => {
    if (stopped) return;
    if (!getVisibility()) {
      stopInterval();
      return;
    }
    void tick().then(() => ensureInterval());
  };

  const unsubscribe = subscribeVisibility(handleVisibility);

  if (getVisibility()) {
    void tick().then(() => ensureInterval());
  }

  return () => {
    stopped = true;
    stopInterval();
    unsubscribe();
  };
}

function getInitialVisibility(): boolean {
  if (typeof document === "undefined") return true;
  return document.visibilityState === "visible";
}

function subscribeVisibility(handler: () => void) {
  if (typeof document === "undefined") return () => undefined;
  window.addEventListener("visibilitychange", handler);
  window.addEventListener("focus", handler);
  return () => {
    window.removeEventListener("visibilitychange", handler);
    window.removeEventListener("focus", handler);
  };
}

export function useProcessingStatus(applicationId: string | null) {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    const stop = createProcessingStatusPoller({
      applicationId,
      fetchStatus: fetchProcessingStatus,
      onUpdate: setStatus,
      onError: (error) => {
        console.error("Processing status refresh failed:", error);
      },
      getVisibility: getInitialVisibility,
      subscribeVisibility,
    });
    return () => stop();
  }, [applicationId]);

  return { status };
}
