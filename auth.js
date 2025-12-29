import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import firebaseConfig from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Login Function
window.loginWithGoogle = async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login Failed:", error.message);
        alert("Login Failed: " + error.message);
    }
};

// Logout Function
document.getElementById('logout-btn')?.addEventListener('click', () => {
    signOut(auth);
});

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    const appContainer = document.getElementById('app-container');
    if (user) {
        appContainer.classList.remove('hidden');
        console.log("User logged in:", user.displayName);
    } else {
        appContainer.classList.add('hidden');
        // If not logged in, trigger login (or show a login button)
        window.loginWithGoogle();
    }
});