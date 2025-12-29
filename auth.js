import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import firebaseConfig from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Explicitly attach to window so HTML onclick can see it
window.loginWithGoogle = async () => {
    console.log("Login button clicked - initializing popup...");
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("Login successful:", result.user.displayName);
    } catch (error) {
        console.error("Login Error:", error.code, error.message);
        // Common fix for Michigan/Home networks: Check if popups are blocked
        alert("Action Required: Please allow pop-ups for this site or check your console for errors.");
    }
};

// Global Logout
window.logoutUser = () => signOut(auth);

// Handle Auth State
onAuthStateChanged(auth, (user) => {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    
    if (user) {
        loginScreen?.classList.add('hidden');
        appContainer?.classList.remove('hidden');
        console.log("Active Session:", user.email);
    } else {
        loginScreen?.classList.remove('hidden');
        appContainer?.classList.add('hidden');
    }
});