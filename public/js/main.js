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
            const genData = genSnap.data();
            const logoEl = document.querySelector('.logo');
            if (genData.logo) logoEl.innerHTML = `<img src="${genData.logo}" alt="${genData.name}" style="height: 60px; width: auto; object-fit: contain; display: block;">`;
            else logoEl.innerText = genData.name || "ViralLink Video";
        }
        const seoSnap = await getDoc(doc(db, "websiteSettings", "seo"));
        if (seoSnap.exists()) {
            const seoData = seoSnap.data();
            document.title = seoData.title || "ViralLink Video";
        }
    } catch (error) { console.error(error); }
};

const fetchCategories = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        querySnapshot.forEach((doc) => {
            const cat = doc.data();
            const pill = document.createElement('div');
            pill.className = 'cat-pill';
            pill.innerText = cat.name;
            pill.onclick = () => filterVideos(doc.id, pill);
            categoryBar.appendChild(pill);
        });
    } catch (error) { console.error(error); }
};

const renderVideos = (videos) => {
    videoList.innerHTML = '';
    if (videos.length === 0) {
        videoList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; margin-top: 20px;">কোনো ভিডিও পাওয়া যায়নি।</p>';
        return;
    }
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

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allVideosData.filter(v => v.title.toLowerCase().includes(term));
    renderVideos(filtered);
});

window.filterVideos = async (catId, element) => {
    document.querySelectorAll('.cat-pill').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    if (catId === 'all') {
        renderVideos(allVideosData);
    } else {
        // এখানে আপডেট করা হয়েছে: ভিডিওর ক্যাটাগরি লিস্টে catId আছে কি না চেক করছে
        const filtered = allVideosData.filter(v => v.categories && v.categories.includes(catId));
        renderVideos(filtered);
    }
};

const fetchAllVideos = async () => {
    try {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        allVideosData = [];
        querySnapshot.forEach((doc) => {
            allVideosData.push({ id: doc.id, ...doc.data() });
        });
        renderVideos(allVideosData);
    } catch (error) { console.error(error); }
};

loadSiteSettings();
fetchCategories();
fetchAllVideos();