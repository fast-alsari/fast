/* notifications.js */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7QTYMSGRV_nraJBneBqDqYGhugF0Pw",
  authDomain: "fast-937c9.firebaseapp.com",
  projectId: "fast-937c9",
  storageBucket: "fast-937c9.firebasestorage.app",
  messagingSenderId: "221388561840",
  appId: "1:221388561840:web:ec9d75183ddd7d44be0a75",
  databaseURL: "https://fast-937c9-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ضع رابط Cloudflare Worker / webhook هنا */
const NOTIFICATION_WEBHOOK_URL = "PUT_YOUR_WORKER_URL_HERE";

function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getMyFcmToken() {
  const user = getUserFromStorage();
  return user?.fcmToken || localStorage.getItem("androidFcmToken") || "";
}

function uniqueTokens(tokens) {
  return [...new Set((tokens || []).filter(Boolean))];
}

async function getTokenAt(path) {
  try {
    const snap = await get(ref(db, path));
    if (!snap.exists()) return "";
    const value = snap.val();
    return value?.fcmToken || "";
  } catch (error) {
    console.log("getTokenAt error:", error);
    return "";
  }
}

async function getCustomerToken(order) {
  if (order?.customerToken) return order.customerToken;
  if (order?.customerId) return await getTokenAt(`customers/${order.customerId}`);
  return getMyFcmToken();
}

async function getDriverToken(order) {
  if (order?.driverToken) return order.driverToken;
  if (order?.driverId) return await getTokenAt(`drivers/${order.driverId}`);
  return "";
}

async function getStoreTokensFromOrder(order) {
  const tokens = [];

  if (Array.isArray(order?.storeTokens)) {
    tokens.push(...order.storeTokens);
  }

  if (Array.isArray(order?.storesData)) {
    tokens.push(...order.storesData.map((store) => store?.storeToken));
  }

  if (order?.storeToken) {
    tokens.push(order.storeToken);
  }

  if (order?.storeId) {
    const one = await getTokenAt(`stores/${order.storeId}`);
    if (one) tokens.push(one);
  }

  return uniqueTokens(tokens);
}

async function getActiveDriverTokens() {
  try {
    const snap = await get(ref(db, "drivers"));
    if (!snap.exists()) return [];
    return uniqueTokens(
      Object.values(snap.val())
        .filter((driver) => (driver.status === "active" || driver.status === "approved") && driver.fcmToken)
        .map((driver) => driver.fcmToken)
    );
  } catch (error) {
    console.log("getActiveDriverTokens error:", error);
    return [];
  }
}

async function getActiveTaxiTokens() {
  try {
    const snap = await get(ref(db, "taxis"));
    if (!snap.exists()) return [];
    return uniqueTokens(
      Object.values(snap.val())
        .filter((taxi) => (taxi.status === "active" || taxi.status === "approved") && taxi.fcmToken)
        .map((taxi) => taxi.fcmToken)
    );
  } catch (error) {
    console.log("getActiveTaxiTokens error:", error);
    return [];
  }
}

async function sendNotificationToToken(token, title, body, data = {}) {
  if (!NOTIFICATION_WEBHOOK_URL || !token) return false;

  try {
    await fetch(NOTIFICATION_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, title, body, data })
    });
    return true;
  } catch (error) {
    console.log("notification error:", error);
    return false;
  }
}

async function sendNotificationToMany(tokens, title, body, data = {}) {
  const unique = uniqueTokens(tokens);
  if (!unique.length) return [];

  return Promise.allSettled(
    unique.map((token) => sendNotificationToToken(token, title, body, data))
  );
}

async function notifyNewDeliveryOrder(orderData) {
  const storeTokens = await getStoreTokensFromOrder(orderData);
  const driverTokens = await getActiveDriverTokens();
  const customerToken = await getCustomerToken(orderData);

  await Promise.allSettled([
    sendNotificationToMany(
      storeTokens,
      `طلب جديد من ${orderData.customerName || "زبون"}`,
      "يوجد طلب جديد بانتظار قبول سائق توصيل",
      { orderId: orderData.id, status: orderData.status, type: "delivery" }
    ),
    sendNotificationToMany(
      driverTokens,
      `طلب جديد من ${orderData.customerName || "زبون"}`,
      `يوجد طلب جديد من ${orderData.storeName || "متجر"} بانتظار القبول`,
      { orderId: orderData.id, status: orderData.status, type: "delivery" }
    ),
    sendNotificationToToken(
      customerToken,
      "تم استلام طلبك",
      "جاري البحث عن سائق توصيل مناسب",
      { orderId: orderData.id, status: orderData.status, type: "delivery" }
    )
  ]);
}

