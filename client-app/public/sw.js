const CACHE_VERSION = "v2";
const CACHE_PREFIX = "boreal-";
const STATIC_CACHE = `${CACHE_PREFIX}static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${CACHE_VERSION}`;
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
  const valid = new Set([STATIC_CACHE, RUNTIME_CACHE]);
  await Promise.all(
    keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && !valid.has(key))
      .map((key) => caches.delete(key))
  );
}

async function clearRuntimeCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== STATIC_CACHE)
      .map((key) => caches.delete(key))
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await clearOutdatedCaches();
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type === "SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
    return;
  }
  if (message.type === "CLEAR_CACHES" || message.type === "AUTH_REFRESH") {
    const clear = message.type === "CLEAR_CACHES" ? clearAllCaches : clearRuntimeCaches;
    event.waitUntil(clear().then(clearOutdatedCaches));
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (AUTH_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(fetch(request).catch(() => fetch(request)));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  const destination = request.destination;
  const shouldCache =
    destination === "style" ||
    destination === "script" ||
    destination === "image" ||
    destination === "font" ||
    url.pathname.startsWith("/assets/");

  if (!shouldCache) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});
