// admin/ads.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; }
    document.getElementById('admin-loading').style.display = 'none';
    
    // আগের সেভ করা কোডগুলো লোড করা
    loadExistingAds();
});

const loadExistingAds = async () => {
    const types = ['popunder', 'social', 'banner'];
    for (const type of types) {
        const adSnap = await getDoc(doc(db, "advertisements", type));
        if (adSnap.exists()) {
            const data = adSnap.data();
            document.getElementById(`${type}-code`).value = data.code || "";
            document.getElementById(`${type}-active`).checked = data.enabled || false;
        }
    }
};

window.saveAd = async (type) => {
    const code = document.getElementById(`${type}-code`).value;
    const enabled = document.getElementById(`${type}-active`).checked;

    try {
        await setDoc(doc(db, "advertisements", type), {
            code: code,
            enabled: enabled,
            updatedAt: new Date()
        });
        alert(`${type.toUpperCase()} অ্যাড সফলভাবে সেভ হয়েছে!`);
    } catch (error) {
        alert("ভুল হয়েছে: " + error.message);
    }
};