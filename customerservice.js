import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// ==========================
// HTML ELEMENTS
// ==========================

const supportForm =
document.getElementById("supportForm");

const nameInput =
document.getElementById("name");

const emailInput =
document.getElementById("email");

const subjectInput =
document.getElementById("subject");

const messageInput =
document.getElementById("message");

const sendBtn =
document.getElementById("sendBtn");

const loadingOverlay =
document.getElementById("loadingOverlay");

const toast =
document.getElementById("toast");

const toastText =
document.getElementById("toastText");

let currentUser = null;


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

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

currentUser = user;

try{

const userRef =
doc(db,"users",user.uid);

const snap =
await getDoc(userRef);

if(snap.exists()){

const data = snap.data();

nameInput.value =
data.username || "";

}

emailInput.value =
user.email;

}catch(error){

console.error(error);

showToast("Failed to load user details.");

}

loadingOverlay.style.display="none";

});
// ==========================
// SEND SUPPORT MESSAGE
// ==========================

supportForm.addEventListener("submit",(e)=>{

e.preventDefault();

const name=nameInput.value.trim();

const email=emailInput.value.trim();

const subject=subjectInput.value.trim();

const message=messageInput.value.trim();

if(!name||!email||!subject||!message){

showToast("Please complete all fields.");

return;

}

sendBtn.disabled=true;

sendBtn.innerHTML=`
<i class="fa-solid fa-spinner fa-spin"></i>
Sending...
`;

const body=encodeURIComponent(

`Name: ${name}

Email: ${email}

Message:

${message}`

);

const mailSubject=encodeURIComponent(subject);

window.location.href=

`mailto:data365official@gmail.com?subject=${mailSubject}&body=${body}`;

setTimeout(()=>{

sendBtn.disabled=false;

sendBtn.innerHTML=`
<i class="fa-solid fa-paper-plane"></i>
Send Message
`;

showToast("Email app opened.");

},1000);

});


// ==========================
// PAGE READY
// ==========================

window.addEventListener("load",()=>{

loadingOverlay.style.display="none";

});


// ==========================
// ONLINE / OFFLINE
// ==========================

window.addEventListener("online",()=>{

showToast("Internet Connected");

});

window.addEventListener("offline",()=>{

showToast("No Internet Connection");

});