/* Dev-safe SW (no caching) */
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => clients.claim());
self.addEventListener("fetch", () => {});  // no cache.addAll / add