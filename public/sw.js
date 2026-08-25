// OmniTools service worker — caches app shell + assets for offline/fast loads.
const CACHE = 'omnitools-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  // never cache the AI endpoint or cross-origin requests
  if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(req)
      const network = fetch(req)
        .then((res) => {
          if (res.ok && (url.pathname.startsWith('/assets/') || url.pathname === '/' || url.pathname.endsWith('.svg') || url.pathname.endsWith('.webmanifest'))) {
            cache.put(req, res.clone())
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })(),
  )
})
