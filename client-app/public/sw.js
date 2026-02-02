const CACHE_VERSION = "v3";
const CACHE_PREFIX = "boreal-";
const APP_SHELL_CACHE = `${CACHE_PREFIX}app-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `${CACHE_PREFIX}static-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

const CORE_ASSETS = ["/", "/index.html", OFFLINE_URL, "/manifest.webmanifest"];
const AUTH_ROUTES = [
  "/api/client/session",
  "/api/client/session/refresh",
  "/api/client/portal",
  "/api/auth",
];

async function clearAllCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
}

async function clearOutdatedCaches() {
  const keys = await caches.keys();
  const valid = new Set([APP_SHELL_CACHE, STATIC_CACHE]);
  await Promise.all(
    keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && !valid.has(key))
      .map((key) => caches.delete(key))
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .open(APP_SHELL_CACHE)
        .then((cache) => cache.addAll(CORE_ASSETS))
        .catch((error) => {
          console.warn("Failed to precache app shell:", error);
        }),
      self.skipWaiting().catch((error) => {
        console.warn("Failed to skip waiting:", error);
      }),
    ])
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        await clearOutdatedCaches();
      } catch (error) {
        console.warn("Failed to clear outdated caches:", error);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type === "SKIP_WAITING") {
    event.waitUntil(
      self.skipWaiting().catch((error) => {
        console.warn("Failed to skip waiting:", error);
      })
    );
    return;
  }
  if (message.type === "CLEAR_CACHES" || message.type === "AUTH_REFRESH") {
    event.waitUntil(
      clearAllCaches().catch((error) => {
        console.warn("Failed to clear caches:", error);
      })
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (
    url.pathname.startsWith("/api/") ||
    AUTH_ROUTES.some((route) => url.pathname.startsWith(route))
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .catch(async () => {
          const cachedShell = await caches.match("/index.html");
          if (cachedShell) return cachedShell;
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  const destination = request.destination;
  const shouldCache =
    destination === "style" || destination === "script";

  if (!shouldCache) return;

  event.respondWith(
    caches
      .match(request)
      .then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => cached);
      })
      .catch(() => fetch(request))
  );
});
