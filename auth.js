import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Hardcoded to bypass the 404 config.js error
const firebaseConfig = {
    apiKey: "AIzaSyAqvvl6O3-2TLK4-j6ei1WU5SuaMY3HnO4",
    authDomain: "investment-calculator-931f2.firebaseapp.com",
    projectId: "investment-calculator-931f2",
    storageBucket: "investment-calculator-931f2.firebasestorage.app",
    messagingSenderId: "943895110805",
    appId: "1:943895110805:web:ba6e1e6177ae31d7af279c",
    measurementId: "G-F0CRPKLS7G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Attach to window so HTML onclick="loginWithGoogle()" works
window.loginWithGoogle = async function() {
    console.log("Button clicked: Launching Google Auth...");
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Auth Error:", error);
        alert("Login failed. Check if pop-ups are blocked.");
    }
};

window.logoutUser = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    
    if (user) {
        loginScreen?.classList.add('hidden');
        appContainer?.classList.remove('hidden');
    } else {
        loginScreen?.classList.remove('hidden');
        appContainer?.classList.add('hidden');
    }
});