async function notifyTaxiOrder(orderData) {
  const taxiTokens = await getActiveTaxiTokens();
  const customerToken = await getCustomerToken(orderData);

  await Promise.allSettled([
    sendNotificationToMany(
      taxiTokens,
      "طلب تكسي جديد",
      `هناك شخص طلب رحلة من ${orderData.customerName || "زبون"}`,
      { orderId: orderData.id, status: orderData.status, type: "taxi" }
    ),
    sendNotificationToToken(
      customerToken,
      "تم استلام طلب التكسي",
      "جاري البحث عن سائق تكسي مناسب",
      { orderId: orderData.id, status: orderData.status, type: "taxi" }
    )
  ]);
}

async function notifyDeliveryStatusChange(order, prevStatus = "") {
  if (!order) return;

  const status = String(order.status || "").toLowerCase();
  const customerToken = await getCustomerToken(order);
  const storeTokens = await getStoreTokensFromOrder(order);
  const driverToken = await getDriverToken(order);

  const data = {
    orderId: order.id || "",
    status,
    prevStatus,
    type: "delivery",
    customerId: order.customerId || "",
    storeId: order.storeId || "",
    driverId: order.driverId || ""
  };

  if (status === "accepted" || status === "driver_accepted") {
    await Promise.allSettled([
      sendNotificationToToken(
        customerToken,
        "تم قبول طلبك",
        "سوف يتواصل معك السائق لتأكيد الطلب عبر الواتساب",
        data
      ),
      sendNotificationToMany(
        storeTokens,
        "تم قبول طلب التوصيل",
        "سيأتيك السائق، جهز الطلب",
        data
      ),
      driverToken
        ? sendNotificationToToken(
            driverToken,
            "تم تسجيل قبول الطلب",
            "ابدأ التوصيل الآن",
            data
          )
        : Promise.resolve()
    ]);
    return;
  }

  if (status === "going_to_store" || status === "driver_to_store") {
    await sendNotificationToToken(
      customerToken,
      "السائق متجه إلى المتجر",
      "جاري الوصول إلى المتجر لاستلام الطلب",
      data
    );
    return;
  }

  if (status === "preparing_order" || status === "driver_arrived_store") {
    await Promise.allSettled([
      sendNotificationToToken(
        customerToken,
        "السائق وصل المتجر",
        "المتجر يقوم الآن بتجهيز الطلب",
        data
      ),
      sendNotificationToMany(
        storeTokens,
        "السائق وصل المتجر",
        "يرجى تجهيز الطلب",
        data
      )
    ]);
    return;
  }

  if (status === "picked_up") {
    await Promise.allSettled([
      sendNotificationToToken(
        customerToken,
        "تم استلام الطلب",
        "السائق استلم الطلب وهو في طريقه إليك",
        data
      ),
      sendNotificationToMany(
        storeTokens,
        "تم استلام الطلب",
        "السائق استلم الطلب وغادر المتجر",
        data
      )
    ]);
    return;
  }

  if (status === "on_the_way") {
    await sendNotificationToToken(
      customerToken,
      "السائق في الطريق إليك",
      "السائق استلم الطلب وهو متوجه إليك الآن",
      data
    );
    return;
  }

  if (status === "arrived" || status === "driver_arrived_customer") {
    await sendNotificationToToken(
      customerToken,
      "السائق وصل إليك",
      "يرجى الاستعداد لاستلام الطلب",
      data
    );
    return;
  }

  if (status === "delivered") {
    await Promise.allSettled([
      sendNotificationToToken(
        customerToken,
        "تم تسليم الطلب بنجاح",
        "شكراً لاستخدامك عالسريع",
        data
      ),
      sendNotificationToMany(
        storeTokens,
        "تم تسليم الطلب",
        "تم تسليم الطلب إلى الزبون",
        data
      )
    ]);
    return;
  }

  if (status === "delivery_problem" || status === "failed_no_driver") {
    await Promise.allSettled([
      sendNotificationToToken(
        customerToken,
        "توجد مشكلة في الطلب",
        "سيتم البحث عن سائق آخر",
        data
      ),
      sendNotificationToMany(
        storeTokens,
        "توجد مشكلة في الطلب",
        "سيتم متابعة الطلب",
        data
      )
    ]);
    return;
  }

  if (status === "cancelled_by_customer") {
    await Promise.allSettled([
      sendNotificationToToken(
        customerToken,
        "تم إلغاء الطلب",
        "تم إلغاء الطلب من قبلك",
        data
      ),
      sendNotificationToMany(
        storeTokens,
        "تم إلغاء الطلب",
        "تم إلغاء الطلب من قبل الزبون",
        data
      ),
      driverToken
        ? sendNotificationToToken(
            driverToken,
            "تم إلغاء الطلب",
            "تم إلغاء الطلب من قبل الزبون",
            data
          )
        : Promise.resolve()
    ]);
    return;
  }
}

