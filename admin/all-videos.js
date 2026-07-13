// admin/all-videos.js (এডিট বাটনসহ আপডেট করা কোড)
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, query, orderBy, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const tableBody = document.getElementById('admin-video-list');

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; }
    document.getElementById('admin-loading').style.display = 'none';
    fetchAdminVideos();
});

const fetchAdminVideos = async () => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    tableBody.innerHTML = '';

    querySnapshot.forEach((vDoc) => {
        const video = vDoc.data();
        const row = `
            <tr>
                <td><img src="${video.thumbnail}" class="admin-thumb"></td>
                <td>${video.title}</td>
                <td>${video.views || 0}</td>
                <td>
                    <!-- এডিট বাটন: এটি ক্লিক করলে আইডি নিয়ে এডিট পেজে যাবে -->
                    <a href="edit-video.html?id=${vDoc.id}" class="btn" style="background:orange; padding:5px 10px; font-size:0.8rem; text-decoration:none;">
                        <i class="fas fa-edit"></i> এডিট
                    </a>
                    
                    <button class="del-btn" onclick="deleteVideo('${vDoc.id}')">
                        <i class="fas fa-trash"></i> ডিলিট
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
};

window.deleteVideo = async (id) => {
    if (confirm("আপনি কি নিশ্চিত যে এই ভিডিওটি ডিলিট করতে চান?")) {
        try {
            await deleteDoc(doc(db, "videos", id));
            alert("ভিডিও ডিলিট করা হয়েছে।");
            fetchAdminVideos();
        } catch (error) {
            alert("ভুল হয়েছে: " + error.message);
        }
    }
};