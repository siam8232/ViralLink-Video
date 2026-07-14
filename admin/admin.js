// admin/admin.js

import { auth, db } from "../firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loadingScreen = document.getElementById('admin-loading');
const adminName = document.getElementById('admin-name');

// ১. অ্যাডমিন কি না তা পরীক্ষা করা
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // ডাটাবেস থেকে ইউজারের রোল (Role) চেক করা
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
            // যদি ইউজার অ্যাডমিন হয়, তবে তাকে ভেতরে ঢুকতে দাও
            if(loadingScreen) loadingScreen.style.display = 'none';
            if(adminName) adminName.innerText = user.displayName;
            
            // ড্যাশবোর্ডের তথ্যগুলো লোড করো
            loadDashboardStats();
        } else {
            // অ্যাডমিন না হলে তাকে হোমপেজে পাঠিয়ে দাও
            alert("আপনার এই পেজে ঢোকার অনুমতি নেই! 🚫");
            window.location.href = "/";
        }
    } else {
        // লগইন করা না থাকলে হোমপেজে পাঠিয়ে দাও
        window.location.href = "/";
    }
});

// ২. ড্যাশবোর্ডের পরিসংখ্যান (Stats) লোড করা
const loadDashboardStats = async () => {
    try {
        // মোট ভিডিও সংখ্যা
        const videoSnap = await getDocs(collection(db, "videos"));
        document.getElementById('stat-total-videos').innerText = videoSnap.size;

        // মোট ইউজার সংখ্যা
        const userSnap = await getDocs(collection(db, "users"));
        document.getElementById('stat-total-users').innerText = userSnap.size;

        // প্রিমিয়াম মেম্বার সংখ্যা
        const premiumQuery = query(collection(db, "users"), where("premium", "==", true));
        const premiumSnap = await getDocs(premiumQuery);
        document.getElementById('stat-premium-users').innerText = premiumSnap.size;

        // পেন্ডিং পেমেন্ট সংখ্যা
        const pendingPayQuery = query(collection(db, "premiumPayments"), where("status", "==", "pending"));
        const pendingPaySnap = await getDocs(pendingPayQuery);
        document.getElementById('stat-pending-payments').innerText = pendingPaySnap.size;

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
    }
};