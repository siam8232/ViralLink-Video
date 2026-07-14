// admin/settings.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const settingsForm = document.getElementById('settings-form');

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; }
    document.getElementById('admin-loading').style.display = 'none';
    
    // আগের সেটিংস লোড করা
    loadSettings();
});

const loadSettings = async () => {
    const snap = await getDoc(doc(db, "websiteSettings", "general"));
    if (snap.exists()) {
        const data = snap.data();
        document.getElementById('site-name').value = data.name || "";
        document.getElementById('site-logo').value = data.logo || "";
        document.getElementById('site-footer').value = data.footer || "";
    }
};

settingsForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
        await setDoc(doc(db, "websiteSettings", "general"), {
            name: document.getElementById('site-name').value,
            logo: document.getElementById('site-logo').value,
            footer: document.getElementById('site-footer').value,
            updatedAt: new Date()
        });
        alert("ওয়েবসাইট সেটিংস আপডেট হয়েছে! 🎉");
    } catch (error) {
        alert(error.message);
    }
};