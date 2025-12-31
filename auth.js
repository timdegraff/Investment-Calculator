import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Development override: Hardcode User UID for seamless development ---
const DEV_MODE_UID = "Cfuei5nQbadhn6ADDD4f90EgUUl1";

// These functions are attached to the window object so they can be called 
// by the onclick attributes in the static HTML.
window.loginWithGoogle = () => console.log("DEV MODE: Manual login is disabled. Using hardcoded UID.");
window.logoutUser = () => console.log("DEV MODE: Logout is disabled while UID is hardcoded.");

// This function is still called by the auto-save mechanism in other scripts.
window.saveUserData = async (data) => {
    if (!DEV_MODE_UID) return;
    try {
        await setDoc(doc(db, "users", DEV_MODE_UID), { financialData: data }, { merge: true });
        console.log("✅ DEV MODE: Data auto-saved to Firebase for UID: " + DEV_MODE_UID);
    } catch (e) {
        console.error("❌ DEV MODE: Save Error:", e);
    }
};

/**
 * Initializes the application with a hardcoded user UID.
 * This function is EXPORTED and will be called by core.js once the UI is ready.
 */
export const initializeAuth = async () => {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');

    // Hide login screen and show the main app content
    loginScreen?.classList.add('hidden');
    appContainer?.classList.remove('hidden');
    
    console.log(`DEV MODE: Attempting to load data for hardcoded UID: ${DEV_MODE_UID}`);

    try {
        const docSnap = await getDoc(doc(db, "users", DEV_MODE_UID));
        if (docSnap.exists() && window.loadUserDataIntoUI) {
            window.loadUserDataIntoUI(docSnap.data().financialData);
            console.log("✅ DEV MODE: User data loaded successfully.");
        } else if (!docSnap.exists()) {
            console.log("⚠️ DEV MODE: No data found for the hardcoded UID. A new record will be created on first save.");
        } else {
            console.error("❌ Auth Init Error: The loadUserDataIntoUI function is not available on the window object.");
        }
    } catch (error) {
        console.error("❌ DEV MODE: Error fetching user document:", error);
    }
};
