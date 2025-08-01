/**
 * Boreal Financial PWA Service Worker
 * Handles offline functionality, caching, push notifications, and background sync
 */

const CACHE_NAME = 'boreal-client-cache-v1';
const STATIC_CACHE_NAME = 'boreal-static-v1';
const DYNAMIC_CACHE_NAME = 'boreal-dynamic-v1';
const OFFLINE_URL = '/offline';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  OFFLINE_URL,
  '/step1-business-details',
  '/step2-product-selection',
  '/step3-financial-details',
  '/step4-personal-information',
  '/step5-document-upload',
  '/step6-signature',
  '/step7-confirmation',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
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

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    console.log('[SW] Push event but no data');
    return;
  }
  
  try {
    const payload = event.data.json();
    console.log('[SW] Push payload:', payload);
    
    const notificationOptions = {
      body: payload.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: payload.type || 'general',
      data: {
        url: payload.url || '/',
        type: payload.type || 'general',
        ...payload.data
      },
      requireInteraction: payload.type === 'document-required' || payload.type === 'agent-response',
      actions: []
    };
    
    // Add actions based on notification type
    if (payload.type === 'document-required') {
      notificationOptions.actions = [
        { action: 'upload', title: 'Upload Document' },
        { action: 'dismiss', title: 'Later' }
      ];
    } else if (payload.type === 'agent-response') {
      notificationOptions.actions = [
        { action: 'reply', title: 'Reply' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
    }
    
    event.waitUntil(
      self.registration.showNotification(
        payload.title || 'Boreal Financial',
        notificationOptions
      )
    );
  } catch (error) {
    console.error('[SW] Error processing push notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Boreal Financial', {
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        tag: 'fallback'
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  let targetUrl = notificationData.url || '/';
  
  // Handle action clicks
  if (event.action) {
    console.log('[SW] Notification action clicked:', event.action);
    
    switch (event.action) {
      case 'upload':
        targetUrl = '/step5-document-upload';
        break;
      case 'reply':
        targetUrl = '/chat';
        break;
      case 'dismiss':
        return; // Don't open anything
    }
  }
  
  // Open or focus the client
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(targetUrl.replace('/', ''))) {
          return client.focus();
        }
      }
      
      // Check if there's any client open
      if (clientList.length > 0) {
        const client = clientList[0];
        client.navigate?.(targetUrl);
        return client.focus();
      }
      
      // Open new window
      return clients.openWindow(targetUrl);
    })
  );
});

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
  
  const data = event.data?.json() || {};
  const title = data.title || 'Boreal Client Notification';
  const options = {
    body: data.body || 'Update on your application',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
    tag: data.tag || 'client-alert',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  // Customize notification based on type
  if (data.type === 'document-required') {
    options.body = `Please upload: ${data.documentType}`;
    options.actions[0].action = 'upload-document';
    options.actions[0].title = 'Upload Now';
    options.data.url = '/step5-document-upload';
  } else if (data.type === 'agent-response') {
    options.body = 'Support agent has responded to your message';
    options.actions[0].action = 'open-chat';
    options.actions[0].title = 'View Message';
    options.data.url = '/?chat=open';
  } else if (data.type === 'application-update') {
    options.body = `Application status: ${data.status}`;
    options.actions[0].action = 'view-status';
    options.actions[0].title = 'View Details';
    options.data.url = '/application-status';
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks  
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Open new window with notification URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data.url);
      }
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