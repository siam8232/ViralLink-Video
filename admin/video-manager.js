// admin/video-manager.js

import { auth, db } from "../firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById('video-form');
const catSelect = document.getElementById('v-category');

// ১. অ্যাডমিন চেক এবং ক্যাটাগরি লোড
onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; return; }
    
    // ক্যাটাগরি লোড করা
    const querySnapshot = await getDocs(collection(db, "categories"));
    catSelect.innerHTML = '<option value="">ক্যাটাগরি বেছে নিন</option>';
    querySnapshot.forEach((doc) => {
        catSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
    });
    document.getElementById('admin-loading').style.display = 'none';
});

// ২. ভিডিও সেভ করার ফাংশন
if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        let videoInput = document.getElementById('v-url').value.trim();
        let videoType = "direct"; // ডিফল্টভাবে লিঙ্ক

        // ৩. আইফ্রেম (Embed) নাকি লিঙ্ক তা চেক করা
        if (videoInput.toLowerCase().startsWith("<iframe")) {
            videoType = "embed";
        } else if (videoInput.includes("github.com")) {
            // ৪. গিটহাব লিঙ্ক হলে সেটিকে Raw করা
            videoInput = videoInput.replace("github.com", "raw.githubusercontent.com")
                                   .replace("/blob/", "/")
                                   .replace("/raw/", "/");
            videoType = "direct";
        }

        try {
            await addDoc(collection(db, "videos"), {
                title: document.getElementById('v-title').value,
                category: catSelect.value,
                url: videoInput,
                videoType: videoType, // টাইপ সেভ করা হচ্ছে
                thumbnail: document.getElementById('v-thumb').value.trim(),
                description: document.getElementById('v-desc').value,
                views: 0,
                createdAt: serverTimestamp()
            });

            alert("ভিডিও সফলভাবে পাবলিশ হয়েছে! 🎉");
            form.reset();
        } catch (error) {
            alert("ভুল হয়েছে: " + error.message);
        }
    };
}