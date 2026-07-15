// public/js/main.js
import { db } from "/firebase/firebase-config.js";
import { collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const videoList = document.getElementById('video-list');
const categoryBar = document.getElementById('category-bar');
const searchInput = document.getElementById('search-input');
let allVideosData = [];

// ১. ওয়েবসাইট সেটিংস এবং লোগো লোড করা
const loadSiteSettings = async () => {
    try {
        const genSnap = await getDoc(doc(db, "websiteSettings", "general"));
        if (genSnap.exists()) {
            const genData = genSnap.data();
            const logoEl = document.querySelector('.logo');
            if (genData.logo) {
                // লোগো সাইজ মোবাইলের জন্য অপ্টিমাইজ করা হয়েছে
                logoEl.innerHTML = `<img src="${genData.logo}" alt="${genData.name}" style="height: 45px; max-width: 180px; object-fit: contain;">`;
            } else {
                logoEl.innerText = genData.name || "ViralLink Video";
            }
        }

        const seoSnap = await getDoc(doc(db, "websiteSettings", "seo"));
        if (seoSnap.exists()) {
            document.title = seoSnap.data().title || "ViralLink Video";
        }
    } catch (error) { console.error("Settings Load Error:", error); }
};

// ২. ভিডিও কার্ড রেন্ডার করা (মোবাইল ও পিসির জন্য আলাদা লুক)
const renderVideos = (videos) => {
    videoList.innerHTML = '';
    if (videos.length === 0) {
        videoList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; margin-top: 20px;">কোনো ভিডিও পাওয়া যায়নি।</p>';
        return;
    }
    videos.forEach((video) => {
        videoList.innerHTML += `
            <a href="watch.html?v=${video.id}" class="video-card">
                <div class="thumb-box">
                    <img src="${video.thumbnail}" class="thumbnail" loading="lazy">
                </div>
                <div class="video-info">
                    <h3 title="${video.title}">${video.title}</h3>
                    <p style="font-size: 0.75rem; color: #888; margin-top:5px;">
                        <i class="fas fa-eye"></i> ${video.views || 0} ভিউজ
                    </p>
                </div>
            </a>`;
    });
};

// ৩. অ্যাডভান্সড সার্চ (টাইটেল + ডেসক্রিপশন)
if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtered = allVideosData.filter(v => {
            const titleMatch = v.title.toLowerCase().includes(term);
            const descMatch = v.description && v.description.toLowerCase().includes(term);
            return titleMatch || descMatch;
        });
        renderVideos(filtered);
    });
}

// ৪. ক্যাটাগরি ফিল্টার (মাল্টিপল সাপোর্ট)
window.filterVideos = async (catId, element) => {
    document.querySelectorAll('.cat-pill').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    if (catId === 'all') {
        renderVideos(allVideosData);
    } else {
        const filtered = allVideosData.filter(v => v.categories && v.categories.includes(catId));
        renderVideos(filtered);
    }
};

// ৫. ডাটাবেস থেকে ক্যাটাগরি আনা
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

// ৬. সব ভিডিও লোড করা
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

// স্টার্ট করা
loadSiteSettings();
fetchCategories();
fetchAllVideos();