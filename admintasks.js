import { auth, db } from "./firebase-config.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {

collection,

query,

where,

onSnapshot,

doc,

getDoc,

Timestamp

}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// =========================
// ADMIN EMAIL
// =========================

const ADMIN_EMAIL =
"data365official@gmail.com";


// =========================
// HTML ELEMENTS
// =========================

const reviewContainer =
document.getElementById(
"reviewContainer"
);

const loadingState =
document.getElementById(
"loadingState"
);

const emptyState =
document.getElementById(
"emptyState"
);

const searchInput =
document.getElementById(
"searchInput"
);

const pendingCount =
document.getElementById(
"pendingCount"
);

const approvedToday =
document.getElementById(
"approvedToday"
);

const rejectedToday =
document.getElementById(
"rejectedToday"
);


// Modal

const confirmModal =
document.getElementById(
"confirmModal"
);

const confirmTitle =
document.getElementById(
"confirmTitle"
);

const confirmMessage =
document.getElementById(
"confirmMessage"
);

const confirmAction =
document.getElementById(
"confirmAction"
);

const cancelAction =
document.getElementById(
"cancelAction"
);


// Loading

const loadingOverlay =
document.getElementById(
"loadingOverlay"
);


// Toast

const toast =
document.getElementById(
"toast"
);

const toastText =
document.getElementById(
"toastText"
);


// =========================
// VARIABLES
// =========================

let submissions = [];

let selectedSubmission = null;

let actionType = "";


// =========================
// TOAST
// =========================

function showToast(message){

toastText.textContent =
message;

toast.classList.add(
"show"
);

setTimeout(()=>{

toast.classList.remove(
"show"
);

},3000);

}


// =========================
// AUTH
// =========================

onAuthStateChanged(
auth,

async(user)=>{

if(!user){

location.href =
"login.html";

return;

}

if(user.email !== ADMIN_EMAIL){

location.href =
"dashboard.html";

return;

}

loadPendingTasks();

}

);


// =========================
// LOAD PENDING TASKS
// =========================

function loadPendingTasks(){

const q = query(

collection(
db,
"taskSubmissions"
),

where(
"status",
"==",
"pending"
)

);

onSnapshot(

q,

(snapshot)=>{

loadingState.style.display =
"none";

submissions = [];

reviewContainer.innerHTML = "";

pendingCount.textContent =
snapshot.size;

if(snapshot.empty){

emptyState.style.display =
"block";

return;

}

emptyState.style.display =
"none";

snapshot.forEach(docSnap=>{

const data =
docSnap.data();

submissions.push({

id:docSnap.id,

...data

});

});

renderCards(
submissions
);

}

);

}
// =========================
// FORMAT DATE
// =========================

function formatDate(timestamp){

    if(!timestamp) return "N/A";

    const date =
    timestamp.toDate();

    return date.toLocaleString(
        "en-NG",
        {
            dateStyle:"medium",
            timeStyle:"short"
        }
    );

}


// =========================
// SEARCH
// =========================

searchInput.addEventListener(
"input",

()=>{

const value =
searchInput.value
.toLowerCase();

const filtered =
submissions.filter(item=>{

return (

(item.email || "")
.toLowerCase()
.includes(value)

||

(item.taskTitle || "")
.toLowerCase()
.includes(value)

);

});

renderCards(filtered);

}

);


// =========================
// RENDER CARDS
// =========================

function renderCards(list){

reviewContainer.innerHTML = "";

list.forEach(item=>{

const username =
item.username ||
item.email
.split("@")[0];

const firstLetter =
username
.charAt(0)
.toUpperCase();

const reward =
item.rewardMB || 40;

const card =
document.createElement("div");

card.className =
"review-card";

card.innerHTML = `

<div class="top">

<div class="avatar">

${firstLetter}

</div>

<div>

<h3>

${username}

</h3>

<p>

${item.email}

</p>

</div>

</div>

<div class="body">

<div class="row">

<span>

Task

</span>

<strong>

${item.taskTitle}

</strong>

</div>

<div class="row">

<span>

Reward

</span>

<strong>

${reward}MB

</strong>

</div>

<div class="row">

<span>

Submitted

</span>

<strong>

${formatDate(
item.submittedAt
)}

</strong>

</div>

<div class="status pending">

Pending Review

</div>

</div>

<div class="buttons">

<button
class="approve">

<i class="fa-solid fa-check"></i>

Approve

</button>

<button
class="reject">

<i class="fa-solid fa-xmark"></i>

Reject

</button>

</div>

`;

reviewContainer.appendChild(
card
);


// =========================
// BUTTON EVENTS
// =========================

const approveBtn =
card.querySelector(
".approve"
);

const rejectBtn =
card.querySelector(
".reject"
);

approveBtn.onclick =
()=>{

selectedSubmission =
item;

actionType =
"approve";

confirmTitle.textContent =
"Approve Task";

confirmMessage.textContent =
`Approve "${item.taskTitle}" for ${item.email}?`;

confirmAction.textContent =
"Approve";

confirmModal.style.display =
"flex";

};


rejectBtn.onclick =
()=>{

selectedSubmission =
item;

actionType =
"reject";

confirmTitle.textContent =
"Reject Task";

confirmMessage.textContent =
`Reject "${item.taskTitle}"?`;

confirmAction.textContent =
"Reject";

confirmModal.style.display =
"flex";

};

});

}


