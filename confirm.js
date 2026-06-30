import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    updateDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    increment
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const emailText =
    document.getElementById("userEmail");

const statusText =
    document.getElementById("statusText");

const checkBtn =
    document.getElementById("checkBtn");

const resendBtn =
    document.getElementById("resendBtn");

let currentUser = null;


// =====================
// AUTH CHECK
// =====================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }

        currentUser = user;

        emailText.textContent =
            user.email;
    }
);


// =====================
// CHECK VERIFICATION
// =====================

checkBtn.addEventListener(
    "click",
    async () => {

        if (!currentUser) return;

        statusText.textContent =
            "Checking verification...";

        try {

            await currentUser.reload();

            if (!currentUser.emailVerified) {

                statusText.textContent =
                    "Email not verified yet.";

                return;
            }

            const userRef =
                doc(
                    db,
                    "users",
                    currentUser.uid
                );

            const userSnap =
                await getDoc(userRef);

            if (!userSnap.exists()) {

                statusText.textContent =
                    "User record not found.";

                return;
            }

            const userData =
                userSnap.data();

            // =====================
            // UPDATE VERIFIED STATUS
            // =====================

            await updateDoc(
                userRef,
                {
                    emailVerified: true
                }
            );

            // =====================
            // REFERRAL REWARD
            // =====================

            if (
                userData.referredBy &&
                !userData.referralRewarded
            ) {

                const refQuery =
                    query(
                        collection(
                            db,
                            "users"
                        ),
                        where(
                            "referralCode",
                            "==",
                            userData.referredBy
                        )
                    );

                const refSnap =
                    await getDocs(
                        refQuery
                    );

                if (!refSnap.empty) {

                    const referrerDoc =
                        refSnap.docs[0];

                    await updateDoc(
                        referrerDoc.ref,
                        {
                            balanceMB:
                                increment(40),

                            totalReferrals:
                                increment(1),

                            totalEarnedMB:
                                increment(40)
                        }
                    );

                    await updateDoc(
                        userRef,
                        {
                            referralRewarded:
                                true
                        }
                    );
                }
            }

            statusText.textContent =
                "Email verified successfully! Redirecting...";

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 1500);

        }

        catch (error) {

            console.error(error);

            statusText.textContent =
                "Verification failed. Try again.";

        }

    }
);


// =====================
// RESEND EMAIL
// =====================

resendBtn.addEventListener(
    "click",
    async () => {

        if (!currentUser) return;

        try {

            await sendEmailVerification(
                currentUser
            );

            statusText.textContent =
                "Verification email resent.";

        }

        catch (error) {

            statusText.textContent =
                error.message;

        }

    }
);