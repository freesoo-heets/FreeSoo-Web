const CACHE_VERSION = 'v3';
const STATIC_CACHE = `freesoo-static-${CACHE_VERSION}`;
const DATA_CACHE = `freesoo-data-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

// 설치: 정적 자산만 미리 캐시
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );

  // 새 서비스워커를 가능한 빨리 활성화
  self.skipWaiting();
});

// 활성화: 예전 캐시 삭제 + 현재 열린 페이지 즉시 제어
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== DATA_CACHE) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 요청 처리
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // GET만 처리
  if (req.method !== 'GET') return;

  // HTML 문서: network-first
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(networkFirst(req, STATIC_CACHE));
    return;
  }

  // 공지 데이터 JSON: network-first
  if (url.pathname.endsWith('/notices.json')) {
    event.respondWith(networkFirst(req, DATA_CACHE));
    return;
  }

  // 아이콘/이미지: cache-first
  if (
    req.destination === 'image' ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // 그 외: 그냥 네트워크
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  cache.put(request, fresh.clone());
  return fresh;
}
