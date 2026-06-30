import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// ==========================
// HTML ELEMENTS
// ==========================

const notificationForm =
document.getElementById("notificationForm");

const title =
document.getElementById("title");

const message =
document.getElementById("message");

const sendBtn =
document.getElementById("sendBtn");

const notificationHistory =
document.getElementById("notificationHistory");

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

function showToast(msg){

toastText.textContent = msg;

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
// ADMIN CHECK
// ==========================

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";

return;

}

if(user.email !== "data365official@gmail.com"){

alert("Access Denied");

location.href="dashboard.html";

return;

}

loadNotifications();

});


// ==========================
// LOAD NOTIFICATIONS
// ==========================

function loadNotifications(){

const q = query(

collection(db,"notifications"),

orderBy("createdAt","desc")

);

onSnapshot(q,(snapshot)=>{

loadingOverlay.style.display="none";

notificationHistory.innerHTML="";

notificationCount.textContent =
snapshot.size;

if(snapshot.empty){

emptyState.style.display="flex";

return;

}

emptyState.style.display="none";

snapshot.forEach((docSnap)=>{

const data = docSnap.data();

let date = "";

if(data.createdAt){

date =
data.createdAt
.toDate()
.toLocaleString();

}

const card =
document.createElement("div");

card.className="notificationItem";

card.innerHTML=`

<h4>${data.title}</h4>

<p>${data.message}</p>

<div class="notificationFooter">

<span class="notificationDate">

${date}

</span>

<span class="notificationBadge">

Sent

</span>

</div>

`;

notificationHistory.appendChild(card);

});

});

}
// ==========================
// SEND NOTIFICATION
// ==========================

notificationForm.addEventListener("submit",async(e)=>{

e.preventDefault();

const notificationTitle=
title.value.trim();

const notificationMessage=
message.value.trim();

if(notificationTitle===""||notificationMessage===""){

showToast("Please complete all fields.");

return;

}

sendBtn.disabled=true;

sendBtn.innerHTML=`
<i class="fa-solid fa-spinner fa-spin"></i>
Sending...
`;

try{

await addDoc(

collection(db,"notifications"),

{

title:notificationTitle,

message:notificationMessage,

createdAt:serverTimestamp(),

sentBy:auth.currentUser.email

}

);

notificationForm.reset();

showToast("Notification sent successfully!");

}catch(error){

console.error(error);

showToast("Failed to send notification.");

}

sendBtn.disabled=false;

sendBtn.innerHTML=`
<i class="fa-solid fa-paper-plane"></i>
Send Notification
`;

});


// ==========================
// PAGE READY
// ==========================

window.addEventListener("load",()=>{

loadingOverlay.style.display="none";

});


// ==========================
// ONLINE / OFFLINE STATUS
// ==========================

window.addEventListener("online",()=>{

showToast("Internet Connected");

});

window.addEventListener("offline",()=>{

showToast("No Internet Connection");

});
// ======================
// APPROVE TASK
// ======================

window.approveTask = async (uid, taskId) => {

try{

const userRef=doc(db,"users",uid);

const snap=await getDoc(userRef);

if(!snap.exists()) return;

const data=snap.data();

const history=data.taskHistory||[];

let reward=0;

const updatedHistory=history.map(task=>{

if(task.id===taskId){

reward=Number(task.reward)||0;

return{

...task,

status:"Approved",

processedDate:Date.now()

};

}

return task;

});

await updateDoc(userRef,{

taskHistory:updatedHistory,

balanceMB:increment(reward)

});

approvedToday.innerText=

parseInt(approvedToday.innerText)+1;

showToast("Task Approved Successfully");

}catch(err){

console.error(err);

showToast("Approval Failed");

}

};


// ======================
// DECLINE TASK
// ======================

window.declineTask = async (uid, taskId) => {

try{

const userRef=doc(db,"users",uid);

const snap=await getDoc(userRef);

if(!snap.exists()) return;

const data=snap.data();

const history=data.taskHistory||[];

const updatedHistory=history.map(task=>{

if(task.id===taskId){

return{

...task,

status:"Declined",

processedDate:Date.now()

};

}

return task;

});

await updateDoc(userRef,{

taskHistory:updatedHistory

});

declinedToday.innerText=

parseInt(declinedToday.innerText)+1;

showToast("Task Declined");

}catch(err){

console.error(err);

showToast("Decline Failed");

}

};


// ======================
// PAGE READY
// ======================

window.addEventListener("load",()=>{

loading.style.display="none";

});


// ======================
// INTERNET STATUS
// ======================

window.addEventListener("online",()=>{

showToast("Internet Connected");

});

window.addEventListener("offline",()=>{

showToast("No Internet Connection");

});


// ======================
// DARK MODE
// ======================

if(localStorage.getItem("theme")==="dark"){

document.body.classList.add("dark");

}