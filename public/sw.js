// Service Worker for Hawaii Sports Center
// Version 2 - Fixed caching issues

const CACHE_VERSION = 'v2'

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed')
  // Skip waiting to activate immediately
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated')
  // Clear old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Handle fetch - NEVER cache HTML pages or API routes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Never intercept:
  // - API routes
  // - Navigation requests (HTML pages)
  // - Supabase requests
  // - Auth-related requests
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.hostname.includes('supabase') ||
    event.request.mode === 'navigate' ||
    event.request.headers.get('accept')?.includes('text/html')
  ) {
    // Let the browser handle these normally - no caching
    return
  }

  // For other requests (images, fonts, etc.), use network-first strategy
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    })
  )
})

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)

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
    actions: [
      { action: 'view', title: 'View Game' },
      { action: 'close', title: 'Dismiss' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event)

  event.notification.close()

  if (event.action === 'close') {
    return
  }

  // Get the game URL from notification data
  const gameId = event.notification.data?.gameId
  const url = gameId ? `/game/${gameId}` : '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        // Open new window if none exists
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
      })
  )
})
