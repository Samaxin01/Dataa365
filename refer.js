import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// ===============================
// HTML ELEMENTS
// ===============================

const referralCode =
document.getElementById("referralCode");

const referralLink =
document.getElementById("referralLink");

const totalReferrals =
document.getElementById("totalReferrals");

const verifiedReferrals =
document.getElementById("verifiedReferrals");

const totalEarnings =
document.getElementById("totalEarnings");

const historyList =
document.getElementById("historyList");

const historyCount =
document.getElementById("historyCount");

const loadingOverlay =
document.getElementById("loadingOverlay");

const emptyState =
document.getElementById("emptyState");

const toast =
document.getElementById("toast");

const toastText =
document.getElementById("toastText");

const copyCode =
document.getElementById("copyCode");

const copyLink =
document.getElementById("copyLink");

const shareBtn =
document.getElementById("shareBtn");


// ===============================
// VARIABLES
// ===============================

let myReferralCode = "";

const WEBSITE =
"https://data365.vercel.app";


// ===============================
// TOAST
// ===============================

function showToast(message){

toastText.textContent =
message;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},2500);

}


// ===============================
// HIDE EMAIL
// ===============================

function hideEmail(email){

const parts =
email.split("@");

const first =
parts[0];

const domain =
parts[1];

return first.substring(0,4)
+
"*****@"
+
domain;

}


// ===============================
// LOGIN
// ===============================

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

location.href="login.html";

return;

}

const snap =
await getDoc(

doc(
db,
"users",
user.uid
)

);

if(!snap.exists()) return;

const data =
snap.data();

myReferralCode =
data.referralCode;

referralCode.value =
myReferralCode;

referralLink.value =
WEBSITE
+
"/signup.html?ref="
+
myReferralCode;


// ===============================
// COPY CODE
// ===============================

copyCode.onclick=()=>{

navigator.clipboard.writeText(
myReferralCode
);

showToast(
"Referral code copied"
);

};


// ===============================
// COPY LINK
// ===============================

copyLink.onclick=()=>{

navigator.clipboard.writeText(
referralLink.value
);

showToast(
"Referral link copied"
);

};


// ===============================
// SHARE
// ===============================

shareBtn.onclick=async()=>{

try{

await navigator.share({

title:"Join Data365",

text:
"Join Data365 and earn free data.",

url:referralLink.value

});

}catch(e){}

};


// ===============================
// LOAD REFERRALS
// ===============================

loadReferrals();

});

// ===============================
// LOAD REFERRALS
// ===============================

function loadReferrals(){

const q = query(
collection(db,"users"),
where("referredBy","==",myReferralCode)
);

onSnapshot(q,(snapshot)=>{

loadingOverlay.style.display="none";

historyList.innerHTML="";

historyCount.textContent=snapshot.size;

totalReferrals.textContent=snapshot.size;

verifiedReferrals.textContent=snapshot.size;

const totalMB=snapshot.size*40;

totalEarnings.textContent=totalMB+"MB";

if(snapshot.empty){

emptyState.style.display="flex";

return;

}

emptyState.style.display="none";

snapshot.forEach((docSnap)=>{

const user=docSnap.data();

const item=document.createElement("div");

item.className="historyItem";

item.innerHTML=`

<div>

<h4>${hideEmail(user.email)}</h4>

<p>Verified Referral</p>

</div>

<div class="reward">

+40MB

</div>

`;

historyList.appendChild(item);

});

});

}


// ===============================
// DARK MODE
// ===============================

const theme=localStorage.getItem("theme");

if(theme==="dark"){

document.body.classList.add("dark");

}


// ===============================
// PAGE READY
// ===============================

window.addEventListener("load",()=>{

loadingOverlay.style.display="none";

});

