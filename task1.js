import { auth, db } from "./firebase-config.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
doc,
onSnapshot,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
getStorage,
ref,
uploadBytes,
getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

// =========================
// FIREBASE STORAGE
// =========================

const storage = getStorage();

// =========================
// HTML
// =========================

const popup=document.getElementById("taskPopup");

const closePopup=document.getElementById("closePopup");

const email=document.getElementById("email");

const taskName=document.getElementById("taskName");

const reward=document.getElementById("reward");

const taskForm=document.getElementById("taskForm");

const loading=document.getElementById("loading");

const availableTasks=document.getElementById("availableTasks");

const completedTasks=document.getElementById("completedTasks");

const pendingTasks=document.getElementById("pendingTasks");

const toast=document.getElementById("toast");

const toastText=document.getElementById("toastText");

let currentUser;

let userData={};

// =========================
// TOAST
// =========================

function showToast(message){

toastText.innerText=message;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},2500);

}

// =========================
// LOGIN
// =========================

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";

return;

}

currentUser=user;

email.value=user.email;

loadUser();

});

// =========================
// LOAD USER
// =========================

function loadUser(){

const ref=doc(db,"users",currentUser.uid);

onSnapshot(ref,(snap)=>{

loading.style.display="none";

if(!snap.exists()) return;

userData=snap.data();

const history=userData.taskHistory||[];

// Available Tasks

availableTasks.innerText=

document.querySelectorAll(".taskCard").length;

// Completed

completedTasks.innerText=

history.filter(t=>t.status==="Approved").length;

// Pending

pendingTasks.innerText=

history.filter(t=>t.status==="Pending").length;

// Update buttons

updateTaskButtons(history);

});

}

// =========================
// TASK BUTTONS
// =========================

document.querySelectorAll(".performBtn").forEach(btn=>{

btn.onclick=()=>{

const card=btn.closest(".taskCard");

taskName.value=

card.dataset.task;

reward.value=

card.dataset.reward;

// Open task

window.open(

card.dataset.link,

"_blank"

);

// Save current task id

taskForm.dataset.taskId=

card.dataset.id;

// Show popup

popup.classList.add("active");

};

});

// =========================
// CLOSE POPUP
// =========================

closePopup.onclick=()=>{

popup.classList.remove("active");

taskForm.reset();

email.value=currentUser.email;

};

// =========================
// BUTTON STATUS
// =========================

function updateTaskButtons(history){

document.querySelectorAll(".taskCard").forEach(card=>{

const btn=

card.querySelector(".performBtn");

const taskId=

card.dataset.id;

const task=

history.find(

t=>t.taskId===taskId

);

if(!task){

btn.disabled=false;

btn.innerText="Perform Task";

return;

}

if(task.status==="Pending"){

btn.disabled=true;

btn.innerText="Pending Review";

}

else if(task.status==="Approved"){

btn.disabled=true;

btn.innerText="Completed ✓";

}

else if(task.status==="Declined"){

btn.disabled=true;

btn.innerText="Declined ✕";

}

});

}
// =========================
// SUBMIT TASK
// =========================

taskForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");

    const file = document.getElementById("proof").files[0];

    if (!file) {
        showToast("Please upload a screenshot.");
        return;
    }

    if (!file.type.startsWith("image/")) {
        showToast("Please upload an image only.");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Uploading...";

    try {

        // =========================
        // UPLOAD TO CLOUDINARY
        // =========================

        const imageData = new FormData();

        imageData.append("file", file);
        imageData.append("upload_preset", "data365_tasks");

        const cloudRes = await fetch(
            "https://api.cloudinary.com/v1_1/q8rpm87b/image/upload",
            {
                method: "POST",
                body: imageData
            }
        );

        const cloud = await cloudRes.json();

        if (!cloud.secure_url) {
            throw new Error("Image upload failed.");
        }

        const taskId = taskForm.dataset.taskId;
        const taskTitle = taskName.value;
        const taskReward = parseInt(reward.value);

        const submission = {

            id: Date.now().toString(),

            taskId,

            taskName: taskTitle,

            reward: taskReward,

            email: currentUser.email,

            image: cloud.secure_url,

            status: "Pending",

            date: Date.now(),

            processedDate: null

        };

        const history = userData.taskHistory || [];

        history.push(submission);

        await updateDoc(
            doc(db, "users", currentUser.uid),
            {
                taskHistory: history
            }
        );

        popup.classList.remove("active");

        taskForm.reset();

        email.value = currentUser.email;

        updateTaskButtons(history);

        showToast("Task submitted successfully!");

    }
    catch (err) {

        console.error(err);

        showToast(err.message || "Upload failed.");

    }

    submitBtn.disabled = false;

    submitBtn.innerText = "Submit Task";

});

// =========================
// PREVENT DUPLICATE TASKS
// =========================

function hasSubmitted(taskId){

const history=userData.taskHistory||[];

return history.some(task=>task.taskId===taskId);

}

// =========================
// COUNTDOWN TIMER
// =========================

document.querySelectorAll(".taskCard").forEach(card=>{

const countdown=

card.querySelector(".countdown span");

let hours=14;
let minutes=0;
let seconds=0;

setInterval(()=>{

if(hours===0 && minutes===0 && seconds===0){

countdown.innerText="Task Expired";

const btn=card.querySelector(".performBtn");

btn.disabled=true;

btn.innerText="Expired";

return;

}

if(seconds===0){

seconds=59;

if(minutes===0){

minutes=59;

hours--;

}else{

minutes--;

}

}else{

seconds--;

}

countdown.innerText=

`${hours}h ${minutes}m ${seconds}s`;

},1000);

});

// =========================
// RESTORE BUTTON STATUS
// =========================

document.querySelectorAll(".taskCard").forEach(card=>{

const taskId=card.dataset.id;

if(hasSubmitted(taskId)){

const btn=card.querySelector(".performBtn");

btn.disabled=true;

btn.innerText="Pending Review";

}

});

// =========================
// DARK MODE
// =========================

if(localStorage.getItem("theme")==="dark"){

document.body.classList.add("dark");

}

// =========================
// INTERNET
// =========================

window.addEventListener("online",()=>{

showToast("Internet Connected");

});

window.addEventListener("offline",()=>{

showToast("No Internet Connection");

});

// =========================
// PAGE READY
// =========================

window.addEventListener("load",()=>{

loading.style.display="none";

});