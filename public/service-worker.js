/* Dev-safe no-op SW */
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => clients.claim());
self.addEventListener("fetch", () => {}); // no addAll/add to Cache in dev