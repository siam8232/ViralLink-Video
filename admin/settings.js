// admin/settings.js

import { db } from "../firebase/firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const settingsForm = document.getElementById('settings-form');
const logoInput = document.getElementById('site-logo');
const pBox = document.getElementById('p-box');
const pImg = document.getElementById('p-img');

// ১. আগে থেকে সেভ করা সেটিংস ডাটাবেস থেকে নিয়ে আসার ফাংশন
const loadSettings = async () => {
    try {
        const snap = await getDoc(doc(db, "websiteSettings", "general"));
        if (snap.exists()) {
            const data = snap.data();
            document.getElementById('site-name').value = data.name || "";
            document.getElementById('site-logo').value = data.logo || "";
            document.getElementById('site-footer').value = data.footer || "";
            
            // লোগো প্রিভিউ দেখানো
            if (data.logo) {
                pImg.src = data.logo;
                pBox.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error("Load Settings Error:", error);
    }
};

// ২. লোগোর লিঙ্ক টাইপ করার সময় প্রিভিউ দেখানো
logoInput.oninput = () => {
    if (logoInput.value.trim() !== "") {
        pImg.src = logoInput.value;
        pBox.style.display = 'flex';
    } else {
        pBox.style.display = 'none';
    }
};

// ৩. সেটিংস আপডেট করার ফাংশন
if (settingsForm) {
    settingsForm.onsubmit = async (e) => {
        e.preventDefault();

        const name = document.getElementById('site-name').value.trim();
        const logo = document.getElementById('site-logo').value.trim();
        const footer = document.getElementById('site-footer').value.trim();

        try {
            await setDoc(doc(db, "websiteSettings", "general"), {
                name: name,
                logo: logo,
                footer: footer,
                updatedAt: new Date()
            });

            alert("দারুণ! ওয়েবসাইট সেটিংস সফলভাবে আপডেট হয়েছে। 🎉");
        } catch (error) {
            console.error("Update Settings Error:", error);
            alert("সেটিংস সেভ করতে সমস্যা হয়েছে: " + error.message);
        }
    };
}

// পেজ লোড হলে আগের ডাটা নিয়ে আসো
loadSettings();