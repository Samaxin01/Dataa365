import { auth, db } from "./firebase-config.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
collection,
doc,
setDoc,
onSnapshot,
updateDoc,
deleteDoc,
getDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// =====================
// YOUR ADMIN UID
// =====================

const ADMIN_UID="7uTJYDKKU0YfjMU9t8rkMVZ2EEr2";

// =====================
// HTML
// =====================

const code=document.getElementById("code");

const reward=document.getElementById("reward");

const maxUsers=document.getElementById("maxUsers");

const createBtn=document.getElementById("createCodeBtn");

const codeList=document.getElementById("codeList");

const activeCodes=document.getElementById("activeCodes");

const todayRedeems=document.getElementById("todayRedeems");

const loading=document.getElementById("loading");

const emptyState=document.getElementById("emptyState");

const toast=document.getElementById("toast");

const toastText=document.getElementById("toastText");

// =====================
// TOAST
// =====================

function showToast(msg){

toastText.innerText=msg;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},2500);

}

// =====================
// ADMIN LOGIN
// =====================

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

loadCodes();

});

// =====================
// LOAD CODES
// =====================

function loadCodes(){

onSnapshot(collection(db,"luckyCodes"),(snapshot)=>{

loading.style.display="none";

codeList.innerHTML="";

let active=0;

let redeemed=0;

snapshot.forEach(docSnap=>{

const data=docSnap.data();

if(data.active) active++;

redeemed+=data.redeemed||0;

codeList.innerHTML+=`

<div class="codeCard">

<h4>

🎁 ${data.code}

</h4>

<p>

Reward:

${data.reward}MB

</p>

<p>

Redeemed:

${data.redeemed}/${data.maxUsers}

</p>

<span class="status ${data.active ? "active":"inactive"}">

${data.active ? "🟢 Active":"🔴 Inactive"}

</span>

<div class="actions">

<button
class="disableBtn"

onclick="toggleCode('${docSnap.id}')">

${data.active ? "Disable":"Activate"}

</button>

<button
class="deleteBtn"

onclick="deleteCode('${docSnap.id}')">

Delete

</button>

</div>

</div>

`;

});

activeCodes.innerText=active;

todayRedeems.innerText=redeemed;

emptyState.style.display=

snapshot.empty ? "block":"none";

});

}
// =====================
// CREATE LUCKY CODE
// =====================

createBtn.addEventListener("click", async()=>{

const luckyCode=code.value.trim().toUpperCase();

const rewardMB=parseInt(reward.value);

const winners=parseInt(maxUsers.value);

if(!luckyCode){

showToast("Enter Lucky Code");

return;

}

if(!rewardMB||rewardMB<=0){

showToast("Invalid Reward");

return;

}

if(!winners||winners<=0){

showToast("Invalid Winners");

return;

}

try{

await setDoc(doc(db,"luckyCodes",luckyCode),{

code:luckyCode,

reward:rewardMB,

maxUsers:winners,

redeemed:0,

active:true,

createdAt:serverTimestamp()

});

showToast("Lucky Code Created");

code.value="";

reward.value="";

maxUsers.value="";

}catch(err){

console.error(err);

showToast("Failed to Create");

}

});

// =====================
// ACTIVATE / DISABLE
// =====================

window.toggleCode=async(id)=>{

try{

const ref=doc(db,"luckyCodes",id);

const snap=await getDoc(ref);

if(!snap.exists()) return;

const data=snap.data();

await updateDoc(ref,{

active:!data.active

});

showToast(

data.active

?

"Code Disabled"

:

"Code Activated"

);

}catch(err){

console.error(err);

showToast("Operation Failed");

}

};

// =====================
// DELETE CODE
// =====================

window.deleteCode=async(id)=>{

const ok=confirm(

"Delete this Lucky Code?"

);

if(!ok) return;

try{

await deleteDoc(

doc(db,"luckyCodes",id)

);

showToast("Lucky Code Deleted");

}catch(err){

console.error(err);

showToast("Delete Failed");

}

};

// =====================
// DARK MODE
// =====================

if(localStorage.getItem("theme")==="dark"){

document.body.classList.add("dark");

}