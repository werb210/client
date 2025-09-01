// Enhanced Service Worker with Advanced Caching Strategy
const CACHE_NAME = 'boreal-financial-v1.2.0';
const API_CACHE_NAME = 'boreal-api-cache-v1.0.0';
const IMAGE_CACHE_NAME = 'boreal-images-v1.0.0';

// Cache strategies for different resource types
const STATIC_CACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json'
];

const API_CACHE_PATTERNS = [
  '/api/lender-products',
  '/api/catalog',
  '/api/document-requirements'
];

const IMAGE_CACHE_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // API requests - stale while revalidate
  if (API_CACHE_PATTERNS.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          const fetchPromise = fetch(request).then(networkResponse => {
            // Update cache with fresh response
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });

          // Return cached version immediately, fetch in background
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // Image requests - cache first with fallback
  if (IMAGE_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) return response;

          return fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Return placeholder image on error
            return new Response(
              '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          });
        });
      })
    );
    return;
  }

  // Static assets - cache first
  if (url.pathname.match(/\.(js|css|woff|woff2|eot|ttf|otf)$/)) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // HTML pages - network first with cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(request).then(response => {
          return response || caches.match('/offline');
        });
      })
    );
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-application') {
    event.waitUntil(syncApplicationData());
  }
});

async function syncApplicationData() {
  try {
    // Get pending applications from IndexedDB
    const db = await openIndexedDB();
    const pendingApps = await getAllPendingApplications(db);
    
    for (const app of pendingApps) {
      try {
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(app.data)
        });
        
        if (response.ok) {
          await deletePendingApplication(db, app.id);
        }
      } catch (error) {
        console.log('Sync failed for application:', app.id);
      }
    }
  } catch (error) {
    console.log('Background sync error:', error);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BorealFinancialDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getAllPendingApplications(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingApplications'], 'readonly');
    const store = transaction.objectStore('pendingApplications');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deletePendingApplication(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingApplications'], 'readwrite');
    const store = transaction.objectStore('pendingApplications');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}