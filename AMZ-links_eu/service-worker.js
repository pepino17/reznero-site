const CACHE_NAME = 'amazon-affiliate-v1';
const ASSETS_TO_CACHE = [
  '/AMZ-links_eu/index.html',
  '/AMZ-links_eu/category.html',
  '/assets/css/style.css',
  '/assets/img/Logo-Pagina-web.png',
  '/assets/img/icon-192x192.png',
  '/assets/img/icon-512x512.png',
  '/assets/img/facebook.svg',
  '/assets/img/instagram.svg',
  '/assets/img/tiktok.svg',
  '/assets/img/youtube.svg'
];

// No cachear el archivo de productos
const NO_CACHE_FILES = [
  '/AMZ-links_eu/data/products_eu.json'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Si es el archivo de productos, siempre ir a la red y no cachear
  if (NO_CACHE_FILES.some(path => requestUrl.pathname.endsWith(path))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // No almacenar en caché
          return response;
        })
        .catch(() => {
          // Si falla, intentar servir desde la caché
          return caches.match(event.request);
        })
    );
    return;
  }

  // Para otros recursos, usar la estrategia cache-first
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        // Make network request
        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
