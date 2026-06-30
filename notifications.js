import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// ==========================
// HTML ELEMENTS
// ==========================

const notificationList =
document.getElementById("notificationList");

const notificationCount =
document.getElementById("notificationCount");

const emptyState =
document.getElementById("emptyState");

const loadingOverlay =
document.getElementById("loadingOverlay");

const toast =
document.getElementById("toast");

const toastText =
document.getElementById("toastText");


// ==========================
// TOAST
// ==========================

function showToast(message){

toastText.textContent = message;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},2500);

}


// ==========================
// DARK MODE
// ==========================

if(localStorage.getItem("theme")==="dark"){

document.body.classList.add("dark");

}


// ==========================
// AUTH CHECK
// ==========================

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";

return;

}

loadNotifications();

});


// ==========================
// LOAD NOTIFICATIONS
// ==========================

function loadNotifications(){

const q=query(

collection(db,"notifications"),

orderBy("createdAt","desc")

);

onSnapshot(q,(snapshot)=>{

loadingOverlay.style.display="none";

notificationList.innerHTML="";

notificationCount.textContent =
snapshot.size;

if(snapshot.empty){

emptyState.style.display="flex";

return;

}

emptyState.style.display="none";

snapshot.forEach((docSnap)=>{

const data =
docSnap.data();

let date="";

if(data.createdAt){

date=
data.createdAt
.toDate()
.toLocaleString();

}

const card=
document.createElement("div");

card.className=
"notificationCard";

card.innerHTML=`

<div class="notificationHeader">

<h3>${data.title}</h3>

<span class="notificationTime">

${date}

</span>

</div>

<p>

${data.message}

</p>

<span class="badge">

Announcement

</span>

`;

notificationList.appendChild(card);

});

});

}
// ==========================
// RELATIVE DATE
// ==========================

function formatDate(timestamp){

if(!timestamp) return "";

const date=timestamp.toDate();

const today=new Date();

const yesterday=new Date();

yesterday.setDate(today.getDate()-1);

if(date.toDateString()===today.toDateString()){

return "Today • " +
date.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

}

if(date.toDateString()===yesterday.toDateString()){

return "Yesterday • " +
date.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

}

return date.toLocaleDateString([],{
day:"numeric",
month:"short",
year:"numeric"
})+" • "+date.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

}


// ==========================
// NEW NOTIFICATION ALERT
// ==========================

let previousCount=0;

function checkNewNotification(count){

if(previousCount!==0 && count>previousCount){

showToast("📢 New notification received!");

}

previousCount=count;

}


// ==========================
// PAGE EVENTS
// ==========================

window.addEventListener("load",()=>{

loadingOverlay.style.display="none";

});

window.addEventListener("online",()=>{

showToast("Internet Connected");

});

window.addEventListener("offline",()=>{

showToast("No Internet Connection");

});


// ==========================
// RELOAD NOTIFICATIONS
// ==========================

const originalLoad=loadNotifications;

loadNotifications=function(){

const q=query(

collection(db,"notifications"),

orderBy("createdAt","desc")

);

onSnapshot(q,(snapshot)=>{

loadingOverlay.style.display="none";

notificationList.innerHTML="";

notificationCount.textContent=snapshot.size;

checkNewNotification(snapshot.size);

if(snapshot.empty){

emptyState.style.display="flex";

return;

}

emptyState.style.display="none";

snapshot.forEach((docSnap)=>{

const data=docSnap.data();

const card=document.createElement("div");

card.className="notificationCard";

card.innerHTML=`

<div class="notificationHeader">

<h3>${data.title}</h3>

<span class="notificationTime">

${formatDate(data.createdAt)}

</span>

</div>

<p>

${data.message}

</p>

<span class="badge">

Announcement

</span>

`;

notificationList.appendChild(card);

});

});

};