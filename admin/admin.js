// admin/admin.js - Final Real-time & Auto-Menu Version
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, onSnapshot, doc, getDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loadingScreen = document.getElementById('admin-loading');

// ১. সিকিউরিটি চেক এবং ইনিশিয়ালাইজেশন
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().role === "admin") {
            if(document.getElementById('admin-name-top')) document.getElementById('admin-name-top').innerText = user.displayName;
            setGreeting(user.displayName);
            if(loadingScreen) loadingScreen.style.display = 'none';
            highlightActiveMenu();
            listenToRealtimeStats();
        } else { window.location.href = "/"; }
    } else { window.location.href = "/"; }
});

// ২. অটোমেটিক মেনু হাইলাইট করার ফাংশন (আপনার এক নাম্বার সমস্যার সমাধান)
function highlightActiveMenu() {
    const currentPath = window.location.pathname.split('/').pop();
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const itemPath = item.getAttribute('href');
        if (currentPath === itemPath) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ৩. রিয়েল-টাইম ডাটা আপডেট (আপনার দুই নাম্বার সমস্যার সমাধান)
function listenToRealtimeStats() {
    if(!document.getElementById('stat-videos')) return; // শুধু ড্যাশবোর্ড পেজে কাজ করবে

    // ভিডিও কাউন্ট আপডেট
    onSnapshot(collection(db, "videos"), (snapshot) => {
        document.getElementById('stat-videos').innerText = snapshot.size;
    });

    // ইউজার কাউন্ট আপডেট
    onSnapshot(collection(db, "users"), (snapshot) => {
        document.getElementById('stat-users').innerText = snapshot.size;
        let premiumCount = 0;
        snapshot.forEach(d => { if(d.data().premium) premiumCount++; });
        document.getElementById('stat-premium').innerText = premiumCount;
    });

    // পেমেন্ট ও রেভিনিউ আপডেট
    onSnapshot(collection(db, "premiumPayments"), (snapshot) => {
        let pending = 0;
        let revenue = 0;
        snapshot.forEach(d => {
            if(d.data().status === 'pending') pending++;
            if(d.data().status === 'approved') revenue += parseInt(d.data().amount || 0);
        });
        document.getElementById('stat-pending').innerText = pending;
        document.getElementById('stat-revenue').innerText = revenue + "৳";
    });

    // শেষ ৫টি ভিডিও রিয়েল-টাইম
    const qRecent = query(collection(db, "videos"), orderBy("createdAt", "desc"), limit(5));
    onSnapshot(qRecent, (snapshot) => {
        const vList = document.getElementById('recent-videos-list');
        if(!vList) return;
        vList.innerHTML = '';
        snapshot.forEach(d => {
            vList.innerHTML += `<tr><td>${d.data().title.substring(0,25)}</td><td>${d.data().views || 0}</td><td>${new Date(d.data().createdAt?.toDate()).toLocaleDateString('bn-BD')}</td></tr>`;
        });
    });
}

function setGreeting(name) {
    const hr = new Date().getHours();
    let greet = (hr < 12) ? "शुभ সকাল" : (hr < 18) ? "শুভ অপরাহ্ন" : "শুভ সন্ধ্যা";
    if(document.getElementById('greeting-text')) document.getElementById('greeting-text').innerText = `${greet}, ${name.split(' ')[0]}! 👋`;
    if(document.getElementById('current-date')) document.getElementById('current-date').innerText = new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}