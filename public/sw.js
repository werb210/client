/**
 * Boreal Financial PWA Service Worker
 * Handles offline functionality, caching, push notifications, and background sync
 */

const CACHE_NAME = 'boreal-financial-v1.0.0';
const STATIC_CACHE_NAME = 'boreal-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'boreal-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/step1-business-details',
  '/step2-product-selection',
  '/step3-financial-details',
  '/step4-personal-information',
  '/step5-document-upload',
  '/step6-signature',
  '/step7-confirmation',
  // Add critical CSS and JS files here
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /^\/api\/public\//,
  /^\/api\/health$/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets and pages
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request.clone());
    
    // Cache successful API responses for public endpoints
    if (networkResponse.ok && API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', url.pathname);
    
    // Try cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for failed API calls
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This request requires an internet connection',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network if not in cache
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Both cache and network failed for:', request.url);
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'form-submission') {
    event.waitUntil(syncFormSubmissions());
  }
  
  if (event.tag === 'document-upload') {
    event.waitUntil(syncDocumentUploads());
  }
});

// Sync form submissions from IndexedDB
async function syncFormSubmissions() {
  try {
    console.log('[SW] Syncing form submissions...');
    
    // Get pending submissions from IndexedDB
    const submissions = await getStoredSubmissions();
    
    for (const submission of submissions) {
      try {
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${submission.token}`
          },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          await removeStoredSubmission(submission.id);
          console.log('[SW] Form submission synced successfully');
          
          // Notify client about successful sync
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_SUCCESS',
                data: { submissionId: submission.id }
              });
            });
          });
        }
      } catch (error) {
        console.error('[SW] Failed to sync submission:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync document uploads from IndexedDB
async function syncDocumentUploads() {
  try {
    console.log('[SW] Syncing document uploads...');
    
    // Implementation for document upload sync
    // This would integrate with the existing upload queue system
    
  } catch (error) {
    console.error('[SW] Document sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let options = {
    body: 'You have a new message',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {},
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = data;
    
    // Customize notification based on type
    if (data.type === 'document-required') {
      options.body = `Please upload: ${data.documentType}`;
      options.actions[0].action = 'upload-document';
      options.actions[0].title = 'Upload Now';
    } else if (data.type === 'agent-response') {
      options.body = 'Support agent has responded to your message';
      options.actions[0].action = 'open-chat';
      options.actions[0].title = 'View Message';
    } else if (data.type === 'application-update') {
      options.body = `Application status: ${data.status}`;
      options.actions[0].action = 'view-status';
      options.actions[0].title = 'View Details';
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Boreal Financial', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(self.registration.scope)) {
          // Focus existing window and navigate
          client.focus();
          
          if (action === 'upload-document') {
            client.navigate('/step5-document-upload');
          } else if (action === 'open-chat') {
            client.postMessage({ type: 'OPEN_CHAT', data });
          } else if (action === 'view-status') {
            client.navigate('/application-status');
          } else {
            client.navigate('/');
          }
          
          return;
        }
      }
      
      // Open new window if not already open
      let url = '/';
      if (action === 'upload-document') {
        url = '/step5-document-upload';
      } else if (action === 'open-chat') {
        url = '/?chat=open';
      } else if (action === 'view-status') {
        url = '/application-status';
      }
      
      return self.clients.openWindow(url);
    })
  );
});

// Helper functions for IndexedDB operations
async function getStoredSubmissions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('boreal-offline-store', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['form-submissions'], 'readonly');
      const store = transaction.objectStore('form-submissions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function removeStoredSubmission(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('boreal-offline-store', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['form-submissions'], 'readwrite');
      const store = transaction.objectStore('form-submissions');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}