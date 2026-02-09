import { API_BASE_URL } from "../api/client";
import { ClientProfileStore } from "../state/clientProfiles";
import { clearServiceWorkerCaches } from "../pwa/serviceWorker";
import { setSessionRefreshing } from "../state/sessionRefresh";
import { getClientSessionAuthHeader } from "../state/clientSession";

const REFRESH_ENDPOINT = `${API_BASE_URL}/api/client/session/refresh`;

let refreshPromise: Promise<boolean> | null = null;
let refreshFailed = false;

function redirectToOtp() {
  if (typeof window === "undefined") return;
  window.location.assign("/portal");
}

export async function refreshSessionOnce() {
  if (refreshFailed) return false;
  if (refreshPromise) return refreshPromise;

  setSessionRefreshing(true);
  refreshPromise = fetch(REFRESH_ENDPOINT, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getClientSessionAuthHeader(),
    },
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      setSessionRefreshing(false);
      refreshPromise = null;
    });

  const success = await refreshPromise;
  if (!success) {
    refreshFailed = true;
    ClientProfileStore.clearPortalSessions();
    await clearServiceWorkerCaches("otp");
    redirectToOtp();
  }
  return success;
}

export function resetRefreshFailure() {
  refreshFailed = false;
}
