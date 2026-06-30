import { auth, db } from "./firebase-config.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
doc,
getDoc,
updateDoc,
collection,
query,
where,
getDocs,
increment,
arrayUnion,
runTransaction
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// =========================
// HTML
// =========================

const rewardAmount=document.getElementById("rewardAmount");

const remainingSlots=document.getElementById("remainingSlots");

const redeemBtn=document.getElementById("redeemBtn");

const codeInput=document.getElementById("codeInput");

const loading=document.getElementById("loading");

const popup=document.getElementById("successPopup");

const popupMessage=document.getElementById("popupMessage");

const closePopup=document.getElementById("closePopup");

const lastRedeem=document.getElementById("lastRedeem");

// =========================
// VARIABLES
// =========================

let currentUser;

let userData;

let activeCodeDoc;

let activeCode;

// =========================
// LOGIN
// =========================

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

currentUser=user;

await loadUser();

await loadLuckyCode();

});

// =========================
// LOAD USER
// =========================

async function loadUser(){

const ref=doc(db,"users",currentUser.uid);

const snap=await getDoc(ref);

if(snap.exists()){

userData=snap.data();

}

}

// =========================
// LOAD ACTIVE CODE
// =========================

async function loadLuckyCode(){

const q=query(

collection(db,"luckyCodes"),

where("active","==",true)

);

const snap=await getDocs(q);

if(snap.empty){

rewardAmount.innerText="--";

remainingSlots.innerText="0";

redeemBtn.disabled=true;

redeemBtn.innerText="No Active Code";

return;

}

activeCodeDoc=snap.docs[0];

activeCode=activeCodeDoc.data();

rewardAmount.innerText=

activeCode.reward+"MB";

remainingSlots.innerText=

(activeCode.maxUsers-activeCode.redeemed)+"/"+activeCode.maxUsers;

}
// =========================
// REDEEM CODE
// =========================

redeemBtn.addEventListener("click", async () => {

const enteredCode = codeInput.value.trim().toUpperCase();

if(enteredCode==""){
alert("Enter today's Lucky Code");
return;
}

redeemBtn.disabled=true;
redeemBtn.innerText="Redeeming...";
loading.style.display="flex";

try{

await runTransaction(db, async(transaction)=>{

const luckyRef=doc(db,"luckyCodes",activeCodeDoc.id);
const userRef=doc(db,"users",currentUser.uid);

const luckySnap=await transaction.get(luckyRef);
const userSnap=await transaction.get(userRef);

if(!luckySnap.exists())
throw "Lucky Code not found";

if(!userSnap.exists())
throw "User not found";

const lucky=luckySnap.data();
const user=userSnap.data();

if(enteredCode!==lucky.code.toUpperCase())
throw "Invalid Lucky Code";

const redeemedCodes=user.redeemedCodes||[];

if(redeemedCodes.includes(lucky.code))
throw "You have already redeemed this code.";

if(lucky.redeemed>=lucky.maxUsers)
throw "This Lucky Code has expired.";

transaction.update(userRef,{

balanceMB:(user.balanceMB||0)+lucky.reward,

redeemedCodes:[...redeemedCodes,lucky.code]

});

transaction.update(luckyRef,{

redeemed:lucky.redeemed+1

});

});

popupMessage.innerText=`${activeCode.reward}MB has been added to your account!`;

popup.style.display="flex";

}catch(err){

alert(err);

redeemBtn.disabled=false;
redeemBtn.innerText="Redeem Now";

}

loading.style.display="none";

});
// =========================
// REDEEM CODE
// =========================

redeemBtn.addEventListener("click",async()=>{

const enteredCode=

codeInput.value.trim().toUpperCase();

if(enteredCode===""){

alert("Enter today's lucky code.");

return;

}

loading.style.display="flex";

if(enteredCode!==activeCode.code.toUpperCase()){

loading.style.display="none";

alert("Invalid Lucky Code.");

return;

}

// Already redeemed?

const redeemed=

userData.redeemedCodes||[];

if(redeemed.includes(activeCode.code)){

loading.style.display="none";

alert("You have already redeemed this code.");

return;

}

// Winners exhausted?

if(activeCode.redeemed>=activeCode.maxUsers){

loading.style.display="none";

alert("This Lucky Code has expired.");

return;

}

try{

// Credit User

await updateDoc(

doc(db,"users",currentUser.uid),

{

balanceMB:increment(activeCode.reward),

redeemedCodes:arrayUnion(activeCode.code)

}

);

// Update Lucky Code

await updateDoc(

doc(db,"luckyCodes",activeCodeDoc.id),

{

redeemed:increment(1)

}

);

popupMessage.innerText=

`${activeCode.reward}MB has been added to your account!`;

popup.style.display="flex";

lastRedeem.innerHTML=`

<b>Code:</b> ${activeCode.code}<br>

<b>Reward:</b> ${activeCode.reward}MB<br>

<b>Status:</b>

<span style="color:green;">

Successful

</span>

`;

redeemBtn.disabled=true;

redeemBtn.innerText="Redeemed";

}catch(err){

console.log(err);

alert("Something went wrong.");

}

loading.style.display="none";

});
// =========================
// CLOSE POPUP
// =========================

closePopup.addEventListener("click",()=>{

popup.style.display="none";

codeInput.value="";

location.reload();

});

// =========================
// LOAD LAST REDEMPTION
// =========================

function loadLastRedeem(){

const redeemed=userData.redeemedCodes||[];

if(redeemed.length===0){

lastRedeem.innerHTML=
"You haven't redeemed any lucky code yet.";

return;

}

const last=redeemed[redeemed.length-1];

lastRedeem.innerHTML=`

<b>Last Redeemed Code:</b><br>

${last}

`;

}

loadLastRedeem();

// =========================
// REFRESH REMAINING SLOTS
// =========================

async function refreshLuckyCode(){

const snap=await getDoc(

doc(db,"luckyCodes",activeCodeDoc.id)

);

if(!snap.exists()) return;

activeCode=snap.data();

rewardAmount.innerText=

activeCode.reward+"MB";

remainingSlots.innerText=

(activeCode.maxUsers-activeCode.redeemed)+"/"+activeCode.maxUsers;

if(activeCode.redeemed>=activeCode.maxUsers){

redeemBtn.disabled=true;

redeemBtn.innerText="Code Exhausted";

}

}

setInterval(refreshLuckyCode,5000);

// =========================
// INTERNET STATUS
// =========================

window.addEventListener("online",()=>{

console.log("Connected");

});

window.addEventListener("offline",()=>{

alert("No Internet Connection");

});

// =========================
// DARK MODE
// =========================

if(localStorage.getItem("theme")==="dark"){

document.body.classList.add("dark");

}