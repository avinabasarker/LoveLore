/* ============================================
   LoveLore Social — Service Worker v4
   Network-first for instant updates
   ============================================ */

const CACHE_NAME = 'lovelore-v9';
const RUNTIME_CACHE = 'lovelore-runtime-v9';

// Core app files to pre-cache on install
const APP_SHELL = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// External resources to cache on first use
const EXTERNAL_CACHE_HOSTS = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com',
    'www.gstatic.com'
];

// Install — pre-cache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL);
        }).catch(err => {
            console.warn('SW: Some assets failed to cache on install', err);
        })
    );
    self.skipWaiting();
});

// Activate — clean ALL old caches aggressively
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim()).then(() => {
            // Notify all clients that a new version is active
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
            });
        })
    );
});

// Fetch — network-first for app files, cache for external
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Firebase/API requests — network only (app handles offline via IndexedDB)
    if (url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('firebaseapp.com')) {
        return;
    }

    // App shell files — NETWORK-FIRST (always check for updates)
    if (event.request.url.startsWith(self.location.origin) &&
        (url.pathname.endsWith('.html') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.json') ||
         url.pathname.endsWith('.png'))) {
        event.respondWith(networkFirstWithUpdate(event.request));
        return;
    }

    // External resources (fonts, icons CDN) — stale-while-revalidate
    if (EXTERNAL_CACHE_HOSTS.some(host => url.hostname.includes(host))) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }

    // Everything else — network-first, fall back to cache
    event.respondWith(networkFirst(event.request));
});

// Network-first with background cache update: try network, fall back to cache
async function networkFirstWithUpdate(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (e) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
            return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
    }
}

// Stale-while-revalidate: return cache immediately, update in background
async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cached);

    return cached || fetchPromise;
}

// Network-first: try network, fall back to cache
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (e) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
            return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
    }
}
