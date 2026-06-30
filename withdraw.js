import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    getDoc,
    onSnapshot,
    collection,
    query,
    where,
    orderBy,
    serverTimestamp,
    addDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// ===========================
// HTML ELEMENTS
// ===========================

const balanceMB =
document.getElementById("balanceMB");

const withdrawForm =
document.getElementById("withdrawForm");

const phone =
document.getElementById("phone");

const network =
document.getElementById("network");

const amount =
document.getElementById("amount");

const password =
document.getElementById("password");

const withdrawBtn =
document.getElementById("withdrawBtn");

const pendingContainer =
document.getElementById("pendingContainer");

const historyList =
document.getElementById("historyList");

const historyCount =
document.getElementById("historyCount");

const emptyHistory =
document.getElementById("emptyHistory");

const loadingOverlay =
document.getElementById("loadingOverlay");

const toast =
document.getElementById("toast");

const toastText =
document.getElementById("toastText");


// ===========================
// VARIABLES
// ===========================

let currentUser = null;

let userData = null;


// ===========================
// TOAST
// ===========================

function showToast(message){

toastText.textContent = message;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},2500);

}


// ===========================
// DARK MODE
// ===========================

if(localStorage.getItem("theme")==="dark"){

document.body.classList.add("dark");

}


// ===========================
// LOAD USER
// ===========================

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";

return;

}

currentUser = user;

const userRef =
doc(db,"users",user.uid);

onSnapshot(userRef,(snap)=>{

if(!snap.exists()) return;

userData = snap.data();

balanceMB.textContent =
(userData.balanceMB || 0)+"MB";

loadingOverlay.style.display="none";

loadPendingWithdrawal();

loadHistory();

});

});
// ===========================
// WITHDRAW REQUEST
// ===========================

withdrawForm.addEventListener("submit",async(e)=>{

e.preventDefault();

if(!currentUser || !userData) return;

const withdrawAmount =
Number(amount.value);

if(withdrawAmount < 500){

showToast("Minimum withdrawal is 500MB");

return;

}

if(withdrawAmount > 700){

showToast("Maximum withdrawal is 700MB");

return;

}

if(withdrawAmount > (userData.balanceMB || 0)){

showToast("Insufficient balance");

return;

}

const today =
new Date().toDateString();

if(userData.lastWithdrawalDate===today){

showToast("You have already requested a withdrawal today.");

return;

}

withdrawBtn.disabled=true;

withdrawBtn.innerHTML=
'<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

try{

const credential =
EmailAuthProvider.credential(

currentUser.email,

password.value

);

await reauthenticateWithCredential(

currentUser,

credential

);

await updateDoc(

doc(db,"users",currentUser.uid),

{

balanceMB:

(userData.balanceMB||0)-withdrawAmount,

lastWithdrawalDate:today

}

);

await addDoc(

collection(db,"withdrawals"),

{

uid:currentUser.uid,

username:userData.username,

email:currentUser.email,

phone:phone.value.trim(),

network:network.value,

amount:withdrawAmount,

status:"pending",

requestedAt:serverTimestamp(),

reviewedAt:null,

reviewedBy:null,

refundProcessed:false

}

);

showToast(

"Withdrawal request submitted."

);

withdrawBtn.innerHTML=

'<i class="fa-solid fa-circle-check"></i> Withdrawal Requested Today';

withdrawBtn.disabled=true;

withdrawForm.reset();

}catch(error){

withdrawBtn.disabled=false;

withdrawBtn.innerHTML=

'<i class="fa-solid fa-paper-plane"></i> Request Withdrawal';

showToast(error.message);

}

});// ===========================
// WITHDRAW REQUEST
// ===========================

