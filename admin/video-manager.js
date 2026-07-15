// public/admin/video-manager.js (Multi-Category Support)

import { db } from "../js/firebase-config.js";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const videoForm = document.getElementById('video-form');
const catListContainer = document.getElementById('v-category-list');

// ১. ডাটাবেস থেকে ক্যাটাগরিগুলো এনে চেক বক্স হিসেবে দেখানো
const loadCategories = async () => {
    try {
        const q = query(collection(db, "categories"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        
        catListContainer.innerHTML = ''; // লোডিং টেক্সট মুছে ফেলা
        
        if (querySnapshot.empty) {
            catListContainer.innerHTML = '<p style="font-size: 0.8rem; color: #555;">কোনো ক্যাটাগরি পাওয়া যায়নি।</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const cat = doc.data();
            catListContainer.innerHTML += `
                <label class="cat-item">
                    <input type="checkbox" name="categories" value="${doc.id}">
                    <span>${cat.name}</span>
                </label>
            `;
        });
    } catch (error) {
        console.error("Category Load Error:", error);
        catListContainer.innerHTML = '<p>ক্যাটাগরি লোড করা যায়নি</p>';
    }
};

// ২. ভিডিও সেভ করার ফাংশন
if (videoForm) {
    videoForm.onsubmit = async (e) => {
        e.preventDefault();

        const title = document.getElementById('v-title').value;
        const thumbnail = document.getElementById('v-thumb').value.trim();
        const description = document.getElementById('v-desc').value;
        let videoUrl = document.getElementById('v-url').value.trim();

        // সব সিলেক্ট করা ক্যাটাগরি একটি অ্যারে তে নেওয়া
        const selectedCategories = [];
        const checkboxes = document.querySelectorAll('input[name="categories"]:checked');
        checkboxes.forEach((checkbox) => {
            selectedCategories.push(checkbox.value);
        });

        if (selectedCategories.length === 0) {
            alert("দয়া করে অন্তত একটি ক্যাটাগরি সিলেক্ট করুন!");
            return;
        }

        // GitHub লিঙ্ক Raw তে রূপান্তর
        if (videoUrl.includes("github.com")) {
            videoUrl = videoUrl.replace("github.com", "raw.githubusercontent.com")
                               .replace("/blob/", "/")
                               .replace("/raw/", "/");
        }

        try {
            // ডাটাবেসে ভিডিও তথ্য পাঠানো (ক্যাটাগরি এখন একটি Array হিসেবে যাবে)
            await addDoc(collection(db, "videos"), {
                title: title,
                categories: selectedCategories, // এটি এখন মাল্টিপল সাপোর্ট করবে
                url: videoUrl,
                thumbnail: thumbnail,
                description: description,
                views: 0,
                createdAt: serverTimestamp()
            });

            alert("অভিনন্দন! ভিডিওটি মাল্টিপল ক্যাটাগরিসহ পাবলিশ হয়েছে। 🎉");
            videoForm.reset();
            // চেক বক্সগুলো রিসেট করা
            checkboxes.forEach(cb => cb.checked = false);
        } catch (error) {
            console.error("Video Upload Error:", error);
            alert("ভুল হয়েছে: " + error.message);
        }
    };
}

loadCategories();