import { auth, db } from "./firebase-config.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
collection,
onSnapshot,
doc,
getDoc,
updateDoc,
increment
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================
// YOUR ADMIN UID
// ======================

const ADMIN_UID="7uTJYDKKU0YfjMU9t8rkMVZ2EEr2";

// ======================
// HTML
// ======================

const requests=document.getElementById("taskRequests");

const pendingCount=document.getElementById("pendingCount");

const approvedToday=document.getElementById("approvedToday");

const declinedToday=document.getElementById("declinedToday");

const emptyState=document.getElementById("emptyState");

const loading=document.getElementById("loading");

const toast=document.getElementById("toast");

const toastText=document.getElementById("toastText");

// ======================
// TOAST
// ======================

function showToast(msg){

toastText.innerText=msg;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},2500);

}

// ======================
// ADMIN LOGIN
// ======================

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";

return;

}

if(user.uid!==ADMIN_UID){

alert("Access Denied");

location.href="dashboard.html";

return;

}

loadRequests();

});

// ======================
// LOAD REQUESTS
// ======================

function loadRequests(){

onSnapshot(collection(db,"users"),(snapshot)=>{

loading.style.display="none";

requests.innerHTML="";

let totalPending=0;

snapshot.forEach(userDoc=>{

const user=userDoc.data();

const history=user.taskHistory||[];

history.forEach(task=>{

if(task.status!=="Pending") return;

totalPending++;

requests.innerHTML+=`

<div class="requestCard">

<h3>${task.taskName}</h3>

<p>

<b>Email:</b>

${user.email}

</p>

<div class="reward">

${task.reward} MB Reward

</div>

<p class="date">

${new Date(task.date).toLocaleString()}

</p>

<div class="actions">

<button
class="approveBtn"

onclick="approveTask(

'${userDoc.id}',

'${task.id}'

)">

Approve

</button>

<button
class="declineBtn"

onclick="declineTask(

'${userDoc.id}',

'${task.id}'

)">

Decline

</button>

</div>

</div>

`;

});

});

pendingCount.innerText=totalPending;

if(totalPending===0){

emptyState.style.display="flex";

}else{

emptyState.style.display="none";

}

});

}
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