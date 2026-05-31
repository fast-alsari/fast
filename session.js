// session.js

export function getCurrentUser(){

try{

return JSON.parse(
localStorage.getItem("user")
);

}catch{

return null;

}

}

export function saveUser(user){

localStorage.setItem(
"user",
JSON.stringify(user)
);

}

export function logout(){

localStorage.clear();

sessionStorage.clear();

window.location.replace(
"index.html"
);

}
