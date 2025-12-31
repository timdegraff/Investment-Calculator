
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

let auth;
let db;

// This function initializes Firebase and returns the auth and firestore instances.
export function initializeAuth() {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        console.log("Firebase Auth Initialized.");
        return { auth, db };
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        // Handle initialization error appropriately
    }
}

// This function handles the Google login popup flow.
export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        console.log("Attempting to sign in with Google...");
        const result = await signInWithPopup(auth, provider);
        console.log("Sign-in successful:", result.user.displayName);
    } catch (error) {
        console.error("Google Sign-In Error:", error.message);
    }
}

// This function handles the user logout.
export async function logoutUser() {
    try {
        await signOut(auth);
        console.log("User signed out successfully.");
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

// We re-export onAuthStateChanged so main.js can import it directly from here.
export { onAuthStateChanged };
