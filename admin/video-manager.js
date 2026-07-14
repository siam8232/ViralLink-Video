// admin/video-manager.js

import { db } from "../firebase/firebase-config.js";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const videoForm = document.getElementById('video-form');
const catSelect = document.getElementById('v-category');

// ১. ডাটাবেস থেকে ক্যাটাগরিগুলো এনে ড্রপডাউনে বসানো
const loadCategories = async () => {
    try {
        const q = query(collection(db, "categories"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        
        catSelect.innerHTML = '<option value="">একটি ক্যাটাগরি বেছে নিন</option>';
        
        querySnapshot.forEach((doc) => {
            const cat = doc.data();
            catSelect.innerHTML += `<option value="${doc.id}">${cat.name}</option>`;
        });
    } catch (error) {
        console.error("Category Load Error:", error);
        catSelect.innerHTML = '<option value="">ক্যাটাগরি লোড করা যায়নি</option>';
    }
};

// ২. ভিডিও সেভ করার ফাংশন
if (videoForm) {
    videoForm.onsubmit = async (e) => {
        e.preventDefault();

        const title = document.getElementById('v-title').value;
        const category = document.getElementById('v-category').value;
        let videoInput = document.getElementById('v-url').value.trim();
        const thumbnail = document.getElementById('v-thumb').value.trim();
        const description = document.getElementById('v-desc').value;

        let videoType = "direct"; // ডিফল্ট টাইপ

        // ৩. আইফ্রেম নাকি লিঙ্ক তা চেক করা
        if (videoInput.toLowerCase().startsWith("<iframe")) {
            videoType = "embed"; // এটি একটি আইফ্রেম কোড
        } else if (videoInput.includes("github.com")) {
            // ৪. গিটহাব লিঙ্ক হলে সেটিকে Raw লিঙ্কে রূপান্তর করা
            videoInput = videoInput.replace("github.com", "raw.githubusercontent.com")
                                   .replace("/blob/", "/")
                                   .replace("/raw/", "/");
            videoType = "direct";
        }

        try {
            // ৫. ফায়ারবেস ডাটাবেসে ভিডিওর তথ্য পাঠানো
            await addDoc(collection(db, "videos"), {
                title: title,
                category: category,
                url: videoInput,
                videoType: videoType,
                thumbnail: thumbnail,
                description: description,
                views: 0,
                createdAt: serverTimestamp()
            });

            alert("অভিনন্দন! ভিডিওটি সফলভাবে পাবলিশ হয়েছে। 🎉");
            videoForm.reset(); // ফর্ম খালি করে ফেলা
        } catch (error) {
            console.error("Video Upload Error:", error);
            alert("ভিডিও আপলোড করতে সমস্যা হয়েছে: " + error.message);
        }
    };
}

// পেজ লোড হওয়ার সাথে সাথে ক্যাটাগরি লোড শুরু করো
loadCategories();