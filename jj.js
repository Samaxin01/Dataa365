import { auth, db } from "./firebase-config.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
collection,
onSnapshot,
doc,
getDoc,
updateDoc,
increment
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";