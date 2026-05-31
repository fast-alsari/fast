export function formatPrice(price){

return Number(
price || 0
).toLocaleString()
+
" د.ع";

}

export function generateId(prefix="ID"){

return `${prefix}_${Date.now()}`;

}

export function calculateDistance(
lat1,
lon1,
lat2,
lon2
){

const R = 6371;

const dLat =
(lat2 - lat1)
*
Math.PI / 180;

const dLon =
(lon2 - lon1)
*
Math.PI / 180;

const a =

Math.sin(dLat/2)
*
Math.sin(dLat/2)

+

Math.cos(lat1 * Math.PI/180)
*
Math.cos(lat2 * Math.PI/180)

*
Math.sin(dLon/2)
*
Math.sin(dLon/2);

const c =
2 *
Math.atan2(
Math.sqrt(a),
Math.sqrt(1-a)
);

return R * c;

}

export function saveUser(user){

localStorage.setItem(
"user",
JSON.stringify(user)
);

}

export function getUser(){

return JSON.parse(
localStorage.getItem("user")
);

}

export function logout(){

localStorage.clear();

sessionStorage.clear();

window.location.replace(
"index.html"
);

}