/* config.js */

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {

getDatabase

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

import {

getAuth

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// ==========================
// Firebase Config
// ==========================

const firebaseConfig = {

apiKey:
"YOUR_API_KEY",

authDomain:
"YOUR_PROJECT.firebaseapp.com",

projectId:
"YOUR_PROJECT_ID",

storageBucket:
"YOUR_PROJECT.appspot.com",

messagingSenderId:
"000000000000",

appId:
"YOUR_APP_ID",

databaseURL:
"https://YOUR_PROJECT-default-rtdb.firebaseio.com"

};

// ==========================
// Initialize
// ==========================

const app =
initializeApp(firebaseConfig);

// ==========================
// Exports
// ==========================

export const db =
getDatabase(app);

export const auth =
getAuth(app);

export default app;
