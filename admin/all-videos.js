// admin/all-videos.js

import { db } from "../firebase/firebase-config.js";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const tableBody = document.getElementById('admin-video-list');

// ১. ডাটাবেস থেকে সব ভিডিও নিয়ে আসার ফাংশন
const fetchAdminVideos = async () => {
    try {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        tableBody.innerHTML = ''; // টেবিল পরিষ্কার করা

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">কোনো ভিডিও আপলোড করা হয়নি।</td></tr>';
            return;
        }

        querySnapshot.forEach((vDoc) => {
            const video = vDoc.data();
            const videoID = vDoc.id;

            // টেবিলের জন্য একেকটি রো (Row) তৈরি করা
            const row = `
                <tr>
                    <td><img src="${video.thumbnail}" class="admin-thumb" onerror="this.src='https://placehold.co/100x60?text=No+Image'"></td>
                    <td style="font-weight:600;">${video.title}</td>
                    <td><i class="fas fa-eye"></i> ${video.views || 0}</td>
                    <td>
                        <button class="del-btn" onclick="deleteVideo('${videoID}')">
                            <i class="fas fa-trash"></i> ডিলিট
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error fetching videos:", error);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">ভিডিও লোড করতে সমস্যা হয়েছে।</td></tr>';
    }
};

// ২. ভিডিও ডিলিট করার ফাংশন
// এটি window অবজেক্টে সেট করা হয়েছে যাতে HTML বাটন থেকে এটি কাজ করে
window.deleteVideo = async (id) => {
    const confirmation = confirm("আপনি কি নিশ্চিত যে এই ভিডিওটি ডিলিট করতে চান? এটি আর ফিরে পাওয়া যাবে না।");
    
    if (confirmation) {
        try {
            await deleteDoc(doc(db, "videos", id));
            alert("ভিডিওটি সফলভাবে ডিলিট করা হয়েছে। ✅");
            fetchAdminVideos(); // তালিকা আপডেট করা
        } catch (error) {
            console.error("Delete Error:", error);
            alert("ডিলিট করতে সমস্যা হয়েছে: " + error.message);
        }
    }
};

// পেজ লোড হলে ভিডিওগুলো নিয়ে আসো
fetchAdminVideos();