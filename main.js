
/**
 * MAIN.JS
 * 
 * This is the single entry point for the entire application.
 * It's responsible for orchestrating the initialization of all modules in the correct order.
 * This structure eliminates race conditions and ensures a reliable startup sequence.
 */

import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { auth } from './firebase-config.js';
import { initializeUI } from './core.js';
import { initializeData } from './data.js';
import { benefits } from './benefits.js';

// Initialize the static UI elements and event listeners (tabs, buttons, etc.)
initializeUI();
benefits.init();

// Set up a listener that reacts to changes in the user's login state.
onAuthStateChanged(auth, async (user) => {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');

    if (user) {
        // User is signed in
        console.log("User is signed in:", user.uid);

        // Update user info in the UI
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        if (user.photoURL) userAvatar.src = user.photoURL;
        if (user.displayName) userName.textContent = user.displayName;

        // Initialize the data module and load user data
        await initializeData(user);

        // Hide login screen, show app
        loginScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');

    } else {
        // User is signed out
        console.log("User is signed out.");

        // Show login screen, hide app
        loginScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
});
