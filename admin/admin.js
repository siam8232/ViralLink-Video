// admin/admin.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, doc, getDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loadingScreen = document.getElementById('admin-loading');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists() && userSnap.data().role === "admin") {
            document.getElementById('admin-name-top').innerText = user.displayName;
            setGreeting(user.displayName);
            if(loadingScreen) loadingScreen.style.display = 'none';
            loadDashboardData();
        } else { window.location.href = "/"; }
    } else { window.location.href = "/"; }
});

function setGreeting(name) {
    const hr = new Date().getHours();
    let greet = (hr < 12) ? "শুভ সকাল" : (hr < 18) ? "শুভ অপরাহ্ন" : "শুভ সন্ধ্যা";
    document.getElementById('greeting-text').innerText = `${greet}, ${name.split(' ')[0]}! 👋`;
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

async function loadDashboardData() {
    try {
        const vSnap = await getDocs(collection(db, "videos"));
        const uSnap = await getDocs(collection(db, "users"));
        const pSnap = await getDocs(collection(db, "premiumPayments"));

        document.getElementById('stat-videos').innerText = vSnap.size;
        document.getElementById('stat-users').innerText = uSnap.size;

        let premiumCount = 0;
        uSnap.forEach(d => { if(d.data().premium) premiumCount++; });
        document.getElementById('stat-premium').innerText = premiumCount;

        let pendingCount = 0, totalRevenue = 0;
        pSnap.forEach(d => {
            if(d.data().status === 'pending') pendingCount++;
            if(d.data().status === 'approved') totalRevenue += parseInt(d.data().amount || 0);
        });
        document.getElementById('stat-pending').innerText = pendingCount;
        document.getElementById('stat-revenue').innerText = totalRevenue + "৳";

        // Recent Videos
        const qRecent = query(collection(db, "videos"), orderBy("createdAt", "desc"), limit(5));
        const resRecent = await getDocs(qRecent);
        const vList = document.getElementById('recent-videos-list');
        vList.innerHTML = '';
        resRecent.forEach(d => {
            const data = d.data();
            vList.innerHTML += `<tr><td>${data.title.substring(0,25)}...</td><td>${data.views || 0}</td><td>${new Date(data.createdAt?.toDate()).toLocaleDateString('bn-BD')}</td></tr>`;
        });

        // Top 3 Videos
        const qTop = query(collection(db, "videos"), orderBy("views", "desc"), limit(3));
        const resTop = await getDocs(qTop);
        const topList = document.getElementById('top-videos-list');
        topList.innerHTML = '';
        resTop.forEach(d => {
            topList.innerHTML += `
                <div style="background:#1a1a1a; padding:15px; border-radius:15px; margin-bottom:12px; border-left:4px solid #ffcc00; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.85rem;">${d.data().title.substring(0,30)}</span>
                    <span style="color:gold;"><i class="fas fa-eye"></i> ${d.data().views || 0}</span>
                </div>`;
        });
    } catch (e) { console.error(e); }
}