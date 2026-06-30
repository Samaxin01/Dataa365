import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    doc,
    updateDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// ==========================
// HTML ELEMENTS
// ==========================

const withdrawList =
document.getElementById("withdrawList");

const emptyState =
document.getElementById("emptyState");

const pendingCount =
document.getElementById("pendingCount");

const approvedCount =
document.getElementById("approvedCount");

const rejectedCount =
document.getElementById("rejectedCount");

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
// ADMIN CHECK
// ==========================

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

if(user.email !== "data365official@gmail.com"){

alert("Access Denied");

location.href="dashboard.html";

return;

}

loadWithdrawals();

loadStatistics();

});


// ==========================
// LOAD PENDING WITHDRAWALS
// ==========================

function loadWithdrawals(){

const q = query(

collection(db,"withdrawals"),

where("status","==","pending"),

orderBy("requestedAt","desc")

);

onSnapshot(q,(snapshot)=>{

loadingOverlay.style.display="none";

withdrawList.innerHTML="";

pendingCount.textContent =
snapshot.size;

if(snapshot.empty){

emptyState.style.display="flex";

return;

}

emptyState.style.display="none";

snapshot.forEach((docSnap)=>{

const data = docSnap.data();

const card =
document.createElement("div");

card.className="withdrawCard";

let date = "";

if(data.requestedAt){

date =
data.requestedAt
.toDate()
.toLocaleString();

}

card.innerHTML = `

<div class="userInfo">

<h3>${data.username}</h3>

<p>${data.email}</p>

</div>

<div class="withdrawInfo">

<p><strong>Phone:</strong> ${data.phone}</p>

<p><strong>Network:</strong> ${data.network}</p>

<p><strong>Amount:</strong> ${data.amount}MB</p>

<p><strong>Date:</strong> ${date}</p>

<span class="status">

Pending

</span>

</div>

<div class="actionButtons">

<button
class="approveBtn"
data-id="${docSnap.id}"
data-uid="${data.uid}">

<i class="fa-solid fa-check"></i>

Approve

</button>

<button
class="rejectBtn"
data-id="${docSnap.id}"
data-uid="${data.uid}"
data-amount="${data.amount}">

<i class="fa-solid fa-xmark"></i>

Reject

</button>

</div>

`;

withdrawList.appendChild(card);

});

});

}
// ==========================
// LOAD STATISTICS
// ==========================

function loadStatistics(){

// Approved
onSnapshot(

query(
collection(db,"withdrawals"),
where("status","==","approved")
),

(snapshot)=>{

approvedCount.textContent =
snapshot.size;

});

// Rejected
onSnapshot(

query(
collection(db,"withdrawals"),
where("status","==","rejected")
),

(snapshot)=>{

rejectedCount.textContent =
snapshot.size;

});

}


// ==========================
// BUTTON EVENTS
// ==========================

withdrawList.addEventListener("click",async(e)=>{

const approveBtn =
e.target.closest(".approveBtn");

const rejectBtn =
e.target.closest(".rejectBtn");


// ==========================
// APPROVE
// ==========================

if(approveBtn){

approveBtn.disabled=true;

try{

await updateDoc(

doc(db,"withdrawals",approveBtn.dataset.id),

{

status:"approved",

reviewedAt:new Date(),

reviewedBy:auth.currentUser.email

}

);

showToast("Withdrawal Approved");

}catch(err){

alert(err.message);

approveBtn.disabled=false;

}

}


// ==========================
// REJECT
// ==========================

if(rejectBtn){

rejectBtn.disabled=true;

try{

const withdrawRef =
doc(db,"withdrawals",rejectBtn.dataset.id);

const withdrawSnap =
await getDoc(withdrawRef);

if(!withdrawSnap.exists()) return;

const withdrawData =
withdrawSnap.data();

const userRef =
doc(db,"users",rejectBtn.dataset.uid);

const userSnap =
await getDoc(userRef);

if(!userSnap.exists()) return;

const userData =
userSnap.data();


// Prevent double refund

if(!withdrawData.refundProcessed){

await updateDoc(

userRef,

{

balanceMB:
(userData.balanceMB||0)
+
Number(rejectBtn.dataset.amount)

}

);

}


// Update withdrawal

await updateDoc(

withdrawRef,

{

status:"rejected",

refundProcessed:true,

reviewedAt:new Date(),

reviewedBy:auth.currentUser.email

}

);

showToast("Withdrawal Rejected & Refunded");

}catch(err){

alert(err.message);

rejectBtn.disabled=false;

}

}

});


// ==========================
// DARK MODE
// ==========================

if(localStorage.getItem("theme")==="dark"){

document.body.classList.add("dark");

}


// ==========================
// PAGE READY
// ==========================

window.addEventListener("load",()=>{

loadingOverlay.style.display="none";

});