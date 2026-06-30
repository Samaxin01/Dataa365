import { auth, db } from "./firebase-config.js";

import {
createUserWithEmailAndPassword,
sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
doc,
setDoc,
collection,
query,
where,
getDocs,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const form = document.getElementById("signupForm");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const referral = document.getElementById("referral");
const captchaQuestion = document.getElementById("captchaQuestion");
const captchaAnswer = document.getElementById("captchaAnswer");
const signupBtn = document.getElementById("signupBtn");
const alertBox = document.getElementById("alertBox");

let answer = 0;

// CAPTCHA

function generateCaptcha() {

const a = Math.floor(Math.random() * 10) + 1;
const b = Math.floor(Math.random() * 10) + 1;

answer = a + b;

captchaQuestion.textContent = `${a} + ${b} = ?`;

}

generateCaptcha();

// ALERT

function showAlert(message, type) {

alertBox.style.display = "block";
alertBox.className = `alert ${type}`;
alertBox.textContent = message;

}

// USERNAME CHECK

async function usernameExists(name) {

const q = query(
    collection(db, "users"),
    where("username", "==", name.toLowerCase())
);

const snapshot = await getDocs(q);

return !snapshot.empty;

}

// REFERRAL CODE

function generateReferralCode(username) {

const random =
    Math.floor(
        10000 + Math.random() * 90000
    );

return (
    username.substring(0,3).toUpperCase()
    + random
);

}

// URL REFERRAL

const params =
new URLSearchParams(
window.location.search
);

const refCode =
params.get("ref");

if(refCode){

referral.value = refCode;
referral.readOnly = true;

}

// SIGNUP

form.addEventListener(
"submit",
async (e)=>{

    e.preventDefault();

    signupBtn.disabled = true;
    signupBtn.textContent =
        "Creating Account...";

    try{

        const userName =
            username.value.trim();

        const userEmail =
            email.value.trim();

        const userPassword =
            password.value.trim();

        const confirmPass =
            confirmPassword.value.trim();

        if(userName.length < 3){

            throw new Error(
                "Username too short."
            );

        }

        if(await usernameExists(userName)){

            throw new Error(
                "Username already exists."
            );

        }

        if(userPassword !== confirmPass){

            throw new Error(
                "Passwords do not match."
            );

        }

        if(
            Number(captchaAnswer.value)
            !== answer
        ){

            generateCaptcha();

            throw new Error(
                "Wrong captcha answer."
            );

        }

        // CREATE ACCOUNT

        const cred =
            await createUserWithEmailAndPassword(
                auth,
                userEmail,
                userPassword
            );

        // VERIFY EMAIL

        await sendEmailVerification(
            cred.user
        );

        // SAVE USER

await setDoc(
doc(db,"users",cred.user.uid),
{
    username:userName,
    email:userEmail,

    referralCode:
    generateReferralCode(userName),

    referredBy:
    referral.value.trim() || null,

    referralRewarded:false,

    balanceMB:0,
    totalReferrals:0,

    completedTasks:0,
    pendingTasks:0,

    totalEarnedMB:0,

    emailVerified:false,

    createdAt:serverTimestamp()
});

        localStorage.setItem(
            "pendingEmail",
            userEmail
        );

        alert(
            "Account created successfully!"
        );

        window.location.href =
            "confirm.html";

    }

    catch(error){

        alert(error.message);

        signupBtn.disabled = false;

        signupBtn.textContent =
            "Create Account";

    }

}

);