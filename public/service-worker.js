// Service Worker for handling push notifications
self.addEventListener('install', () => {
  console.log('[SW] Install event');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  self.clients.claim();

  // Subscribe to push notifications on activation
  event.waitUntil(
    self.registration.pushManager.getSubscription().then((subscription) => {
      if (subscription) {
        console.log('[SW] Already subscribed:', subscription.endpoint);
        return subscription;
      }

      // Not subscribed, create subscription
      return self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUgtiMm9lahLbiQa7vlS9V5ilOBXQjlvS2StdM3awVTj8NvtzijWStoRgKygTHzvDOAoxMMQgiglMpg8HE'
        ),
      }).then((subscription) => {
        console.log('[SW] Subscribed to push:', subscription.endpoint);
        // Send subscription to backend
        return fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        }).then(() => {
          console.log('[SW] Subscription sent to backend');
          return subscription;
        }).catch((error) => {
          console.error('[SW] Failed to send subscription:', error);
          return subscription;
        });
      }).catch((error) => {
        console.error('[SW] Push subscription failed:', error);
      });
    })
  );
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event.data);
  const data = event.data?.json() ?? {};
  const title = data.title || 'CodeRunner Notification';
  const options = {
    body: data.body,
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: 'coderunner-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options)
    .then(() => console.log('[SW] Notification shown'))
    .catch((error) => console.error('[SW] Failed to show notification:', error))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url === '/' && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

