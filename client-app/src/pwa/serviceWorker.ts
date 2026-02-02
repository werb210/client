type ServiceWorkerMessage =
  | { type: "CLEAR_CACHES" }
  | { type: "AUTH_REFRESH" }
  | { type: "SKIP_WAITING" };

type UpdateListener = (available: boolean) => void;

const UPDATE_RELOAD_KEY = "boreal_sw_update_reloaded";
let updateAvailable = false;
let pendingReload = false;
const updateListeners = new Set<UpdateListener>();

function notifyUpdateAvailable(next: boolean) {
  if (updateAvailable === next) return;
  updateAvailable = next;
  updateListeners.forEach((listener) => listener(updateAvailable));
  if (next && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sw:update-available"));
  }
}

function shouldReloadForUpdate() {
  try {
    return window.sessionStorage.getItem(UPDATE_RELOAD_KEY) !== "true";
  } catch (error) {
    console.warn("Failed to access session storage:", error);
    return true;
  }
}

function markReloaded() {
  try {
    window.sessionStorage.setItem(UPDATE_RELOAD_KEY, "true");
  } catch (error) {
    console.warn("Failed to mark update reload:", error);
  }
}

function clearReloadMarker() {
  try {
    window.sessionStorage.removeItem(UPDATE_RELOAD_KEY);
  } catch (error) {
    console.warn("Failed to clear update reload marker:", error);
  }
}

export function subscribeToServiceWorkerUpdates(listener: UpdateListener) {
  updateListeners.add(listener);
  return () => updateListeners.delete(listener);
}

export function getServiceWorkerUpdateAvailable() {
  return updateAvailable;
}

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  clearReloadMarker();

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (!registration) return;
        if (registration.waiting) {
          notifyUpdateAvailable(true);
        }
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              notifyUpdateAvailable(true);
            }
          });
        });
      })
      .catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!pendingReload) return;
    if (!shouldReloadForUpdate()) return;
    markReloaded();
    window.location.reload();
  });
}

async function postMessage(message: ServiceWorkerMessage) {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage(message);
}

export async function clearServiceWorkerCaches(reason: "logout" | "otp") {
  const message: ServiceWorkerMessage =
    reason === "otp" ? { type: "AUTH_REFRESH" } : { type: "CLEAR_CACHES" };
  await postMessage(message);
}

export async function applyServiceWorkerUpdate() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  pendingReload = true;
  const registration = await navigator.serviceWorker.ready;
  if (registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}
