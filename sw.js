// Service Worker for Ship Rekt PWA
const CACHE_VERSION = '1.0.2';
const CACHE_NAME = `ship-rekt-v${CACHE_VERSION}-${Date.now()}`;
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first for main resources, cache first for assets
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetch event for', event.request.url);
  
  // For main page resources (HTML, JS, CSS), always check network first
  const isMainResource = event.request.url.includes('.html') || 
                         event.request.url.includes('.js') || 
                         event.request.url.includes('.css') ||
                         event.request.url.endsWith('/');
  
  if (isMainResource) {
    // Network first strategy for main resources
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If network request succeeds, cache the new version
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, fallback to cache
          console.log('Service Worker: Network failed, serving from cache', event.request.url);
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If no cache and network failed, serve index.html for navigation requests
              if (event.request.destination === 'document') {
                return caches.match('./index.html');
              }
            });
        })
    );
  } else {
    // Cache first strategy for assets (images, icons, etc.)
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            console.log('Service Worker: Serving asset from cache', event.request.url);
            return response;
          }
          
          console.log('Service Worker: Fetching asset from network', event.request.url);
          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
        })
        .catch(() => {
          console.log('Service Worker: Failed to fetch asset', event.request.url);
        })
    );
  }
});

// Background sync for when connectivity is restored
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return new Promise((resolve) => {
    console.log('Service Worker: Performing background sync');
    // Implement any background sync logic here
    resolve();
  });
}

// Push notification support
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');
  
  const options = {
    body: event.data ? event.data.text() : 'Ahoy! New treasure awaits in Ship Rekt!',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Set Sail',
        icon: './icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: './icons/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Ship Rekt', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});