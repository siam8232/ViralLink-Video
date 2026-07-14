// public/admin/video-manager.js
import { auth, db } from "../js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById('video-form');
const catSelect = document.getElementById('v-category');
const thumbInput = document.getElementById('v-thumb');
const pImg = document.getElementById('p-img');

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; }
    
    const querySnapshot = await getDocs(collection(db, "categories"));
    catSelect.innerHTML = '<option value="">ক্যাটাগরি বেছে নিন</option>';
    querySnapshot.forEach((doc) => {
        catSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
    });
    document.getElementById('admin-loading').style.display = 'none';
});

thumbInput.oninput = () => { if (thumbInput.value) { pImg.src = thumbInput.value; pImg.style.display = 'block'; } };

form.onsubmit = async (e) => {
    e.preventDefault();
    let videoInput = document.getElementById('v-url').value.trim();
    let videoType = "direct"; 

    if (videoInput.toLowerCase().startsWith("<iframe")) {
        videoType = "embed";
    } else if (videoInput.includes("github.com")) {
        videoInput = videoInput.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/").replace("/raw/", "/");
    }

    try {
        await addDoc(collection(db, "videos"), {
            title: document.getElementById('v-title').value,
            category: catSelect.value,
            url: videoInput, 
            videoType: videoType, 
            thumbnail: thumbInput.value,
            description: document.getElementById('v-desc').value,
            views: 0,
            createdAt: serverTimestamp()
        });
        alert("ভিডিও সফলভাবে পাবলিশ হয়েছে! 🎉");
        form.reset();
        pImg.style.display = 'none';
    } catch (error) { alert("ভুল হয়েছে: " + error.message); }
};