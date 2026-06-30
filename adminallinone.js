import { auth } from "./firebase-config.js";

import {

onAuthStateChanged,
signOut

} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// ===========================
// ALLOWED ADMINS
// ===========================

const ADMINS=[

"data365official@gmail.com",

"jeesammy31@gmail.com"

];

// ===========================
// AUTH CHECK
// ===========================

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

const email=user.email.toLowerCase();

if(!ADMINS.includes(email)){

alert("Access Denied!");

location.href="dashboard.html";

return;

}

loadAdmin();

});

// ===========================
// LOAD ADMIN
// ===========================

function loadAdmin(){

console.log("Admin Panel Loaded");

if(localStorage.getItem("theme")==="dark"){

document.body.classList.add("dark");

}

}
// ===========================
// LOGOUT FUNCTION
// ===========================

window.logout = async()=>{

const ok = confirm("Logout from Admin Panel?");

if(!ok) return;

try{

await signOut(auth);

location.href="login.html";

}catch(err){

alert("Logout Failed");

console.error(err);

}

};

// ===========================
// ONLINE / OFFLINE STATUS
// ===========================

window.addEventListener("online",()=>{

console.log("Internet Connected");

});

window.addEventListener("offline",()=>{

alert("No Internet Connection");

});

// ===========================
// PREVENT BACK BUTTON AFTER LOGOUT
// ===========================

window.history.pushState(null,null,window.location.href);

window.onpopstate=function(){

window.history.go(1);

};

// ===========================
// OPTIONAL WELCOME MESSAGE
// ===========================

setTimeout(()=>{

console.log("Welcome Admin!");

},500);

// ===========================
// AUTO REDIRECT IF SIGNED OUT
// ===========================

auth.onAuthStateChanged(user=>{

if(!user){

location.href="login.html";

}

});