// admin/seo.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const seoForm = document.getElementById('seo-form');

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; }
    document.getElementById('admin-loading').style.display = 'none';
    
    // আগের সেভ করা SEO ডাটা লোড করা
    loadSEOData();
});

const loadSEOData = async () => {
    const seoSnap = await getDoc(doc(db, "websiteSettings", "seo"));
    if (seoSnap.exists()) {
        const data = seoSnap.data();
        document.getElementById('seo-title').value = data.title || "";
        document.getElementById('seo-desc').value = data.description || "";
        document.getElementById('seo-keywords').value = data.keywords || "";
    }
};

seoForm.onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById('seo-title').value;
    const desc = document.getElementById('seo-desc').value;
    const keywords = document.getElementById('seo-keywords').value;

    try {
        await setDoc(doc(db, "websiteSettings", "seo"), {
            title: title,
            description: desc,
            keywords: keywords,
            updatedAt: new Date()
        });
        alert("SEO সেটিংস সফলভাবে সেভ হয়েছে! ✅");
    } catch (error) {
        alert("ভুল হয়েছে: " + error.message);
    }
};