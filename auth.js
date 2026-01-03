import { GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { auth } from './firebase-config.js';

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        return user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        // Optionally, display a user-friendly error message on the UI
        return null;
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
    }
}
