/* service-worker.js */

const CACHE_NAME = "alsaree-cache-v1";

const urlsToCache = [

"/",
"/index.html",
"/home.html",
"/asca.html",
"/cart.html",
"/talab.html",
"/driver.html",
"/driver-live.html",
"/driver-history.html",
"/taxie.html",
"/taxi-orders.html",
"/taxi-history.html",
"/taxi-account.html",
"/admin-orders.html",
"/admin-users.html",
"/admin-stores.html",
"/admin-drivers.html",
"/admin-taxis.html",
"/admin-statistics.html",
"/admin-notifications.html",
"/order-history.html",
"/favorite.html",
"/addresses.html",
"/offers.html",
"/search.html",

"/config.js",

"/manifest.json",

"/store.png",
"/product.png",
"/user.png",
"/driver.png",
"/taxi.png",
"/banner.png"

];

// ============================
// Install
// ============================

self.addEventListener(
"install",
(event)=>{

event.waitUntil(

caches.open(CACHE_NAME)
.then(cache=>{

return cache.addAll(
urlsToCache
);

})

);

self.skipWaiting();

}
);

// ============================
// Activate
// ============================

self.addEventListener(
"activate",
(event)=>{

event.waitUntil(

caches.keys()
.then(keys=>{

return Promise.all(

keys.map(key=>{

if(key !== CACHE_NAME){

return caches.delete(key);

}

})

);

})

);

self.clients.claim();

}
);

// ============================
// Fetch
// ============================

self.addEventListener(
"fetch",
(event)=>{

event.respondWith(

caches.match(event.request)
.then(response=>{

if(response){
return response;
}

return fetch(event.request)
.then(networkResponse=>{

if(
!networkResponse ||
networkResponse.status !== 200 ||
networkResponse.type !== "basic"
){

return networkResponse;

}

const responseClone =
networkResponse.clone();

caches.open(CACHE_NAME)
.then(cache=>{

cache.put(
event.request,
responseClone
);

});

return networkResponse;

})
.catch(()=>{

if(
event.request.mode === "navigate"
){

return caches.match(
"/404.html"
);

}

});

})

);

}
);

// ============================
// Push Notification
// ============================

self.addEventListener(
"push",
(event)=>{

let data = {};

if(event.data){

data =
event.data.json();

}

const title =
data.title || "عالسريع";

const options = {

body:
data.body || "لديك إشعار جديد",

icon:
"/icon-192.png",

badge:
"/icon-96.png",

vibrate:
[200,100,200],

data:{
url:
data.url || "/"
}

};

event.waitUntil(

self.registration.showNotification(
title,
options
)

);

}
);

// ============================
// Notification Click
// ============================

self.addEventListener(
"notificationclick",
(event)=>{

event.notification.close();

event.waitUntil(

clients.matchAll({
type:"window"
})

.then(clientList=>{

for(let client of clientList){

if(
client.url === event.notification.data.url
&&
"focus" in client
){

return client.focus();

}

}

if(clients.openWindow){

return clients.openWindow(
event.notification.data.url
);

}

})

);

}
);
