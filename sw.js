const CACHE_NAME = 'hashludo-v3';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/responsive.css',
  './js/config.js',
  './js/utils.js',
  './js/app.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets');
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy: always try fresh content, fallback to cache offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Update cache with fresh response
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('./index.html');
        });
      })
  );
});
