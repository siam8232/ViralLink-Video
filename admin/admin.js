// admin/admin.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, doc, getDoc, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loadingScreen = document.getElementById('admin-loading');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists() && userSnap.data().role === "admin") {
            document.getElementById('admin-name-top').innerText = user.displayName;
            setGreeting(user.displayName);
            loadingScreen.style.display = 'none';
            loadDashboardData();
        } else { window.location.href = "/"; }
    } else { window.location.href = "/"; }
});

// ১. স্মার্ট গ্রিটিং সেট করা
function setGreeting(name) {
    const hr = new Date().getHours();
    let greet = "শুভ দিন";
    if (hr < 12) greet = "শুভ সকাল";
    else if (hr < 18) greet = "শুভ অপরাহ্ন";
    else greet = "শুভ সন্ধ্যা";
    document.getElementById('greeting-text').innerText = `${greet}, ${name.split(' ')[0]}! 👋`;
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ২. ডাটাবেস থেকে সব তথ্য আনা
async function loadDashboardData() {
    try {
        const videoSnap = await getDocs(collection(db, "videos"));
        const userSnap = await getDocs(collection(db, "users"));
        const paymentSnap = await getDocs(collection(db, "premiumPayments"));

        // মোট ভিডিও ও ইউজার
        document.getElementById('stat-videos').innerText = videoSnap.size;
        document.getElementById('stat-users').innerText = userSnap.size;

        // প্রিমিয়াম ও পেন্ডিং হিসাব
        let premiumCount = 0;
        userSnap.forEach(d => { if(d.data().premium) premiumCount++; });
        document.getElementById('stat-premium').innerText = premiumCount;

        let pendingCount = 0;
        let totalRevenue = 0;
        paymentSnap.forEach(d => {
            if(d.data().status === 'pending') pendingCount++;
            if(d.data().status === 'approved') totalRevenue += parseInt(d.data().amount || 0);
        });
        document.getElementById('stat-pending').innerText = pendingCount;
        document.getElementById('stat-revenue').innerText = totalRevenue + " ৳";

        // শেষ ৫টি ভিডিও
        const recentV = query(collection(db, "videos"), orderBy("createdAt", "desc"), limit(5));
        const recentVSnap = await getDocs(recentV);
        const vList = document.getElementById('recent-videos-list');
        vList.innerHTML = '';
        recentVSnap.forEach(d => {
            vList.innerHTML += `<tr><td>${d.data().title}</td><td>${d.data().views || 0}</td><td>${new Date(d.data().createdAt?.toDate()).toLocaleDateString('bn-BD')}</td></tr>`;
        });

        // টপ ৩ ভিডিও
        const topV = query(collection(db, "videos"), orderBy("views", "desc"), limit(3));
        const topVSnap = await getDocs(topV);
        const topList = document.getElementById('top-videos-list');
        topList.innerHTML = '';
        topVSnap.forEach(d => {
            topList.innerHTML += `<div style="background:#222; padding:10px; border-radius:10px; margin-bottom:10px; border-left:3px solid gold;">
                <p style="font-size:0.85rem;">${d.data().title}</p>
                <small style="color:#888;">${d.data().views || 0} ভিউজ</small>
            </div>`;
        });

    } catch (e) { console.error(e); }
}