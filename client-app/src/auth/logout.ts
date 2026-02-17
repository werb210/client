import { clearServiceWorkerCaches } from "../pwa/serviceWorker";
import { ClientProfileStore } from "../state/clientProfiles";
import { OfflineStore } from "../state/offline";

const STORAGE_KEYS_TO_REMOVE = [
  "portal_auth_token",
  "client_session_token",
] as const;

export async function clearBrowserCaches() {
  if (!("caches" in globalThis)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  } catch (error) {
    console.warn("Failed to clear caches:", error);
  }
}

export async function unregisterServiceWorkers() {
  if (typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch (error) {
    console.warn("Failed to unregister service workers:", error);
  }
}

export function clearClientStorage() {
  OfflineStore.clear();
  ClientProfileStore.clearAll();

  try {
    STORAGE_KEYS_TO_REMOVE.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn("Failed to remove scoped storage keys:", error);
  }
}

export async function logout(options?: { redirectTo?: string }) {
  const redirectTo = options?.redirectTo ?? "/portal";
  clearClientStorage();

  await Promise.all([
    clearServiceWorkerCaches("logout"),
    clearBrowserCaches(),
    unregisterServiceWorkers(),
  ]);

  if (typeof window === "undefined") return;
  window.location.assign(redirectTo);
}
