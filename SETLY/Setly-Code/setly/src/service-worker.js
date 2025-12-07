// Advanced PWA Service Worker with intelligent caching strategies
const CACHE_VERSION = 'setly-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Static assets to precache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/setly-logo.svg',
  '/assets/icon-192.svg',
  '/assets/icon-512.svg',
  '/assets/favicon-32.png',
  '/assets/favicon-16.png'
];

// Cache size limits
const MAX_DYNAMIC_ITEMS = 50;
const MAX_IMAGE_ITEMS = 100;

// Helper: limit cache size
const limitCacheSize = (cacheName, maxItems) => {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxItems));
      }
    });
  });
};

// Install: precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => console.warn('[SW] Precache failed:', err))
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE)
          .map(key => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  
  return self.clients.claim();
});

// Fetch: intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip cross-origin requests (except fonts/images)
  if (url.origin !== location.origin && !request.url.match(/\.(woff2?|ttf|eot|jpg|jpeg|png|gif|svg|webp|avif)$/)) {
    return;
  }
  
  // Strategy 1: Navigation requests - Network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful navigation responses
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clonedResponse));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache, then to offline page
          return caches.match(request)
            .then(cached => cached || caches.match('/index.html'))
            .catch(() => new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            }));
        })
    );
    return;
  }
  
  // Strategy 2: Images - Cache first, network fallback
  if (request.destination === 'image' || request.url.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          
          return fetch(request)
            .then(response => {
              if (response.ok) {
                const clonedResponse = response.clone();
                caches.open(IMAGE_CACHE).then(cache => {
                  cache.put(request, clonedResponse);
                  limitCacheSize(IMAGE_CACHE, MAX_IMAGE_ITEMS);
                });
              }
              return response;
            })
            .catch(() => {
              // Return placeholder or skip
              return new Response('', { status: 404, statusText: 'Image not found' });
            });
        })
    );
    return;
  }
  
  // Strategy 3: Fonts & static assets - Cache first
  if (request.url.match(/\.(woff2?|ttf|eot)$/) || request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request).then(response => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, clonedResponse));
          }
          return response;
        }))
    );
    return;
  }
  
  // Strategy 4: API requests - Network first, short-lived cache fallback
  if (request.url.includes('/api/') || request.url.includes('/v1/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok && request.method === 'GET') {
            const clonedResponse = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, clonedResponse);
              // Cache API responses for 5 minutes only
              setTimeout(() => cache.delete(request), 5 * 60 * 1000);
              limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
            });
          }
          return response;
        })
        .catch(() => caches.match(request)) // Use stale data if offline
    );
    return;
  }
  
  // Strategy 5: Everything else - Network first
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, clonedResponse);
            limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background sync (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  // Future: handle offline form submissions, message queue, etc.
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event.data?.text());
  // Future: handle real-time notifications
});

console.log('[SW] Service worker loaded and ready');
