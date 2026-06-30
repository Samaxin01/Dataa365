import { auth } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const alertBox = document.getElementById("alertBox");

function showAlert(message, type){

    alertBox.style.display = "block";
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;

}

form.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try{

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        await user.reload();

        if(!user.emailVerified){

            showAlert(
                "Please verify your email first.",
                "error"
            );

            window.location.href =
                "confirm.html";

            return;
        }

        showAlert(
            "Login successful!",
            "success"
        );

        setTimeout(()=>{

            window.location.href =
                "auth-redirect.html";

        },1000);

    }

    catch(error){

        let message =
            "Login failed.";

        switch(error.code){

            case "auth/user-not-found":
                message =
                    "Account not found.";
                break;

            case "auth/wrong-password":
                message =
                    "Incorrect password.";
                break;

            case "auth/invalid-credential":
                message =
                    "Invalid email or password.";
                break;

            case "auth/invalid-email":
                message =
                    "Invalid email address.";
                break;

        }

        showAlert(
            message,
            "error"
        );

    }

    loginBtn.disabled = false;
    loginBtn.textContent = "Login";

});


// Forgot Password

document
.getElementById("forgotPassword")
.addEventListener("click", async ()=>{

    const email =
        prompt(
            "Enter your email address:"
        );

    if(!email) return;

    try{

        await sendPasswordResetEmail(
            auth,
            email
        );

        alert(
            "Password reset email sent."
        );

    }

    catch(error){

        alert(
            error.message
        );

    }

});