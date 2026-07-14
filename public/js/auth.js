// public/js/auth.js
import { auth, db, googleProvider } from "./firebase-config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const userSection = document.getElementById('user-section');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        let role = "user"; let isPremium = false;
        if (userSnap.exists()) { 
            role = userSnap.data().role; 
            isPremium = userSnap.data().premium || false; 
        }

        userSection.innerHTML = `
            ${!isPremium ? '<a href="premium.html" class="btn" style="background: gold; color: black; margin-right: 10px;"><i class="fas fa-crown"></i> Premium</a>' : '<span style="color: gold; margin-right:10px;"><i class="fas fa-crown"></i> Pro</span>'}
            ${role === 'admin' ? '<a href="admin/index.html" class="btn" style="background:green; margin-right:10px;">অ্যাডমিন</a>' : ''}
            <img src="${user.photoURL}" class="user-img">
            <button id="logout-btn" class="btn" style="background: #333; margin-left: 10px;">লগআউট</button>
        `;
        document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => window.location.reload());
    } else {
        userSection.innerHTML = `<button id="login-btn" class="btn">লগইন করুন</button>`;
        document.getElementById('login-btn').onclick = () => signInWithPopup(auth, googleProvider);
    }
});