async function notifyTaxiStatusChange(order, prevStatus = "") {
  if (!order) return;

  const status = String(order.status || "").toLowerCase();
  const customerToken = await getCustomerToken(order);
  const driverToken = await getDriverToken(order);

  const data = {
    orderId: order.id || "",
    status,
    prevStatus,
    type: "taxi",
    customerId: order.customerId || "",
    driverId: order.driverId || ""
  };

  if (status === "accepted" || status === "driver_accepted") {
    await Promise.allSettled([
      sendNotificationToToken(
        customerToken,
        "تم قبول رحلتك",
        "السائق سوف يتواصل معك لتأكيد الرحلة",
        data
      ),
      driverToken
        ? sendNotificationToToken(
            driverToken,
            "تم قبول الرحلة",
            "ابدأ بالتوجه إلى موقع الراكب",
            data
          )
        : Promise.resolve()
    ]);
    return;
  }

  if (status === "driver_arrived_pickup") {
    await sendNotificationToToken(
      customerToken,
      "السائق وصل لموقعك",
      "السائق وصل إلى نقطة الانطلاق",
      data
    );
    return;
  }

  if (status === "picked_up") {
    await sendNotificationToToken(
      customerToken,
      "تم بدء الرحلة",
      "السائق استلمك وهو في الطريق إلى الوجهة",
      data
    );
    return;
  }

  if (status === "arrived_destination") {
    await sendNotificationToToken(
      customerToken,
      "السائق وصل للوجهة",
      "تم الوصول إلى الوجهة المحددة",
      data
    );
    return;
  }

  if (status === "delivery_problem") {
    await sendNotificationToToken(
      customerToken,
      "توجد مشكلة",
      "سيتم البحث عن سائق آخر",
      data
    );
    return;
  }

  if (status === "driver_timeout") {
    await sendNotificationToToken(
      customerToken,
      "انتهى وقت الرحلة",
      "لم يتم العثور على سائق خلال الوقت المحدد",
      data
    );
    return;
  }

  if (status === "cancelled_by_customer") {
    await Promise.allSettled([
      sendNotificationToToken(
        customerToken,
        "تم إلغاء الرحلة",
        "تم إلغاء الرحلة من قبل الراكب",
        data
      ),
      driverToken
        ? sendNotificationToToken(
            driverToken,
            "تم إلغاء الرحلة",
            "تم إلغاء الرحلة من قبل الراكب",
            data
          )
        : Promise.resolve()
    ]);
  }
}

window.notifyNewDeliveryOrder = notifyNewDeliveryOrder;
window.notifyTaxiOrder = notifyTaxiOrder;
window.notifyDeliveryStatusChange = notifyDeliveryStatusChange;
window.notifyTaxiStatusChange = notifyTaxiStatusChange;
window.getMyFcmToken = getMyFcmToken;
window.getActiveDriverTokensFromNotifications = getActiveDriverTokens;
window.getActiveTaxiTokensFromNotifications = getActiveTaxiTokens;
