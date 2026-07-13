// public/js/auth.js (সম্পূর্ণ কোড - প্রিমিয়াম বাটনসহ)

import { auth, db, googleProvider } from "/firebase/firebase-config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const userSection = document.getElementById('user-section');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // ১. ডাটাবেস থেকে ইউজারের রোল (Role) এবং প্রিমিয়াম স্ট্যাটাস চেক করা
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        let role = "user";
        let isPremium = false;

        if (userSnap.exists()) {
            role = userSnap.data().role;
            isPremium = userSnap.data().premium || false;
        }

        // ২. নেভিবার ইউজার সেকশন আপডেট করা
        userSection.innerHTML = `
            <!-- যদি প্রিমিয়াম না হয়, তবেই প্রিমিয়াম বাটন দেখাবে -->
            ${!isPremium ? '<a href="premium.html" class="btn" style="background: gold; color: black; margin-right: 10px;"><i class="fas fa-crown"></i> Premium</a>' : '<span style="color: gold; margin-right:10px;"><i class="fas fa-crown"></i> Pro</span>'}
            
            <!-- যদি অ্যাডমিন হয়, তবে অ্যাডমিন বাটন দেখাবে -->
            ${role === 'admin' ? '<a href="/admin" class="btn btn-admin">অ্যাডমিন</a>' : ''}
            
            <img src="${user.photoURL}" class="user-img" title="${user.displayName}">
            <button id="logout-btn" class="btn" style="background: #333; margin-left: 10px;">লগআউট</button>
        `;

        // ৩. লগআউট ইভেন্ট
        document.getElementById('logout-btn').onclick = () => {
            signOut(auth).then(() => {
                alert("লগআউট সফল হয়েছে!");
                window.location.reload();
            });
        };

    } else {
        // ৪. ইউজার লগইন না থাকলে লগইন বাটন দেখানো
        userSection.innerHTML = `<button id="login-btn" class="btn">লগইন করুন</button>`;
        document.getElementById('login-btn').onclick = () => {
            signInWithPopup(auth, googleProvider).catch(err => alert("এরর: " + err.message));
        };
    }
});