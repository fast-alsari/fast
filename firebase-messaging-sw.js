importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC7QzQTYMSGRV_nraJBneBqDqYGhugF0Pw",
  authDomain: "fast-937c9.firebaseapp.com",
  projectId: "fast-937c9",
  storageBucket: "fast-937c9.firebasestorage.app",
  messagingSenderId: "221388561840",
  appId: "1:221388561840:web:ec9d75183ddd7d44be0a75"
});

const messaging = firebase.messaging();

/* إشعارات الخلفية */
messaging.onBackgroundMessage((payload) => {
  console.log("Background Message:", payload);

  const title =
    payload.notification?.title ||
    payload.data?.title ||
    "عالسريع";

  const options = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: payload.data || {},
    tag: payload.data?.orderId || "fast-order"
  };

  self.registration.showNotification(title, options);
});

/* فتح التطبيق عند الضغط على الإشعار */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const orderId = event.notification.data?.orderId || "";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {

      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();

          if (orderId) {
            client.postMessage({
              type: "OPEN_ORDER",
              orderId
            });
          }

          return;
        }
      }

      return clients.openWindow("/");
    })
  );
});

/* تحديث Service Worker */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
