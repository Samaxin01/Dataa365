import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// =========================
// ELEMENTS
// =========================

const userEmail =
    document.getElementById("userEmail");

const taskTitle =
    document.getElementById("taskTitle");

const proofModal =
    document.getElementById("proofModal");

const proofForm =
    document.getElementById("proofForm");

const closeModal =
    document.getElementById("closeModal");

const loadingScreen =
    document.getElementById("loadingScreen");

const availableTasks =
    document.getElementById("availableTasks");

const completedTasks =
    document.getElementById("completedTasks");

const pendingTasks =
    document.getElementById("pendingTasks");

const hiddenEmail =
    document.getElementById("hiddenEmail");

const hiddenTask =
    document.getElementById("hiddenTask");

let currentUser = null;
let selectedTask = "";


// =========================
// DARK MODE
// =========================

if (
    localStorage.getItem("theme") === "dark"
) {
    document.body.classList.add("dark");
}


// =========================
// AUTH CHECK
// =========================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }

        currentUser = user;

        userEmail.value =
            user.email;

        loadUserStats();

        attachTaskButtons();

    }
);


// =========================
// LOAD USER STATS
// =========================

async function loadUserStats() {

    try {

        const userRef =
            doc(
                db,
                "users",
                currentUser.uid
            );

        const snap =
            await getDoc(userRef);

        if (!snap.exists()) return;

        const data =
            snap.data();

        completedTasks.textContent =
            data.completedTasks || 0;

        pendingTasks.textContent =
            data.pendingTasks || 0;

        availableTasks.textContent =
            document.querySelectorAll(
                ".task-card"
            ).length;

    } catch (error) {

        console.error(error);

    }

}


// =========================
// TASK BUTTONS
// =========================

function attachTaskButtons() {

    document
        .querySelectorAll(".perform-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const card =
                        button.closest(
                            ".task-card"
                        );

                    const title =
                        card.querySelector(
                            "h3"
                        ).textContent.trim();

                    const taskId =
                        title.replace(
                            /\s+/g,
                            "_"
                        );

                    try {

                        const existingQuery =
                            query(
                                collection(
                                    db,
                                    "taskSubmissions"
                                ),
                                where(
                                    "uid",
                                    "==",
                                    currentUser.uid
                                ),
                                where(
                                    "taskId",
                                    "==",
                                    taskId
                                )
                            );

                        const existing =
                            await getDocs(
                                existingQuery
                            );

                        if (
                            !existing.empty
                        ) {

                            alert(
                                "You have already submitted this task."
                            );

                            return;
                        }

                        // Open task

                        const link =
                            button.dataset.link;

                        window.open(
                            link,
                            "_blank"
                        );

                        selectedTask =
                            title;

                        taskTitle.value =
                            title;

                        if (hiddenEmail) {
                            hiddenEmail.value =
                                currentUser.email;
                        }

                        if (hiddenTask) {
                            hiddenTask.value =
                                title;
                        }

                        proofModal.style.display =
                            "flex";

                    }

                    catch (error) {

                        console.error(
                            error
                        );

                        alert(
                            "Unable to load task."
                        );

                    }

                }
            );

        });

}


// =========================
// CLOSE MODAL
// =========================

closeModal.addEventListener(
    "click",
    () => {

        proofModal.style.display =
            "none";

    }
);


// =========================
// FORM SUBMIT
// =========================

proofForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        try {

            const taskId =
                selectedTask.replace(
                    /\s+/g,
                    "_"
                );

            // Save submission

            await addDoc(
                collection(
                    db,
                    "taskSubmissions"
                ),
                {
                    uid:
                        currentUser.uid,

                    email:
                        currentUser.email,

                    taskTitle:
                        selectedTask,

                    taskId:
                        taskId,

                    rewardMB:
                        40,

                    status:
                        "pending",

                    submittedAt:
                        serverTimestamp()
                }
            );

            // Update pending count

            await updateDoc(
                doc(
                    db,
                    "users",
                    currentUser.uid
                ),
                {
                    pendingTasks:
                        increment(1)
                }
            );

            proofModal.style.display =
                "none";

            loadingScreen.style.display =
                "flex";

            // Submit to FormSubmit

            setTimeout(() => {

                proofForm.submit();

            }, 1000);

            // Fake processing screen

            setTimeout(() => {

                loadingScreen.style.display =
                    "none";

                alert(
                    "Task submitted successfully. Awaiting review."
                );

                window.location.reload();

            }, 7000);

        }

        catch (error) {

            console.error(error);

            alert(
                "Task submission failed."
            );

        }

    }
);