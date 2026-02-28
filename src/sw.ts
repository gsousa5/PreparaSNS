/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Workbox precache manifest (injected by vite-plugin-pwa with injectManifest strategy)
// @ts-ignore - This will be set by Workbox at build time
const precacheManifest = self.__WB_MANIFEST || [];

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push notification received but no data');
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (err) {
    console.error('Failed to parse push data:', err);
    notificationData = {
      title: 'PreparaSNS',
      body: event.data.text(),
      data: {}
    };
  }

  const options: NotificationOptions = {
    body: notificationData.body || 'Nova notificação',
    icon: '/logo-192.png',
    badge: '/logo-64.png',
    tag: notificationData.taskId || 'preparasns-notification',
    requireInteraction: true,
    data: notificationData.data || {},
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'PreparaSNS',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  if (action === 'dismiss') {
    notification.close();
    return;
  }

  // Close the notification
  notification.close();

  // Focus or open the app
  event.waitUntil(
    (async () => {
      // Find if app is already open
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          // App is open, focus it
          return client.focus();
        }
      }

      // App not open, open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })()
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      (async () => {
        try {
          // Fetch pending notifications from backend
          const response = await fetch('/api/notifications/pending');
          if (!response.ok) throw new Error('Failed to fetch pending notifications');

          const { notifications } = await response.json();

          // Show all pending notifications
          for (const notification of notifications) {
            await self.registration.showNotification(
              notification.title,
              {
                body: notification.body,
                icon: '/logo-192.png',
                badge: '/logo-64.png',
                tag: notification.taskId,
                requireInteraction: true,
                data: notification.data
              }
            );
          }
        } catch (err) {
          console.error('Background sync failed:', err);
        }
      })()
    );
  }
});

// Message listener for communication with clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_NOTIFICATION_STATUS') {
    event.ports[0].postMessage({
      isPushSupported: 'serviceWorker' in navigator && 'PushManager' in window,
      hasNotificationPermission: Notification.permission === 'granted'
    });
  }
});

// Precache manifest (will be injected by Workbox)
// The precache manifest is automatically injected by vite-plugin-pwa
// See vite.config.js for workbox configuration
