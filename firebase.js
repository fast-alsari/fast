import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
getDatabase
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

const firebaseConfig = {

apiKey:
"AIzaSyC7QzQTYMSGRV_nraJBneBqDqYGhugF0Pw",

authDomain:
"fast-937c9.firebaseapp.com",

projectId:
"fast-937c9",

databaseURL:
"https://fast-937c9-default-rtdb.europe-west1.firebasedatabase.app",

storageBucket:
"fast-937c9.appspot.com",

messagingSenderId:
"1033622249927",

appId:
"1:1033622249927:web:eddb11c01ef5c38f4f02f8"

};

const app =
initializeApp(firebaseConfig);

const db =
getDatabase(app);

export {
app,
db
};