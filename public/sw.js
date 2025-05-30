// Minimal Service Worker
const CACHE_VERSION = 'v1';
const CACHE_NAME = `gold-admin-cache-${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        }),
      );
    }).then(() => self.clients.claim()),
  );
});

// Basic fetch handler (no caching logic as requested)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
