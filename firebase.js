// firebase.js

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getDatabase
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

const firebaseConfig = {

apiKey:"YOUR_API_KEY",

authDomain:"YOUR_PROJECT.firebaseapp.com",

projectId:"YOUR_PROJECT",

databaseURL:
"https://YOUR_PROJECT-default-rtdb.firebaseio.com"

};

const app =
initializeApp(firebaseConfig);

const db =
getDatabase(app);

export { db };
