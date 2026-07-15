// public/js/auth.js
import { auth, db, googleProvider } from "/firebase/firebase-config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const userSection = document.getElementById('user-section');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        let role = "user"; let isPremium = false;
        
        if (userSnap.exists()) {
            role = userSnap.data().role || "user";
            isPremium = userSnap.data().premium || false;
        }

        userSection.innerHTML = `
            ${role === 'admin' ? '<a href="/admin/index.html" class="btn" style="background:green; margin-right:5px; font-size:0.7rem; padding: 5px 10px;">Admin</a>' : ''}
            ${!isPremium ? '<a href="premium.html" class="btn" style="background: gold; color: black; font-size:0.7rem; padding: 5px 10px;">👑 Premium</a>' : '<span style="color: gold; font-size:0.7rem; font-weight:bold;">PRO</span>'}
            <img src="${user.photoURL}" style="width:30px; height:30px; border-radius:50%; border: 2px solid red; margin-left:8px; vertical-align: middle;">
            <i id="logout-btn" class="fas fa-sign-out-alt" style="margin-left:12px; cursor:pointer; color:#888;" title="লগআউট"></i>
        `;

        document.getElementById('logout-btn').onclick = () => {
            if(confirm("লগআউট করতে চান?")) signOut(auth).then(() => window.location.reload());
        };

    } else {
        userSection.innerHTML = `<button id="login-btn" class="btn" style="font-size:0.8rem; padding: 6px 15px;">লগইন</button>`;
        document.getElementById('login-btn').onclick = () => signInWithPopup(auth, googleProvider);
    }
});