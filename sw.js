// LoveLore Service Worker
const CACHE_NAME = 'lovelore-v2';

const LOCAL_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/utils.js',
  '/js/crypto.js',
  '/js/db.js',
  '/js/firebase-config.js',
  '/js/sync.js',
  '/js/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Install - pre-cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(LOCAL_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      );
    })
  );
  self.clients.claim();
});

// Fetch - cache-first for local, network-first for CDN, skip Firebase
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip Firebase/API calls
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    return;
  }

  // Navigation requests → index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(r => r || fetch(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
