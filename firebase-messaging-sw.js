importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC7QzQTYMSGRV_nraJBneBqDqYGhugF0Pw",
  authDomain: "fast-937c9.firebaseapp.com",
  projectId: "fast-937c9",
  storageBucket: "fast-937c9.firebasestorage.app",
  messagingSenderId: "221388561840",
  appId: "1:221388561840:web:ec9d75183ddd7d44be0a75",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    "عالسريع";

const options = {
  body: payload?.notification?.body || "",

  icon: "/logo-s.png",
  badge: "/logo-s.png",

  requireInteraction: true
};

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  const targetUrl =
    event.notification?.data?.link ||
    self.location.origin;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {

      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});