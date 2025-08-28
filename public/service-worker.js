const CACHE_NAME = 'boreal-financial-v3';
const OFFLINE_URL = '/offline/index.html';

// Enhanced cache strategy for better PWA performance
const CACHE_URLS = [
  '/',
  '/offline/index.html',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/application/step-1',
  '/assets/index.js',
  '/assets/index.css'
];

// Background sync for offline application submissions
const BACKGROUND_SYNC_TAG = 'boreal-background-sync';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.action === 'open_chat' 
    ? '/chatbot-ai-test'
    : '/dashboard';

  event.waitUntil(
    clients.openWindow(url)
  );
});

// Background sync for offline submissions
self.addEventListener('sync', (event) => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(syncOfflineSubmissions());
  }
});

// Enhanced offline submission sync
async function syncOfflineSubmissions() {
  try {
    // Check indexedDB for pending submissions
    const db = await openDB();
    const pendingSubmissions = await getAllPendingSubmissions(db);
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/public/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          await removePendingSubmission(db, submission.id);
        }
      } catch (error) {
        // Will retry on next sync
      }
    }
  } catch (error) {
    // Background sync failed
  }
}

// IndexedDB helpers for offline submissions
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BorealOffline', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getAllPendingSubmissions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['submissions'], 'readonly');
    const store = transaction.objectStore('submissions');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

async function removePendingSubmission(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['submissions'], 'readwrite');
    const store = transaction.objectStore('submissions');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
