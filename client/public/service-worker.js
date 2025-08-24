// Boreal Financial PWA Service Worker
// Basic service worker for PWA functionality

const CACHE_NAME = 'boreal-financial-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Only cache existing resources to avoid errors
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.log(`Failed to cache ${url}:`, error);
            })
          )
        );
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients
  return self.clients.claim();
});

// Fetch Event - Network First Strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If request is successful, clone and cache the response
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request)
          .then((response) => {
            return response || new Response('Offline', { 
              status: 200, 
              statusText: 'OK',
              headers: new Headers({
                'Content-Type': 'text/html'
              })
            });
          });
      })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'form-submission') {
    event.waitUntil(syncFormSubmissions());
  }
});

// Sync form submissions when online
async function syncFormSubmissions() {
  try {
    // This would integrate with IndexedDB to sync offline form submissions
    console.log('Background sync: Form submissions');
    
    // Send message to main thread about sync success
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_SUCCESS' });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push Notification Handler
self.addEventListener('push', (event) => {
  const options = {
    body: 'You have new updates from Boreal Financial',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = data.data || options.data;
  }

  event.waitUntil(
    self.registration.showNotification('Boreal Financial', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/')
  );
});