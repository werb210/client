import { OfflineStore } from "../state/offline";

export type ResumeSnapshot = {
  token: string;
  status: any | null;
  cached: any;
  offline: boolean;
  submitted: boolean;
};

type ResumeOptions = {
  fetchStatus: (token: string) => Promise<{ data: any }>;
  cached?: any;
  isOnline?: boolean;
};

export function isApplicationSubmitted(status: any) {
  if (!status) return false;
  return Boolean(
    status.submitted ||
      status.submittedAt ||
      status.submitted_at ||
      status.application?.submitted ||
      status.application?.submittedAt ||
      status.application?.submitted_at
  );
}

export async function resumeApplication({
  fetchStatus,
  cached = OfflineStore.load(),
  isOnline = typeof navigator !== "undefined" ? navigator.onLine : true,
}: ResumeOptions): Promise<ResumeSnapshot | null> {
  if (!cached?.applicationToken) return null;
  if (!isOnline) {
    return {
      token: cached.applicationToken,
      status: null,
      cached,
      offline: true,
      submitted: false,
    };
  }

  try {
    const res = await fetchStatus(cached.applicationToken);
    const submitted = isApplicationSubmitted(res.data);
    return {
      token: cached.applicationToken,
      status: res.data,
      cached,
      offline: false,
      submitted,
    };
  } catch (error) {
    console.warn("Resume fetch failed:", error);
    return {
      token: cached.applicationToken,
      status: null,
      cached,
      offline: true,
      submitted: false,
    };
  }
}
