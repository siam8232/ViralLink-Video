// public/js/main.js (লোগো সাইজ ঠিক করে আপডেট করা)
import { db } from "/firebase/firebase-config.js";
import { collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const videoList = document.getElementById('video-list');
const categoryBar = document.getElementById('category-bar');
const searchInput = document.getElementById('search-input');

let allVideosData = [];

// ১. ওয়েবসাইট সেটিংস লোড করা
const loadSiteSettings = async () => {
    try {
        const genSnap = await getDoc(doc(db, "websiteSettings", "general"));
        if (genSnap.exists()) {
            const genData = genSnap.data();
            const logoEl = document.querySelector('.logo');
            if (genData.logo) {
                // এখানে লোগোর সাইজ বাড়ানো হয়েছে (height: 60px)
                logoEl.innerHTML = `<img src="${genData.logo}" alt="${genData.name}" style="height: 60px; width: auto; object-fit: contain; display: block;">`;
            } else {
                logoEl.innerText = genData.name || "ViralLink Video";
            }
        }

        const seoSnap = await getDoc(doc(db, "websiteSettings", "seo"));
        if (seoSnap.exists()) {
            const seoData = seoSnap.data();
            document.title = seoData.title || "ViralLink Video";
            
            let metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
            metaDesc.name = "description";
            metaDesc.content = seoData.description;
            document.head.appendChild(metaDesc);

            let metaKey = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
            metaKey.name = "keywords";
            metaKey.content = seoData.keywords;
            document.head.appendChild(metaKey);
        }
    } catch (error) { console.error("Settings Load Error:", error); }
};

// ২. ডাটাবেস থেকে ক্যাটাগরি আনা
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

// ৩. ভিডিও রেন্ডার করা
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
            </a>
        `;
    });
};

// ৪. সার্চ লজিক
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allVideosData.filter(v => v.title.toLowerCase().includes(term));
    renderVideos(filtered);
});

// ৫. ক্যাটাগরি ফিল্টার
window.filterVideos = async (catId, element) => {
    document.querySelectorAll('.cat-pill').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    if (catId === 'all') renderVideos(allVideosData);
    else renderVideos(allVideosData.filter(v => v.category === catId));
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

loadSiteSettings();
fetchCategories();
fetchAllVideos();