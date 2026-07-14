// admin/categories.js

import { db } from "../firebase/firebase-config.js";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const catForm = document.getElementById('cat-form');
const catTableBody = document.getElementById('admin-cat-list');

// ১. ডাটাবেস থেকে সব ক্যাটাগরি নিয়ে এসে টেবিলে দেখানো
const fetchCategories = async () => {
    try {
        const q = query(collection(db, "categories"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        catTableBody.innerHTML = ''; // আগের ডাটা মুছে ফেলা

        if (querySnapshot.empty) {
            catTableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">কোনো ক্যাটাগরি যোগ করা হয়নি।</td></tr>';
            return;
        }

        querySnapshot.forEach((cDoc) => {
            const cat = cDoc.data();
            const catID = cDoc.id;

            const row = `
                <tr>
                    <td style="font-weight:600; font-size:1rem; color:gold;">${cat.name}</td>
                    <td>
                        <button class="del-btn" onclick="deleteCategory('${catID}')">
                            <i class="fas fa-trash"></i> ডিলিট
                        </button>
                    </td>
                </tr>
            `;
            catTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Fetch Categories Error:", error);
    }
};

// ২. নতুন ক্যাটাগরি যোগ করার ফাংশন
if (catForm) {
    catForm.onsubmit = async (e) => {
        e.preventDefault();
        const catName = document.getElementById('cat-name').value.trim();

        try {
            await addDoc(collection(db, "categories"), {
                name: catName,
                createdAt: serverTimestamp()
            });

            alert("ক্যাটাগরি সফলভাবে যোগ হয়েছে! ✅");
            catForm.reset(); // ইনপুট বক্স খালি করা
            fetchCategories(); // তালিকা আপডেট করা
        } catch (error) {
            console.error("Add Category Error:", error);
            alert("ক্যাটাগরি যোগ করতে সমস্যা হয়েছে।");
        }
    };
}

// ৩. ক্যাটাগরি ডিলিট করার ফাংশন
window.deleteCategory = async (id) => {
    if (confirm("আপনি কি নিশ্চিত যে এই ক্যাটাগরি ডিলিট করতে চান?")) {
        try {
            await deleteDoc(doc(db, "categories", id));
            fetchCategories(); // তালিকা আপডেট করা
        } catch (error) {
            console.error("Delete Category Error:", error);
            alert("ডিলিট করতে সমস্যা হয়েছে।");
        }
    }
};

// পেজ লোড হলে ক্যাটাগরিগুলো নিয়ে আসো
fetchCategories();