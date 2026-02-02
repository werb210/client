import { OfflineStore } from "../state/offline";

export type ResumeSnapshot = {
  token: string;
  status: any | null;
  cached: any;
  offline: boolean;
};

type ResumeOptions = {
  fetchStatus: (token: string) => Promise<{ data: any }>;
  cached?: any;
  isOnline?: boolean;
};

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
    };
  }

  try {
    const res = await fetchStatus(cached.applicationToken);
    return {
      token: cached.applicationToken,
      status: res.data,
      cached,
      offline: false,
    };
  } catch (error) {
    console.warn("Resume fetch failed:", error);
    return {
      token: cached.applicationToken,
      status: null,
      cached,
      offline: true,
    };
  }
}
