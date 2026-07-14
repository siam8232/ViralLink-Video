// admin/seo.js

import { db } from "../firebase/firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const seoForm = document.getElementById('seo-form');

// ১. আগে থেকে সেভ করা SEO ডাটা ডাটাবেস থেকে নিয়ে আসার ফাংশন
const loadSEOData = async () => {
    try {
        const seoSnap = await getDoc(doc(db, "websiteSettings", "seo"));
        if (seoSnap.exists()) {
            const data = seoSnap.data();
            // ফরমে ডাটাগুলো বসানো
            document.getElementById('seo-title').value = data.title || "";
            document.getElementById('seo-desc').value = data.description || "";
            document.getElementById('seo-keywords').value = data.keywords || "";
        }
    } catch (error) {
        console.error("Load SEO Error:", error);
    }
};

// ২. SEO ডাটা আপডেট করার ফাংশন
if (seoForm) {
    seoForm.onsubmit = async (e) => {
        e.preventDefault();

        const title = document.getElementById('seo-title').value.trim();
        const desc = document.getElementById('seo-desc').value.trim();
        const keywords = document.getElementById('seo-keywords').value.trim();

        try {
            // ডাটাবেসে 'websiteSettings' কালেকশনের ভেতর 'seo' ডকুমেন্টে সেভ করা
            await setDoc(doc(db, "websiteSettings", "seo"), {
                title: title,
                description: desc,
                keywords: keywords,
                updatedAt: new Date()
            });

            alert("অভিনন্দন! আপনার SEO সেটিংস সফলভাবে আপডেট হয়েছে। ✅");
        } catch (error) {
            console.error("Update SEO Error:", error);
            alert("সেটিংস সেভ করতে সমস্যা হয়েছে: " + error.message);
        }
    };
}

// পেজ লোড হলে আগের ডাটা নিয়ে আসো
loadSEOData();