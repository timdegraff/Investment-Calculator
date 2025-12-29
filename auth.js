import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import firebaseConfig from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Final Global Attachment
window.loginWithGoogle = async function() {
    console.log("Login triggered");
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Auth Error:", error);
        alert("Error: " + error.message);
    }
};

window.logoutUser = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    
    if (user) {
        loginScreen?.classList.add('hidden');
        appContainer?.classList.remove('hidden');
        // Trigger initial age calculation
        if(window.calculateUserAge) window.calculateUserAge();
    } else {
        loginScreen?.classList.remove('hidden');
        appContainer?.classList.add('hidden');
    }
});