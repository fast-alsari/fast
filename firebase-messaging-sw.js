importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC7QTYMSGRV_nraJBneBqDqYGhugF0Pw",
  authDomain: "fast-937c9.firebaseapp.com",
  projectId: "fast-937c9",
  storageBucket: "fast-937c9.firebasestorage.app",
  messagingSenderId: "221388561840",
  appId: "1:221388561840:web:ec9d75183ddd7d44be0a75"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || payload?.data?.title || "إشعار جديد";
  const body = payload?.notification?.body || payload?.data?.body || "";
  const icon = payload?.notification?.icon || "/Logo.png";
  const data = payload?.data || {};

  self.registration.showNotification(title, {
    body,
    icon,
    badge: icon,
    data,
    vibrate: [100, 50, 100]
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification?.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