withdrawForm.addEventListener("submit",async(e)=>{

e.preventDefault();

if(!currentUser || !userData) return;

const withdrawAmount =
Number(amount.value);

if(withdrawAmount < 500){

showToast("Minimum withdrawal is 500MB");

return;

}

if(withdrawAmount > 700){

showToast("Maximum withdrawal is 700MB");

return;

}

if(withdrawAmount > (userData.balanceMB || 0)){

showToast("Insufficient balance");

return;

}

const today =
new Date().toDateString();

if(userData.lastWithdrawalDate===today){

showToast("You have already requested a withdrawal today.");

return;

}

withdrawBtn.disabled=true;

withdrawBtn.innerHTML=
'<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

try{

const credential =
EmailAuthProvider.credential(

currentUser.email,

password.value

);

await reauthenticateWithCredential(

currentUser,

credential

);

await updateDoc(

doc(db,"users",currentUser.uid),

{

balanceMB:

(userData.balanceMB||0)-withdrawAmount,

lastWithdrawalDate:today

}

);

await addDoc(

collection(db,"withdrawals"),

{

uid:currentUser.uid,

username:userData.username,

email:currentUser.email,

phone:phone.value.trim(),

network:network.value,

amount:withdrawAmount,

status:"pending",

requestedAt:serverTimestamp(),

reviewedAt:null,

reviewedBy:null,

refundProcessed:false

}

);

showToast(

"Withdrawal request submitted."

);

withdrawBtn.innerHTML=

'<i class="fa-solid fa-circle-check"></i> Withdrawal Requested Today';

withdrawBtn.disabled=true;

withdrawForm.reset();

}catch(error){

withdrawBtn.disabled=false;

withdrawBtn.innerHTML=

'<i class="fa-solid fa-paper-plane"></i> Request Withdrawal';

showToast(error.message);

}

});
// ===========================
// LOAD PENDING WITHDRAWAL
// ===========================

function loadPendingWithdrawal(){

const q=query(

collection(db,"withdrawals"),

where("uid","==",currentUser.uid),

where("status","==","pending")

);

onSnapshot(q,(snapshot)=>{

pendingContainer.innerHTML="";

if(snapshot.empty){

pendingContainer.innerHTML=
'<p class="emptyText">No pending withdrawal.</p>';

return;

}

snapshot.forEach((docSnap)=>{

const data=docSnap.data();

let date="";

if(data.requestedAt){

date=data.requestedAt
.toDate()
.toLocaleString();

}

pendingContainer.innerHTML=`

<div class="pendingItem">

<p><b>Amount:</b> ${data.amount}MB</p>

<p><b>Network:</b> ${data.network}</p>

<p><b>Number:</b> ${data.phone}</p>

<p><b>Date:</b> ${date}</p>

<span class="pendingStatus">

Pending

</span>

</div>

`;

withdrawBtn.disabled=true;

withdrawBtn.innerHTML=

'<i class="fa-solid fa-circle-check"></i> Withdrawal Requested Today';

});

});

}


// ===========================
// LOAD HISTORY
// ===========================

function loadHistory(){

const q=query(

collection(db,"withdrawals"),

where("uid","==",currentUser.uid),

orderBy("requestedAt","desc")

);

onSnapshot(q,(snapshot)=>{

historyList.innerHTML="";

historyCount.textContent=snapshot.size;

if(snapshot.empty){

emptyHistory.style.display="flex";

return;

}

emptyHistory.style.display="none";

snapshot.forEach((docSnap)=>{

const data=docSnap.data();

let statusClass="pending";

let statusText="Pending";

if(data.status==="approved"){

statusClass="approved";

statusText="Approved";

}

if(data.status==="rejected"){

statusClass="rejected";

statusText="Rejected";

}

let date="";

if(data.requestedAt){

date=data.requestedAt
.toDate()
.toLocaleString();

}

const item=document.createElement("div");

item.className="historyItem";

item.innerHTML=`

<div class="historyLeft">

<h4>${data.amount}MB</h4>

<p>${data.network} • ${data.phone}</p>

<p>${date}</p>

</div>

<div>

<span class="status ${statusClass}">

${statusText}

</span>

</div>

`;

historyList.appendChild(item);

});

});

}


// ===========================
// PAGE READY
// ===========================

window.addEventListener("load",()=>{

loadingOverlay.style.display="none";

});