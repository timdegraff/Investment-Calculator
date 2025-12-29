import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

window.loginWithGoogle = async () => {
    try { await signInWithPopup(auth, provider); } 
    catch (e) { console.error("Login Error:", e); }
};

window.logoutUser = () => signOut(auth);

// CRITICAL: This must be on window to be seen by data.js
window.saveUserData = async (data) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
        await setDoc(doc(db, "users", user.uid), { financialData: data }, { merge: true });
        console.log("✅ Data auto-saved to Firebase");
    } catch (e) {
        console.error("❌ Save Error:", e);
    }
};

onAuthStateChanged(auth, async (user) => {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    
    if (user) {
        loginScreen?.classList.add('hidden');
        appContainer?.classList.remove('hidden');
        
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists() && window.loadUserDataIntoUI) {
            window.loadUserDataIntoUI(docSnap.data().financialData);
            console.log("✅ Data loaded from Firebase");
        }
    } else {
        loginScreen?.classList.remove('hidden');
        appContainer?.classList.add('hidden');
    }
});