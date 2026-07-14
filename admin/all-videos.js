// admin/all-videos.js
import { db } from "../firebase/firebase-config.js";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const tableBody = document.getElementById('admin-video-list');

const fetchAdminVideos = async () => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    tableBody.innerHTML = '';

    querySnapshot.forEach((vDoc) => {
        const video = vDoc.data();
        const row = `
            <tr>
                <td><img src="${video.thumbnail}" class="admin-thumb" style="width:80px; aspect-ratio:16/9; object-fit:cover; border-radius:5px;"></td>
                <td>${video.title}</td>
                <td>
                    <a href="edit-video.html?id=${vDoc.id}" class="btn" style="background:orange; color:black; padding:5px 10px; text-decoration:none; border-radius:5px; font-size:0.8rem; margin-right:5px;">এডিট</a>
                    <button class="del-btn" style="background:red; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;" onclick="deleteVideo('${vDoc.id}')">ডিলিট</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
};

window.deleteVideo = async (id) => {
    if (confirm("ভিডিওটি কি ডিলিট করতে চান?")) {
        await deleteDoc(doc(db, "videos", id));
        fetchAdminVideos();
    }
};
fetchAdminVideos();