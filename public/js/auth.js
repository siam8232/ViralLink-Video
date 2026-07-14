// public/js/auth.js
import { auth, db, googleProvider } from "/firebase/firebase-config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const userSection = document.getElementById('user-section');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            let role = "user"; let isPremium = false;
            
            if (userSnap.exists()) {
                role = userSnap.data().role || "user";
                isPremium = userSnap.data().premium || false;
            }

            userSection.innerHTML = `
                ${!isPremium ? '<a href="premium.html" class="btn" style="background: gold; color: black; margin-right: 10px; font-size: 0.8rem;"><i class="fas fa-crown"></i> Premium</a>' : '<span style="color: gold; margin-right:10px; font-size: 0.8rem;"><i class="fas fa-crown"></i> Pro</span>'}
                ${role === 'admin' ? '<a href="/admin/index.html" class="btn" style="background:green; margin-right:10px; font-size: 0.8rem;">অ্যাডমিন</a>' : ''}
                <img src="${user.photoURL}" style="width:35px; border-radius:50%; border: 2px solid red; vertical-align: middle;">
                <button id="logout-btn" class="btn" style="background: #333; margin-left: 10px; font-size: 0.8rem;">লগআউট</button>
            `;

            document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => window.location.reload());
        } catch (e) { console.error(e); }
    } else {
        userSection.innerHTML = `<button id="login-btn" class="btn">লগইন করুন</button>`;
        document.getElementById('login-btn').onclick = () => signInWithPopup(auth, googleProvider);
    }
});