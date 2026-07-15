// admin/video-manager.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById('video-form');
const catSelect = document.getElementById('v-category');
const thumbInput = document.getElementById('v-thumb');
const pImg = document.getElementById('p-img');

// ১. অ্যাডমিন চেক এবং ক্যাটাগরি লোড করা
onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; }
    
    await loadCategories();
    document.getElementById('admin-loading').style.display = 'none';
});

// ২. ডাটাবেস থেকে ক্যাটাগরি নিয়ে আসা
const loadCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    catSelect.innerHTML = '<option value="">ক্যাটাগরি বেছে নিন</option>';
    querySnapshot.forEach((doc) => {
        catSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
    });
};

thumbInput.oninput = () => {
    if (thumbInput.value) { pImg.src = thumbInput.value; pImg.style.display = 'block'; }
};

// ৩. ভিডিও সেভ করা
form.onsubmit = async (e) => {
    e.preventDefault();
    let videoUrl = document.getElementById('v-url').value;

    if (videoUrl.includes("github.com")) {
        videoUrl = videoUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/").replace("/raw/", "/");
    }

    try {
        await addDoc(collection(db, "videos"), {
            title: document.getElementById('v-title').value,
            category: catSelect.value, // ক্যাটাগরি আইডি সেভ করছি
            url: videoUrl,
            thumbnail: thumbInput.value,
            description: document.getElementById('v-desc').value,
            views: 0,
            createdAt: serverTimestamp()
        });
        alert("ভিডিও সফলভাবে আপলোড হয়েছে!");
        form.reset();
        pImg.style.display = 'none';
    } catch (error) {
        alert("ভুল হয়েছে: " + error.message);
    }
};