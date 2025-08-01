const CACHE_NAME = 'boreal-financial-v1';
const OFFLINE_URL = '/offline/index.html';

// Files to cache for offline functionality
const CACHE_URLS = [
  '/',
  '/offline/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        return fetch(event.request).catch(() => {
          // If both cache and network fail, show offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

// Background sync for upload queue
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'upload-queue') {
    event.waitUntil(processUploadQueue());
  }
  
  if (event.tag === 'form-sync') {
    event.waitUntil(syncFormData());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have a new message',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Application',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      options.title = payload.title || 'Boreal Financial';
      options.body = payload.body || options.body;
      options.data.url = payload.url || '/';
    } catch (e) {
      options.title = 'Boreal Financial';
      options.body = event.data.text() || options.body;
    }
  } else {
    options.title = 'Boreal Financial';
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Process upload queue during background sync
async function processUploadQueue() {
  try {
    console.log('[SW] Processing upload queue');
    
    // Get queued uploads from IndexedDB
    const queuedUploads = await getQueuedUploads();
    
    for (const upload of queuedUploads) {
      try {
        const formData = new FormData();
        formData.append('file', upload.file);
        formData.append('documentType', upload.documentType);
        formData.append('applicationId', upload.applicationId);

        const response = await fetch('/api/public/upload-document', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          await removeFromUploadQueue(upload.id);
          console.log('[SW] Upload synced successfully:', upload.id);
        }
      } catch (error) {
        console.error('[SW] Upload sync failed:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}

// Sync form data during background sync
async function syncFormData() {
  try {
    console.log('[SW] Syncing form data');
    
    // Get pending form data from IndexedDB
    const pendingForms = await getPendingForms();
    
    for (const form of pendingForms) {
      try {
        const response = await fetch('/api/public/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form.data)
        });

        if (response.ok) {
          await removePendingForm(form.id);
          console.log('[SW] Form synced successfully:', form.id);
        }
      } catch (error) {
        console.error('[SW] Form sync failed:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Form sync error:', error);
  }
}

// Helper functions for IndexedDB operations
async function getQueuedUploads() {
  // Implementation would connect to IndexedDB and return queued uploads
  return [];
}

async function removeFromUploadQueue(id) {
  // Implementation would remove the upload from IndexedDB queue
}

async function getPendingForms() {
  // Implementation would get pending forms from IndexedDB
  return [];
}

async function removePendingForm(id) {
  // Implementation would remove the form from IndexedDB
}