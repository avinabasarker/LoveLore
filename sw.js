/* ============================================ */
/* LoveLore — Service Worker                    */
/* Offline caching for PWA                      */
/* ============================================ */

const CACHE_NAME = 'lovelore-v1';

const ASSETS_TO_CACHE = [
  '/relationship-wiki/',
  '/relationship-wiki/index.html',
  '/relationship-wiki/css/style.css',
  '/relationship-wiki/js/utils.js',
  '/relationship-wiki/js/crypto.js',
  '/relationship-wiki/js/db.js',
  '/relationship-wiki/js/firebase-config.js',
  '/relationship-wiki/js/sync.js',
  '/relationship-wiki/js/app.js',
  '/relationship-wiki/manifest.json'
];

const CDN_TO_CACHE = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// ---- Install: Cache all assets ----

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache local assets first
      cache.addAll(ASSETS_TO_CACHE).catch(() => {
        console.warn('Some local assets failed to cache');
      });
      // Cache CDN assets individually (one failure won't block others)
      CDN_TO_CACHE.forEach((url) => {
        cache.add(url).catch(() => {
          console.warn('Failed to cache:', url);
        });
      });
      return cache;
    })
  );
  self.skipWaiting();
});

// ---- Activate: Clean old caches ----

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ---- Fetch: Serve from cache, fall back to network ----

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Firebase and chrome-extension requests
  const url = new URL(event.request.url);
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis') ||
      url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Cache successful responses for future offline use
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/relationship-wiki/index.html');
        }
      });
    })
  );
});
