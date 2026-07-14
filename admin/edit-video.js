// admin/edit-video.js (সম্পূর্ণ আপডেট করা কোড)

import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById('edit-form');
const catSelect = document.getElementById('v-category');
const urlParams = new URLSearchParams(window.location.search);
const videoID = urlParams.get('id');

// ১. অ্যাডমিন চেক এবং ডাটা লোড করা
onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") {
        window.location.href = "/";
        return;
    }

    // ২. প্রথমে ক্যাটাগরিগুলো লোড করা
    await loadCategories();

    // ৩. এরপর ভিডিওর তথ্য নিয়ে আসা
    const docRef = doc(db, "videos", videoID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const video = docSnap.data();
        document.getElementById('v-title').value = video.title;
        document.getElementById('v-url').value = video.url;
        document.getElementById('v-thumb').value = video.thumbnail;
        document.getElementById('v-desc').value = video.description;
        document.getElementById('p-img').src = video.thumbnail;
        
        // ভিডিওর আগের ক্যাটাগরি ড্রপডাউনে সিলেক্ট করা
        if (video.category) {
            catSelect.value = video.category;
        }

        document.getElementById('admin-loading').style.display = 'none';
    } else {
        alert("ভিডিওটি পাওয়া যায়নি!");
        window.location.href = "all-videos.html";
    }
});

// ৪. ক্যাটাগরি লোড করার ফাংশন
const loadCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    catSelect.innerHTML = '<option value="">ক্যাটাগরি বেছে নিন</option>';
    querySnapshot.forEach((doc) => {
        catSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
    });
};

// ৫. তথ্য আপডেট করা
form.onsubmit = async (e) => {
    e.preventDefault();
    
    let videoUrl = document.getElementById('v-url').value;
    
    // GitHub লিঙ্ক কনভার্ট
    if (videoUrl.includes("github.com") && !videoUrl.includes("raw.githubusercontent.com")) {
        videoUrl = videoUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/").replace("/raw/", "/");
    }

    try {
        const docRef = doc(db, "videos", videoID);
        await updateDoc(docRef, {
            title: document.getElementById('v-title').value,
            category: catSelect.value, // নতুন ক্যাটাগরি সেভ করছি
            url: videoUrl,
            thumbnail: document.getElementById('v-thumb').value,
            description: document.getElementById('v-desc').value
        });
        alert("ভিডিও সফলভাবে আপডেট হয়েছে! ✅");
        window.location.href = "all-videos.html";
    } catch (error) {
        alert("ভুল হয়েছে: " + error.message);
    }
};