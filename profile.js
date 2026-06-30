import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// ===========================
// HTML ELEMENTS
// ===========================

const username =
document.getElementById("username");

const email =
document.getElementById("email");

const verifyBadge =
document.getElementById("verifyBadge");

const balanceMB =
document.getElementById("balanceMB");

const totalReferrals =
document.getElementById("totalReferrals");

const completedTasks =
document.getElementById("completedTasks");

const joinedDate =
document.getElementById("joinedDate");

const loadingOverlay =
document.getElementById("loadingOverlay");

const toast =
document.getElementById("toast");

const toastText =
document.getElementById("toastText");

const logoutBtn =
document.getElementById("logoutBtn");

const rateApp =
document.getElementById("rateApp");


// ===========================
// TOAST
// ===========================

function showToast(message){

toastText.textContent =
message;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},2500);

}


// ===========================
// FORMAT DATE
// ===========================

function formatDate(timestamp){

if(!timestamp) return "--";

try{

return timestamp
.toDate()
.toLocaleDateString(
"en-NG",
{
day:"numeric",
month:"short",
year:"numeric"
}
);

}catch{

return "--";

}

}


// ===========================
// LOAD USER
// ===========================

onAuthStateChanged(

auth,

(user)=>{

if(!user){

location.href="login.html";

return;

}

email.textContent =
user.email;

verifyBadge.innerHTML =
user.emailVerified

?

'<i class="fa-solid fa-circle-check"></i> Email Verified'

:

'<i class="fa-solid fa-circle-xmark"></i> Email Not Verified';

const userRef =
doc(
db,
"users",
user.uid
);

onSnapshot(

userRef,

(snapshot)=>{

if(!snapshot.exists()) return;

const data =
snapshot.data();

username.textContent =
data.username || "User";

balanceMB.textContent =
(data.balanceMB || 0) + "MB";

totalReferrals.textContent =
data.totalReferrals || 0;

completedTasks.textContent =
data.completedTasks || 0;

joinedDate.textContent =
formatDate(
data.createdAt
);

loadingOverlay.style.display =
"none";

}

);

});
// ===========================
// LOGOUT
// ===========================

logoutBtn.addEventListener("click", async()=>{

const confirmLogout =
confirm("Are you sure you want to logout?");

if(!confirmLogout) return;

try{

loadingOverlay.style.display="flex";

await signOut(auth);

showToast("Logged out successfully");

setTimeout(()=>{

window.location.href="login.html";

},800);

}catch(error){

loadingOverlay.style.display="none";

alert(error.message);

}

});


// ===========================
// RATE APP
// ===========================

rateApp.addEventListener("click",(e)=>{

e.preventDefault();

showToast("Thank you for supporting Data365 ❤️");

});


// ===========================
// APPLY THEME
// ===========================

const savedTheme =
localStorage.getItem("theme");

if(savedTheme==="dark"){

document.body.classList.add("dark");

}


// ===========================
// PAGE LOADED
// ===========================

window.addEventListener("load",()=>{

loadingOverlay.style.display="none";

});


// ===========================
// HANDLE FIREBASE OFFLINE
// ===========================

window.addEventListener("offline",()=>{

showToast("No internet connection");

});

window.addEventListener("online",()=>{

showToast("Back online");

});


// ===========================
// PREVENT DOUBLE TAP LOGOUT
// ===========================

let loggingOut=false;

logoutBtn.addEventListener("click",()=>{

if(loggingOut){

return;

}

loggingOut=true;

setTimeout(()=>{

loggingOut=false;

},3000);

});