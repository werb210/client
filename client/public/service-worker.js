/* eslint-disable no-restricted-globals */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

const DB_NAME = 'bf-offline';
const STORE = 'retry-queue';

// Configure your staff backend endpoint(s)
const STAFF_API = 'https://staff.boreal.financial/api';
const SYNC_ENDPOINT = '/offline/intake'; // change to your actual intake endpoint

// --- IndexedDB utilities (no external libs) ---
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbAdd(val) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).add(val);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  }));
}

function idbAll() {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const out = [];
    const req = store.openCursor();
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) { out.push({ key: cursor.key, value: cursor.value }); cursor.continue(); }
      else resolve(out);
    };
    req.onerror = () => reject(req.error);
  }));
}

function idbDelete(key) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  }));
}

// --- Local namespace handlers ---
async function handleQueue(event) {
  const body = await event.request.clone().json();
  await idbAdd(body);
  try { await self.registration.sync.register('bf-sync'); } catch (_) {}
  return new Response(JSON.stringify({ queued: true }), {
    status: 201, headers: { 'Content-Type': 'application/json' }
  });
}

async function runSync() {
  const items = await idbAll();
  const results = [];
  for (const { key, value } of items) {
    try {
      const res = await fetch(STAFF_API + SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(value),
      });
      if (res.ok) await idbDelete(key);
      results.push({ key, ok: res.ok });
    } catch (err) {
      results.push({ key, ok: false });
    }
  }
  return new Response(JSON.stringify({ synced: true, results }), {
    status: 200, headers: { 'Content-Type': 'application/json' }
  });
}

self.addEventListener('fetch', (event) => {
  const { pathname } = new URL(event.request.url);

  // Local-only endpoints — never forward to network; handle inside SW
  if (pathname === '/_pwa/queue' && event.request.method === 'POST') {
    event.respondWith(handleQueue(event)); return;
  }
  if (pathname === '/_pwa/sync' && event.request.method === 'POST') {
    event.respondWith(runSync()); return;
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'bf-sync') event.waitUntil(runSync());
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: 'You have a new notification from Boreal Financial',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'boreal-notification',
    renotify: true,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ],
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

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});