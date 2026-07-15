// admin/video-manager.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById('video-form');
const catListContainer = document.getElementById('v-category-list');
const thumbInput = document.getElementById('v-thumb');
const pImg = document.getElementById('p-img');

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; }
    
    await loadCategories();
    document.getElementById('admin-loading').style.display = 'none';
});

const loadCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    catListContainer.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const cat = doc.data();
        catListContainer.innerHTML += `
            <label class="cat-item">
                <input type="checkbox" name="categories" value="${doc.id}">
                <span>${cat.name}</span>
            </label>
        `;
    });
};

thumbInput.oninput = () => {
    if (thumbInput.value) { pImg.src = thumbInput.value; pImg.style.display = 'block'; }
};

form.onsubmit = async (e) => {
    e.preventDefault();

    // সব সিলেক্ট করা ক্যাটাগরি সংগ্রহ করা
    const selectedCats = [];
    document.querySelectorAll('input[name="categories"]:checked').forEach(cb => {
        selectedCats.push(cb.value);
    });

    if (selectedCats.length === 0) {
        alert("দয়া করে অন্তত একটি ক্যাটাগরি সিলেক্ট করুন!");
        return;
    }

    let videoUrl = document.getElementById('v-url').value;
    if (videoUrl.includes("github.com")) {
        videoUrl = videoUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/").replace("/raw/", "/");
    }

    try {
        await addDoc(collection(db, "videos"), {
            title: document.getElementById('v-title').value,
            categories: selectedCats, // Array হিসেবে সেভ হচ্ছে
            url: videoUrl,
            thumbnail: thumbInput.value,
            description: document.getElementById('v-desc').value,
            views: 0,
            createdAt: serverTimestamp()
        });
        alert("ভিডিও সফলভাবে আপলোড হয়েছে!");
        form.reset();
        pImg.style.display = 'none';
        document.querySelectorAll('input[name="categories"]').forEach(cb => cb.checked = false);
    } catch (error) {
        alert("ভুল হয়েছে: " + error.message);
    }
};