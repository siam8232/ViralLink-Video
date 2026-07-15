// admin/admin.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loadingScreen = document.getElementById('admin-loading');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().role === "admin") {
            if(loadingScreen) loadingScreen.style.display = 'none';
            highlightMenu();
            startRealtimeCounts(); // রিয়েল-টাইম ডাটা শুরু
        } else { window.location.href = "/"; }
    } else { window.location.href = "/"; }
});

// ১. মেনু হাইলাইট ঠিক করা
function highlightMenu() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".sidebar a").forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        } else { link.classList.remove("active"); }
    });
}

// ২. রিয়েল-টাইম ইউজার এবং ভিডিও কাউন্ট
function startRealtimeCounts() {
    if(!document.getElementById('stat-videos')) return;

    onSnapshot(collection(db, "videos"), (snap) => {
        document.getElementById('stat-videos').innerText = snap.size;
    });

    onSnapshot(collection(db, "users"), (snap) => {
        document.getElementById('stat-users').innerText = snap.size;
        let premium = 0;
        snap.forEach(d => { if(d.data().premium) premium++; });
        document.getElementById('stat-premium').innerText = premium;
    });

    onSnapshot(collection(db, "premiumPayments"), (snap) => {
        let pending = 0; let income = 0;
        snap.forEach(d => {
            if(d.data().status === 'pending') pending++;
            if(d.data().status === 'approved') income += parseInt(d.data().amount || 0);
        });
        document.getElementById('stat-pending').innerText = pending;
        document.getElementById('stat-revenue').innerText = income + "৳";
    });
}