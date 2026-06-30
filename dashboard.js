import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// ======================
// ELEMENTS
// ======================

const usernameEl =
    document.getElementById("username");

const greetingEl =
    document.getElementById("greeting");

const avatarEl =
    document.getElementById("avatar");

const balanceEl =
    document.getElementById("balance");

const balanceGBEl =
    document.getElementById("balanceGB");

const joinedDateEl =
    document.getElementById("joinedDate");

const referralsEl =
    document.getElementById("referrals");

const referralCodeEl =
    document.getElementById("referralCode");

const earnedEl =
    document.getElementById("earned");

const completedTasksEl =
    document.getElementById("completedTasks");

const pendingTasksEl =
    document.getElementById("pendingTasks");

const currentDateEl =
    document.getElementById("currentDate");

const currentTimeEl =
    document.getElementById("currentTime");

const copyBtn =
    document.getElementById("copyReferral");


// ======================
// DARK MODE
// ======================

const savedTheme =
    localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
}


// ======================
// GREETING
// ======================

function updateGreeting() {

    const hour =
        new Date().getHours();

    if (hour < 12) {

        greetingEl.textContent =
            "Good Morning";

    }

    else if (hour < 18) {

        greetingEl.textContent =
            "Good Afternoon";

    }

    else {

        greetingEl.textContent =
            "Good Evening";

    }

}


// ======================
// LIVE CLOCK
// ======================

function startClock() {

    function updateClock() {

        const now =
            new Date();

        currentDateEl.textContent =
            now.toLocaleDateString(
                "en-GB",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

        currentTimeEl.textContent =
            now.toLocaleTimeString();

    }

    updateClock();

    setInterval(
        updateClock,
        1000
    );

}


// ======================
// AUTH CHECK
// ======================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }

        loadUserData(user);

    }
);


// ======================
// USER DATA
// ======================

function loadUserData(user) {

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );

    onSnapshot(
        userRef,
        (docSnap) => {

            if (!docSnap.exists())
                return;

            const data =
                docSnap.data();

            // Username

            usernameEl.textContent =
                data.username || "User";

            // Avatar

            avatarEl.textContent =
                (
                    data.username ||
                    "U"
                )
                .charAt(0)
                .toUpperCase();

            // Balance

            const balance =
                Number(
                    data.balanceMB || 0
                );

            balanceEl.textContent =
                balance + "MB";

            balanceGBEl.textContent =
                (
                    balance / 1000
                ).toFixed(2)
                + " GB";

            // Joined Date

            if (
                data.createdAt &&
                data.createdAt.seconds
            ) {

                const date =
                    new Date(
                        data.createdAt.seconds
                        * 1000
                    );

                joinedDateEl.textContent =
                    "Joined " +
                    date.toLocaleDateString();

            }

            // Referrals

            referralsEl.textContent =
                data.totalReferrals || 0;

            // Referral Code

            referralCodeEl.textContent =
                data.referralCode ||
                "N/A";

            // Earned

            earnedEl.textContent =
                balance + "MB";

            // Task Stats

            completedTasksEl.textContent =
                data.completedTasks || 0;

            pendingTasksEl.textContent =
                data.pendingTasks || 0;

        }
    );

}


// ======================
// COPY REFERRAL
// ======================

copyBtn.addEventListener(
    "click",
    async () => {

        try {

            const code =
                referralCodeEl
                .textContent;

            const link =
                `${window.location.origin}/signup.html?ref=${code}`;

            await navigator
            .clipboard
            .writeText(link);

            copyBtn.textContent =
                "Copied ✓";

            setTimeout(() => {

                copyBtn.textContent =
                    "Copy Referral Link";

            }, 2000);

        }

        catch {

            alert(
                "Unable to copy."
            );

        }

    }
);


// ======================
// START
// ======================

updateGreeting();

startClock();