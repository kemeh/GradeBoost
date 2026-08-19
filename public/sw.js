// Edulpha Progressive Web App - Service Worker for Offline Study Materials
// Specially engineered for 'Practice' and 'Daily Drill' offline resilience

const CACHE_VERSION = 'v1.2.0';
const CACHE_STATIC_NAME = `edulpha-static-${CACHE_VERSION}`;
const CACHE_PRACTICE_NAME = `edulpha-practice-${CACHE_VERSION}`;
const CACHE_DRILLS_NAME = `edulpha-drills-${CACHE_VERSION}`;
const CACHE_RUNTIME_NAME = `edulpha-runtime-${CACHE_VERSION}`;

// Core static assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/edulpha-logo.png',
  '/logo.svg',
  '/logo-white.svg',
  '/icon.png',
  '/favicon.ico',
  '/practice',
  '/daily-drill',
  '/dashboard'
];

// Install event - precache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell & offline study routes...');
        return cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { cache: 'reload' })))
          .catch((err) => {
            console.warn('[Service Worker] Non-fatal precache warning:', err);
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up previous cache versions
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_STATIC_NAME, CACHE_PRACTICE_NAME, CACHE_DRILLS_NAME, CACHE_RUNTIME_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[Service Worker] Deleting obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - custom caching strategy for Practice, Drills, and Static Resources
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome extension / unsupported schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (SPA pages like /practice, /daily-drill, /dashboard)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the latest successful navigation HTML in static cache
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_STATIC_NAME).then((cache) => cache.put('/', responseClone));
          }
          return response;
        })
        .catch(async () => {
          // If offline or network fails, serve cached index.html
          console.log('[Service Worker] Offline navigation fallback for:', url.pathname);
          const cachedResponse = await caches.match(request) || await caches.match('/index.html') || await caches.match('/');
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            '<html><head><meta charset="utf-8"><title>Edulpha Offline</title></head><body style="font-family:sans-serif;text-align:center;padding:40px;background:#0f172a;color:#fff;"><h1>Edulpha Offline Mode</h1><p>You are currently offline. Please open your downloaded Practice Papers or Daily Drills.</p><a href="/practice" style="color:#818cf8;font-weight:bold;">Go to Practice</a></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 2. Practice & Daily Drill assets, PDFs, and media downloads
  const isPracticeOrDrillAsset = 
    url.pathname.includes('/practice') || 
    url.pathname.includes('/daily-drill') ||
    url.pathname.includes('/exam_questions') ||
    url.pathname.includes('/questionPapers') ||
    url.pathname.endsWith('.pdf') ||
    url.hostname.includes('firebasestorage.googleapis.com') ||
    url.hostname.includes('storage.googleapis.com');

  if (isPracticeOrDrillAsset) {
    const targetCache = url.pathname.includes('drill') ? CACHE_DRILLS_NAME : CACHE_PRACTICE_NAME;
    
    event.respondWith(
      caches.open(targetCache).then(async (cache) => {
        // Cache-First with background revalidation for study assets
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          // Fetch updated version in background if online
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
            })
            .catch(() => { /* Silent in offline */ });
          return cachedResponse;
        }

        // Otherwise fetch from network and cache
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(async () => {
            // Check fallback across all caches
            const fallback = await caches.match(request);
            if (fallback) return fallback;
            return new Response(JSON.stringify({ offline: true, error: 'Asset not cached for offline use.' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
      })
    );
    return;
  }

  // 3. Static assets, fonts, icons, JS chunks, and images (Cache First, Network Fallback)
  const isStaticAsset = 
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2|woff|ttf|ico)$/) ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_STATIC_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return empty or dummy placeholder if offline and not cached
            return new Response('', { status: 408 });
          });
      })
    );
    return;
  }

  // 4. Default strategy: Network first with Cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_RUNTIME_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ offline: true, message: 'Network unavailable.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
  );
});

// Handle custom messages from the client application
self.addEventListener('message', async (event) => {
  const { data } = event;
  if (!data || !data.type) return;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Explicit caching of Practice Paper URLs & Assets
  if (data.type === 'CACHE_PRACTICE_URLS' && Array.isArray(data.urls)) {
    try {
      const cache = await caches.open(CACHE_PRACTICE_NAME);
      await Promise.all(
        data.urls.map(async (url) => {
          try {
            const req = new Request(url, { mode: 'cors' });
            const res = await fetch(req);
            if (res.status === 200) {
              await cache.put(req, res);
            }
          } catch (e) {
            console.warn('[Service Worker] Failed to cache URL:', url, e);
          }
        })
      );
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true, count: data.urls.length });
      }
    } catch (err) {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: false, error: err.message });
      }
    }
  }

  // Explicit caching of Daily Drill URLs & Assets
  if (data.type === 'CACHE_DRILL_URLS' && Array.isArray(data.urls)) {
    try {
      const cache = await caches.open(CACHE_DRILLS_NAME);
      await Promise.all(
        data.urls.map(async (url) => {
          try {
            const req = new Request(url, { mode: 'cors' });
            const res = await fetch(req);
            if (res.status === 200) {
              await cache.put(req, res);
            }
          } catch (e) {
            console.warn('[Service Worker] Failed to cache drill URL:', url, e);
          }
        })
      );
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true, count: data.urls.length });
      }
    } catch (err) {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: false, error: err.message });
      }
    }
  }

  // Get Cache Status & Storage Info
  if (data.type === 'GET_CACHE_INFO') {
    try {
      const practiceCache = await caches.open(CACHE_PRACTICE_NAME);
      const drillCache = await caches.open(CACHE_DRILLS_NAME);
      const practiceKeys = await practiceCache.keys();
      const drillKeys = await drillCache.keys();

      let storageEstimate = { quota: 0, usage: 0 };
      if (navigator.storage && navigator.storage.estimate) {
        storageEstimate = await navigator.storage.estimate();
      }

      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          success: true,
          practiceCachedCount: practiceKeys.length,
          drillCachedCount: drillKeys.length,
          storageEstimate,
          version: CACHE_VERSION
        });
      }
    } catch (err) {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: false, error: err.message });
      }
    }
  }

  // Clear Practice & Drill Caches
  if (data.type === 'CLEAR_OFFLINE_STUDY_CACHE') {
    try {
      await caches.delete(CACHE_PRACTICE_NAME);
      await caches.delete(CACHE_DRILLS_NAME);
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    } catch (err) {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: false, error: err.message });
      }
    }
  }
});
