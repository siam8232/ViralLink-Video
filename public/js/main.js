// public/js/main.js
import { db } from "./firebase-config.js";
import { collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const videoList = document.getElementById('video-list');
const categoryBar = document.getElementById('category-bar');
const searchInput = document.getElementById('search-input');
let allVideosData = [];

const loadSiteSettings = async () => {
    try {
        const genSnap = await getDoc(doc(db, "websiteSettings", "general"));
        if (genSnap.exists()) {
            const genData = genSnap.data();
            const logoEl = document.querySelector('.logo');
            if (genData.logo) logoEl.innerHTML = `<img src="${genData.logo}" alt="${genData.name}" style="height: 60px;">`;
            else logoEl.innerText = genData.name || "ViralLink Video";
        }
        const seoSnap = await getDoc(doc(db, "websiteSettings", "seo"));
        if (seoSnap.exists()) {
            const data = seoSnap.data();
            document.title = data.title;
        }
    } catch (e) { console.error(e); }
};

const renderVideos = (videos) => {
    videoList.innerHTML = '';
    videos.forEach((video) => {
        videoList.innerHTML += `
            <a href="watch.html?v=${video.id}" class="video-card">
                <div class="thumb-box"><img src="${video.thumbnail}" class="thumbnail"></div>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p><i class="fas fa-eye"></i> ${video.views || 0} ভিউজ</p>
                </div>
            </a>`;
    });
};

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    renderVideos(allVideosData.filter(v => v.title.toLowerCase().includes(term)));
});

window.filterVideos = (catId, element) => {
    document.querySelectorAll('.cat-pill').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    if (catId === 'all') renderVideos(allVideosData);
    else renderVideos(allVideosData.filter(v => v.category === catId));
};

const init = async () => {
    await loadSiteSettings();
    const catSnap = await getDocs(collection(db, "categories"));
    catSnap.forEach(doc => {
        const pill = document.createElement('div');
        pill.className = 'cat-pill'; pill.innerText = doc.data().name;
        pill.onclick = () => filterVideos(doc.id, pill);
        categoryBar.appendChild(pill);
    });
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const vSnap = await getDocs(q);
    vSnap.forEach(doc => allVideosData.push({ id: doc.id, ...doc.data() }));
    renderVideos(allVideosData);
};
init();