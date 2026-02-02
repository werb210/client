type ServiceWorkerMessage =
  | { type: "CLEAR_CACHES" }
  | { type: "AUTH_REFRESH" };

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
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
