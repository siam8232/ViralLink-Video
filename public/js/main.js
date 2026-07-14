// public/js/main.js

import { db } from "/firebase/firebase-config.js";
import { collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const videoList = document.getElementById('video-list');
const categoryBar = document.getElementById('category-bar');
const searchInput = document.getElementById('search-input');
let allVideosData = [];

// ১. ওয়েবসাইট সেটিংস (নাম ও লোগো) লোড করা
const loadSiteSettings = async () => {
    try {
        const genSnap = await getDoc(doc(db, "websiteSettings", "general"));
        if (genSnap.exists()) {
            const genData = genSnap.data();
            const logoEl = document.querySelector('.logo');
            if (genData.logo) logoEl.innerHTML = `<img src="${genData.logo}" alt="${genData.name}" style="height: 50px;">`;
            else logoEl.innerText = genData.name || "ViralLink Video";
        }
        
        const seoSnap = await getDoc(doc(db, "websiteSettings", "seo"));
        if (seoSnap.exists()) {
            document.title = seoSnap.data().title || "ViralLink Video";
        }
    } catch (e) { console.error("Settings Load Error:", e); }
};

// ২. ভিডিওগুলো স্ক্রিনে দেখানো (Render)
const renderVideos = (videos) => {
    videoList.innerHTML = videos.length ? '' : '<p style="grid-column:1/-1; text-align:center;">কোনো ভিডিও পাওয়া যায়নি।</p>';
    videos.forEach((video) => {
        videoList.innerHTML += `
            <a href="watch.html?v=${video.id}" class="video-card">
                <div class="thumb-box"><img src="${video.thumbnail}" class="thumbnail" loading="lazy"></div>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p><i class="fas fa-eye"></i> ${video.views || 0} ভিউজ</p>
                </div>
            </a>`;
    });
};

// ৩. সার্চ লজিক
if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allVideosData.filter(v => v.title.toLowerCase().includes(term));
        renderVideos(filtered);
    });
}

// ৪. ক্যাটাগরি ফিল্টার
window.filterVideos = (catId, element) => {
    document.querySelectorAll('.cat-pill').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    if (catId === 'all') renderVideos(allVideosData);
    else renderVideos(allVideosData.filter(v => v.category === catId));
};

// ৫. সবকিছু শুরু করা (Initialize)
const init = async () => {
    await loadSiteSettings();

    // ক্যাটাগরি লোড
    const catSnap = await getDocs(collection(db, "categories"));
    catSnap.forEach((doc) => {
        const cat = doc.data();
        const pill = document.createElement('div');
        pill.className = 'cat-pill';
        pill.innerText = cat.name;
        pill.onclick = () => filterVideos(doc.id, pill);
        categoryBar.appendChild(pill);
    });

    // ভিডিও লোড
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const vSnap = await getDocs(q);
    vSnap.forEach(doc => allVideosData.push({ id: doc.id, ...doc.data() }));
    renderVideos(allVideosData);
};

init();