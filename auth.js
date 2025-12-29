import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export function initAuth(app, onUserIn, onUserOut) {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');
            onUserIn(user);
        } else {
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('app-container').classList.add('hidden');
            onUserOut();
        }
    });

    document.getElementById('google-login-btn').onclick = () => signInWithPopup(auth, provider);
    document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => location.reload());
    
    return auth;
}