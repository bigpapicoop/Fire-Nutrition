// Service worker: lets the installed app open and work with no internet connection.
// Bump VERSION when you change this file or the icons/logo; app code updates are picked up automatically.
const VERSION = 'v3'
const CACHE = `cookbook-${VERSION}`
const BASE = new URL('./', self.registration.scope).href
const INDEX = new URL('index.html', BASE).href

const STATIC = ['', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-64.png', 'logo-mark.png'].map(
  (p) => new URL(p, BASE).href,
)

/** Cache the page plus the JS/CSS files it links to, so the very first install already works offline. */
async function precache() {
  const cache = await caches.open(CACHE)
  await cache.addAll(STATIC)
  const html = await (await fetch(INDEX, { cache: 'no-cache' })).text()
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((m) => new URL(m[1], INDEX).href)
  await cache.addAll(assets)
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
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
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return
  // The app's "is there a new version?" check must always reach the server, never the cache.
  if (url.searchParams.has('check')) return

  // Pages: try the network first so updates show up, fall back to the cached copy offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(INDEX, copy))
          return res
        })
        .catch(() => caches.match(INDEX)),
    )
    return
  }

  // Everything else (hashed JS/CSS, icons): serve from cache, fetch and store anything new.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        }),
    ),
  )
})
