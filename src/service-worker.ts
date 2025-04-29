/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

import { build, files, version } from "$service-worker";

// Define cache name and assets
const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

// Function to generate icon paths
function getIconPath(size: string) {
  return new URL(`/pwa-${size}.png`, self.location.origin).href;
}

// Define icons for notifications
const ICONS = {
  DEFAULT: getIconPath('192x192'),
  SMALL: getIconPath('64x64'),
  LARGE: getIconPath('512x512')
};

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event?.waitUntil(
    caches?.keys()?.then((keys) => {
      return Promise?.all(
        keys?.map((key) => caches?.delete(key))      // delete ALL caches
      );
    })?.then(() => self?.clients?.claim())
  );
});

// Fetch event: Serve cached assets or fetch from network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Push event: Handle incoming push notifications
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  let title = 'Stocknear';
  let body: string;
  let url = '/'; // Default URL

  try {
    const payload = event.data.text();
    
    try {
      const jsonData = JSON.parse(payload);
      if (jsonData.title) {
        title = jsonData.title;
        body = jsonData.body;
        url = jsonData.url || '/'; // Extract URL from payload
      } else {
        body = payload;
      }
    } catch {
      body = payload;
    }
  } catch {
    body = 'New notification';
  }

  const options: NotificationOptions = {
    body,
    icon: ICONS.DEFAULT,
    badge: ICONS.SMALL,
    timestamp: Date.now(),
    requireInteraction: true,
    tag: 'stocknear-notification',
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      suppressNotificationFrom: true, // Custom flag to indicate branding should be suppressed
      url: url // Store URL in notification data
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event: Handle user interaction with notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Get the URL from notification data or use default
  const urlPath = event.notification.data.url || '/';
  const urlToOpen = new URL(urlPath, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check for existing matching window
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message event: Handle messages from the main thread
self.addEventListener('message', (event) => {
  // Handle skip waiting
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Handle cache update
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE)
        .then((cache) => cache.addAll(event.data.payload))
        .catch((error) => console.error('Service worker: Cache update failed:', error))
    );
  }
});