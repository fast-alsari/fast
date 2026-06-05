import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7QzQTYMSGRV_nraJBneBqDqYGhugF0Pw",
  authDomain: "fast-937c9.firebaseapp.com",
  databaseURL: "https://fast-937c9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fast-937c9",
  storageBucket: "fast-937c9.firebasestorage.app",
  messagingSenderId: "221388561840",
  appId: "1:221388561840:web:ec9d75183ddd7d44be0a75"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messaging = getMessaging(app);

async function initNotifications() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) return;

    const permission = await Notification.requestPermission();

    if (permission !== "granted") return;

    const token = await getToken(messaging, {
      vapidKey: "LJWkEXaWEy-jXmjLA0r76q26seV8V7oEfPQ7K71H8o8"
    });

    if (!token) return;

    if (user.type === "customer") {
      await set(ref(db, "customers/" + user.id + "/fcmToken"), token);
    }

    if (user.type === "driver") {
      await set(ref(db, "drivers/" + user.id + "/fcmToken"), token);
    }

    if (user.type === "store") {
      await set(ref(db, "stores/" + user.id + "/fcmToken"), token);
    }

    if (user.type === "taxi") {
      await set(ref(db, "taxis/" + user.id + "/fcmToken"), token);
    }

    onMessage(messaging, (payload) => {
      new Notification(
        payload.notification?.title || "عالسريع",
        {
          body: payload.notification?.body || "",
          icon: "ok.png"
        }
      );
    });

  } catch (error) {
    console.log(error);
  }
}

initNotifications();