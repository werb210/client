#!/bin/bash
set -e

echo "== Business Financing PWA Optimization Script =="
echo "Optimizing application for perfect performance..."

# Clean up unnecessary files
echo "1. Cleaning up unnecessary test files in public directory..."
cd public
rm -f test-*.js test-*.html test_*.html debug-*.js execute_*.js manual-*.js mobile-*.js upload-*.js
rm -f *-audit.js *-test-*.js accessibility-audit.js chat-client.js
rm -f analyze-*.md client-task-validation.html production_*.html pwa-test-direct.html real_documents_*.html
rm -f s3-test-browser.js service-worker-old.js
cd ..

echo "2. Optimizing service worker cache strategy..."
# Update service worker to be more efficient
cat > public/service-worker.js << 'EOF'
const CACHE_NAME = 'boreal-financial-v2';
const OFFLINE_URL = '/offline/index.html';

// Essential files for offline functionality
const CACHE_URLS = [
  '/',
  '/offline/index.html',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];

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
EOF

echo "3. Optimizing manifest.json..."
cat > public/manifest.json << 'EOF'
{
  "name": "Boreal Financial Client Portal",
  "short_name": "Boreal Financial",
  "description": "Business financing application portal with 41+ lenders",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0d9488",
  "orientation": "portrait-primary",
  "categories": ["finance", "business", "productivity"],
  "lang": "en",
  "icons": [
    {
      "src": "/icons/icon-72x72.svg",
      "sizes": "72x72",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.svg", 
      "sizes": "96x96",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.svg",
      "sizes": "128x128", 
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.svg",
      "sizes": "144x144",
      "type": "image/svg+xml", 
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.svg",
      "sizes": "152x152",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.svg",
      "sizes": "384x384",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Apply for Financing",
      "short_name": "Apply",
      "description": "Start a new financing application",
      "url": "/apply/step-1",
      "icons": [{ "src": "/icons/icon-192x192.svg", "sizes": "192x192" }]
    },
    {
      "name": "Dashboard",
      "short_name": "Dashboard", 
      "description": "View your application dashboard",
      "url": "/dashboard",
      "icons": [{ "src": "/icons/icon-192x192.svg", "sizes": "192x192" }]
    }
  ]
}
EOF

echo "4. Building optimized production bundle..."
npm run build > /dev/null 2>&1

echo "5. Checking final bundle size..."
echo "Bundle analysis:"
du -h dist/public/assets/*.js | sort -hr | head -10

echo ""
echo "== Optimization Complete =="
echo "✅ Removed unnecessary test files"
echo "✅ Optimized service worker for better caching"  
echo "✅ Enhanced PWA manifest with shortcuts"
echo "✅ Built optimized production bundle"
echo ""
echo "Application is now optimized for perfect performance!"