// =========================
// CLOSE MODAL
// =========================

cancelAction.onclick =
()=>{

confirmModal.style.display =
"none";

};

window.onclick =
(e)=>{

if(e.target === confirmModal){

confirmModal.style.display =
"none";

}

};// =========================
// FORMAT DATE
// =========================

function formatDate(timestamp){

    if(!timestamp) return "N/A";

    const date =
    timestamp.toDate();

    return date.toLocaleString(
        "en-NG",
        {
            dateStyle:"medium",
            timeStyle:"short"
        }
    );

}


// =========================
// SEARCH
// =========================

searchInput.addEventListener(
"input",

()=>{

const value =
searchInput.value
.toLowerCase();

const filtered =
submissions.filter(item=>{

return (

(item.email || "")
.toLowerCase()
.includes(value)

||

(item.taskTitle || "")
.toLowerCase()
.includes(value)

);

});

renderCards(filtered);

}

);


// =========================
// RENDER CARDS
// =========================

function renderCards(list){

reviewContainer.innerHTML = "";

list.forEach(item=>{

const username =
item.username ||
item.email
.split("@")[0];

const firstLetter =
username
.charAt(0)
.toUpperCase();

const reward =
item.rewardMB || 40;

const card =
document.createElement("div");

card.className =
"review-card";

card.innerHTML = `

<div class="top">

<div class="avatar">

${firstLetter}

</div>

<div>

<h3>

${username}

</h3>

<p>

${item.email}

</p>

</div>

</div>

<div class="body">

<div class="row">

<span>

Task

</span>

<strong>

${item.taskTitle}

</strong>

</div>

<div class="row">

<span>

Reward

</span>

<strong>

${reward}MB

</strong>

</div>

<div class="row">

<span>

Submitted

</span>

<strong>

${formatDate(
item.submittedAt
)}

</strong>

</div>

<div class="status pending">

Pending Review

</div>

</div>

<div class="buttons">

<button
class="approve">

<i class="fa-solid fa-check"></i>

Approve

</button>

<button
class="reject">

<i class="fa-solid fa-xmark"></i>

Reject

</button>

</div>

`;

reviewContainer.appendChild(
card
);


// =========================
// BUTTON EVENTS
// =========================

const approveBtn =
card.querySelector(
".approve"
);

const rejectBtn =
card.querySelector(
".reject"
);

approveBtn.onclick =
()=>{

selectedSubmission =
item;

actionType =
"approve";

confirmTitle.textContent =
"Approve Task";

confirmMessage.textContent =
`Approve "${item.taskTitle}" for ${item.email}?`;

confirmAction.textContent =
"Approve";

confirmModal.style.display =
"flex";

};


rejectBtn.onclick =
()=>{

selectedSubmission =
item;

actionType =
"reject";

confirmTitle.textContent =
"Reject Task";

confirmMessage.textContent =
`Reject "${item.taskTitle}"?`;

confirmAction.textContent =
"Reject";

confirmModal.style.display =
"flex";

};

});

}


// =========================
// CLOSE MODAL
// =========================

cancelAction.onclick =
()=>{

confirmModal.style.display =
"none";

};

window.onclick =
(e)=>{

if(e.target === confirmModal){

confirmModal.style.display =
"none";

}

};
// =========================
// APPROVE / REJECT
// =========================



confirmAction.onclick = async()=>{

if(!selectedSubmission) return;

confirmModal.style.display="none";

loadingOverlay.style.display="flex";

try{

const submissionRef=
doc(
db,
"taskSubmissions",
selectedSubmission.id
);

const userRef=
doc(
db,
"users",
selectedSubmission.uid
);


// =========================
// APPROVE
// =========================

if(actionType==="approve"){

await updateDoc(

submissionRef,

{

status:"approved",

reviewedAt:new Date(),

reviewedBy:ADMIN_EMAIL

}

);


await updateDoc(

userRef,

{

balanceMB:
increment(
selectedSubmission.rewardMB || 40
),

completedTasks:
increment(1),

pendingTasks:
increment(-1)

}

);

showToast(
"Task Approved Successfully"
);

approvedToday.textContent=

Number(
approvedToday.textContent
)+1;

}


// =========================
// REJECT
// =========================

if(actionType==="reject"){

await updateDoc(

submissionRef,

{

status:"rejected",

reviewedAt:new Date(),

reviewedBy:ADMIN_EMAIL

}

);


await updateDoc(

userRef,

{

pendingTasks:
increment(-1)

}

);

showToast(
"Task Rejected"
);

rejectedToday.textContent=

Number(
rejectedToday.textContent
)+1;

}

loadingOverlay.style.display=
"none";

selectedSubmission=null;

}
catch(error){

console.error(error);

loadingOverlay.style.display=
"none";

alert(
error.message
);

}

};