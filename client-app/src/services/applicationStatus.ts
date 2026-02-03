import { api } from "../api/client";

export type SubmissionStatus = "pending" | "submitted" | "failed" | "unknown";

export type SubmissionStatusSnapshot = {
  status: SubmissionStatus;
  updatedAt: string | null;
  rawStatus: string | null;
};

export type SubmissionStatusPollerOptions = {
  applicationId: string;
  onUpdate: (snapshot: SubmissionStatusSnapshot) => void;
  onError?: (error: unknown) => void;
  intervalMs?: number;
  fetchStatus?: (applicationId: string) => Promise<SubmissionStatusSnapshot>;
};

const SUBMISSION_CACHE_PREFIX = "boreal_submission_status";

function getCacheKey(key: string) {
  return `${SUBMISSION_CACHE_PREFIX}:${key}`;
}

export function normalizeSubmissionStatus(rawStatus: unknown): SubmissionStatus {
  const normalized = String(rawStatus || "").toLowerCase();
  if (normalized === "submitted" || normalized === "complete") return "submitted";
  if (normalized === "pending" || normalized === "processing") return "pending";
  if (normalized === "failed" || normalized === "error") return "failed";
  return "unknown";
}

export function mapSubmissionStatus(payload: any): SubmissionStatusSnapshot {
  const rawStatus = payload?.status ?? null;
  const updatedAt = payload?.updated_at ?? payload?.updatedAt ?? null;
  return {
    status: normalizeSubmissionStatus(rawStatus),
    updatedAt: updatedAt ? String(updatedAt) : null,
    rawStatus: rawStatus ? String(rawStatus) : null,
  };
}

export function loadSubmissionStatusCache(
  key: string
): SubmissionStatusSnapshot | null {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(getCacheKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SubmissionStatusSnapshot;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (error) {
    console.warn("Failed to load submission status cache:", error);
    return null;
  }
}

export function saveSubmissionStatusCache(
  key: string,
  snapshot: SubmissionStatusSnapshot
) {
  if (!key) return;
  try {
    localStorage.setItem(getCacheKey(key), JSON.stringify(snapshot));
  } catch (error) {
    console.warn("Failed to save submission status cache:", error);
  }
}

export async function fetchSubmissionStatus(applicationId: string) {
  const res = await api.get(`/api/portal/applications/${applicationId}`);
  const submission =
    res?.data?.submission ?? res?.data?.data?.submission ?? res?.data?.data ?? {};
  return mapSubmissionStatus(submission);
}

export function createSubmissionStatusPoller({
  applicationId,
  onUpdate,
  onError,
  intervalMs = 15000,
  fetchStatus = fetchSubmissionStatus,
}: SubmissionStatusPollerOptions) {
  let active = true;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const stop = () => {
    active = false;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  const schedule = () => {
    if (!active) return;
    timeout = setTimeout(poll, intervalMs);
  };

  const poll = async () => {
    if (!active) return;
    try {
      const snapshot = await fetchStatus(applicationId);
      if (!active) return;
      onUpdate(snapshot);
      if (snapshot.status === "pending") {
        schedule();
      } else {
        stop();
      }
    } catch (error) {
      if (!active) return;
      onError?.(error);
      schedule();
    }
  };

  void poll();
  return stop;
}
