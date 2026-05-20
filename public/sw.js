const CACHE_NAME = 'hydroalert-v1';

const PRECACHE_URLS = ['/', '/index.html', '/manifest.json'];

const FIREBASE_HOSTS = [
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'firebaseapp.com',
  'googleapis.com',
  'gstatic.com',
  'google.com',
  'accounts.google.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'apis.google.com',
];

const AUTH_HOSTS = [
  'accounts.google.com',
  'securetoken.googleapis.com',
  'identitytoolkit.googleapis.com',
];

const STATIC_ASSET_PATTERN = /\.(js|css|woff2?|ttf|eot|png|jpg|jpeg|gif|svg|ico|webp)$/i;

function isFirebaseRequest(url) {
  return FIREBASE_HOSTS.some(
    (host) => url.hostname === host || url.hostname.endsWith('.' + host)
  );
}

function isAuthRequest(url) {
  return AUTH_HOSTS.some(
    (host) => url.hostname === host || url.hostname.endsWith('.' + host)
  );
}

function isStaticAsset(url) {
  if (url.origin !== self.location.origin) {
    return false;
  }
  return (
    STATIC_ASSET_PATTERN.test(url.pathname) ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/')
  );
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Never intercept Google OAuth / Firebase Auth — required for signInWithPopup
  if (isAuthRequest(url)) {
    return;
  }

  if (isFirebaseRequest(url)) {
    event.respondWith(networkFirst(request, url));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isNavigationRequest(request) && url.origin === self.location.origin) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html').then((cached) => cached || caches.match('/'))
      )
    );
    return;
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match('/');
  }
}

async function networkFirst(request, url) {
  try {
    const response = await fetch(request);
    if (response.ok && !isAuthRequest(url) && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw new Error('Network unavailable and no cache for: ' + request.url);
  }
}
