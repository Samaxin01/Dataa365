// ===============================
// Data365 Firebase Configuration
// ===============================


// Import Firebase SDKs

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    getFirestore,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// Your Firebase Configuration

const firebaseConfig = {
    apiKey: "AIzaSyDKDO_xhyOpMIw_z-FWiubqeBcQdPcpbHY",
    authDomain: "data365-98916.firebaseapp.com",
    projectId: "data365-98916",
    storageBucket: "data365-98916.firebasestorage.app",
    messagingSenderId: "1090776279878",
    appId: "1:1090776279878:web:ce755f477bb98aa9019347",
    measurementId: "G-WDEBPEGWL5"
};


// Initialize Firebase

const app = initializeApp(firebaseConfig);


// Authentication

const auth = getAuth(app);


// Firestore Database

const db = getFirestore(app);


// Export services

export {
    auth,
    db,
    serverTimestamp
};