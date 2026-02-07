// Service Worker for Hawaii Sports Center
// Version 4 - Offline score submission queue

const CACHE_VERSION = 'v4'
const STATIC_CACHE = `static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`

// Assets to pre-cache for offline support
const PRECACHE_ASSETS = [
  '/offline',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/apple-touch-icon.png',
]

// Install - Pre-cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v3')

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching critical assets')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Pre-cache failed:', err)
        return self.skipWaiting()
      })
  )
})

// Activate - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v3')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch - Smart caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Never cache these - let browser handle normally
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/monitoring') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('sentry') ||
    url.hostname.includes('vercel-insights') ||
    url.hostname.includes('va.vercel-scripts')
  ) {
    return
  }

  // Navigation requests (HTML pages) - Network first, offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline').then((cached) => {
            return cached || new Response(
              '<html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            )
          })
        })
    )
    return
  }

  // Static assets (fonts, images) - Cache first, network fallback
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/) ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) {
            return cached
          }
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const clone = response.clone()
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(event.request, clone)
                })
              }
              return response
            })
        })
    )
    return
  }

  // Next.js chunks - Stale while revalidate
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          const fetchPromise = fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const clone = response.clone()
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(event.request, clone)
                })
              }
              return response
            })
            .catch(() => cached)

          return cached || fetchPromise
        })
    )
    return
  }

  // Everything else - Network first
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received')

  let data = {
    title: 'Hawaii Sports Center',
    body: 'Score update!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'score-update',
    data: {}
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        tag: payload.tag || data.tag,
        data: payload.data || {}
      }
    } catch (e) {
      console.error('[SW] Error parsing push data:', e)
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Game' },
      { action: 'close', title: 'Dismiss' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked')

  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const gameId = event.notification.data?.gameId
  const url = gameId ? `/game/${gameId}` : '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
      })
  )
})

// Background sync for offline score submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-submissions') {
    event.waitUntil(
      syncPendingSubmissions()
    )
  }
})

// Sync pending submissions by notifying the main app
async function syncPendingSubmissions() {
  console.log('[SW] Syncing pending submissions...')

  // Notify all clients to perform the sync
  // (The actual sync happens in the main app where we have auth context)
  const clients = await self.clients.matchAll({ type: 'window' })

  for (const client of clients) {
    client.postMessage({
      type: 'SYNC_SUBMISSIONS',
      timestamp: Date.now()
    })
  }

  // Also show a notification if there are pending submissions
  try {
    const db = await openIndexedDB()
    const count = await getPendingCount(db)

    if (count > 0) {
      console.log(`[SW] Found ${count} pending submissions to sync`)

      // Notify the user
      await self.registration.showNotification('Hawaii Sports Center', {
        body: `Syncing ${count} pending score${count > 1 ? 's' : ''}...`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'sync-progress',
        silent: true
      })
    }
  } catch (err) {
    console.warn('[SW] Error checking pending submissions:', err)
  }
}

// IndexedDB helpers for the service worker
const DB_NAME = 'hawaiisports-offline'
const DB_VERSION = 1
const STORE_NAME = 'pending-submissions'

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

function getPendingCount(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.count()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Periodic background sync (future enhancement)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag)

  if (event.tag === 'refresh-scores') {
    // Future: Periodically fetch latest scores
  }
})
