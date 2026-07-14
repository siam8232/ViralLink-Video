// public/js/main.js
import { db } from "/firebase/firebase-config.js";
import { collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const videoList = document.getElementById('video-list');
const categoryBar = document.getElementById('category-bar');
const searchInput = document.getElementById('search-input');
let allVideosData = [];

const loadSiteSettings = async () => {
    try {
        const genSnap = await getDoc(doc(db, "websiteSettings", "general"));
        if (genSnap.exists()) {
            const data = genSnap.data();
            const logoEl = document.querySelector('.logo');
            if (data.logo) logoEl.innerHTML = `<img src="${data.logo}" style="height: 50px;">`;
            else logoEl.innerText = data.name;
        }
        const seoSnap = await getDoc(doc(db, "websiteSettings", "seo"));
        if (seoSnap.exists()) document.title = seoSnap.data().title;
    } catch (e) { console.error(e); }
};

const renderVideos = (videos) => {
    videoList.innerHTML = videos.length ? '' : '<p style="grid-column:1/-1; text-align:center;">কোনো ভিডিও পাওয়া যায়নি।</p>';
    videos.forEach((v) => {
        videoList.innerHTML += `
            <a href="watch.html?v=${v.id}" class="video-card">
                <div class="thumb-box"><img src="${v.thumbnail}" class="thumbnail"></div>
                <div class="video-info"><h3>${v.title}</h3><p><i class="fas fa-eye"></i> ${v.views || 0} ভিউজ</p></div>
            </a>`;
    });
};

const init = async () => {
    await loadSiteSettings();
    
    // ক্যাটাগরি লোড
    const cSnap = await getDocs(collection(db, "categories"));
    cSnap.forEach(doc => {
        const cat = doc.data();
        const pill = document.createElement('div');
        pill.className = 'cat-pill'; pill.innerText = cat.name;
        pill.onclick = () => {
            document.querySelectorAll('.cat-pill').forEach(el => el.classList.remove('active'));
            pill.classList.add('active');
            renderVideos(allVideosData.filter(v => v.category === doc.id));
        };
        categoryBar.appendChild(pill);
    });

    // ভিডিও লোড
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const vSnap = await getDocs(q);
    vSnap.forEach(doc => allVideosData.push({ id: doc.id, ...doc.data() }));
    renderVideos(allVideosData);
};

if(searchInput) {
    searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        renderVideos(allVideosData.filter(v => v.title.toLowerCase().includes(term)));
    };
}

init();