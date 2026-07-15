// admin/edit-video.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById('edit-form');
const catListContainer = document.getElementById('v-category-list');
const urlParams = new URLSearchParams(window.location.search);
const videoID = urlParams.get('id');

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; return; }

    await loadCategories();

    const docRef = doc(db, "videos", videoID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const video = docSnap.data();
        document.getElementById('v-title').value = video.title;
        document.getElementById('v-url').value = video.url;
        document.getElementById('v-thumb').value = video.thumbnail;
        document.getElementById('v-desc').value = video.description;
        document.getElementById('p-img').src = video.thumbnail;
        
        // পুরনো ক্যাটাগরিগুলো টিক দেওয়া
        if (video.categories) {
            video.categories.forEach(catId => {
                const cb = document.querySelector(`input[value="${catId}"]`);
                if (cb) cb.checked = true;
            });
        }
        document.getElementById('admin-loading').style.display = 'none';
    }
});

const loadCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    catListContainer.innerHTML = '';
    querySnapshot.forEach((doc) => {
        catListContainer.innerHTML += `
            <label class="cat-item">
                <input type="checkbox" name="categories" value="${doc.id}">
                <span>${doc.data().name}</span>
            </label>
        `;
    });
};

form.onsubmit = async (e) => {
    e.preventDefault();
    const selectedCats = [];
    document.querySelectorAll('input[name="categories"]:checked').forEach(cb => selectedCats.push(cb.value));

    let videoUrl = document.getElementById('v-url').value;
    if (videoUrl.includes("github.com") && !videoUrl.includes("raw.githubusercontent.com")) {
        videoUrl = videoUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/").replace("/raw/", "/");
    }

    try {
        await updateDoc(doc(db, "videos", videoID), {
            title: document.getElementById('v-title').value,
            categories: selectedCats,
            url: videoUrl,
            thumbnail: document.getElementById('v-thumb').value,
            description: document.getElementById('v-desc').value
        });
        alert("ভিডিও সফলভাবে আপডেট হয়েছে!");
        window.location.href = "all-videos.html";
    } catch (error) { alert(error.message); }
};