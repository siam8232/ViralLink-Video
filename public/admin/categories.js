// admin/categories.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const catForm = document.getElementById('cat-form');
const catList = document.getElementById('cat-list');

// ১. অ্যাডমিন চেক
onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; }
    document.getElementById('admin-loading').style.display = 'none';
    fetchCategories();
});

// ২. ক্যাটাগরি লিস্ট লোড করা
const fetchCategories = async () => {
    const q = query(collection(db, "categories"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    catList.innerHTML = '';

    querySnapshot.forEach((cDoc) => {
        const cat = cDoc.data();
        const row = `
            <tr>
                <td>${cat.name}</td>
                <td>
                    <button class="del-btn" onclick="deleteCategory('${cDoc.id}')">
                        <i class="fas fa-trash"></i> ডিলিট
                    </button>
                </td>
            </tr>
        `;
        catList.innerHTML += row;
    });
};

// ৩. নতুন ক্যাটাগরি যোগ করা
catForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('cat-name').value;

    try {
        await addDoc(collection(db, "categories"), {
            name: name,
            createdAt: serverTimestamp()
        });
        document.getElementById('cat-name').value = '';
        fetchCategories();
        alert("ক্যাটাগরি যোগ হয়েছে!");
    } catch (error) {
        alert("এরর: " + error.message);
    }
};

// ৪. ক্যাটাগরি ডিলিট করা
window.deleteCategory = async (id) => {
    if (confirm("আপনি কি নিশ্চিত?")) {
        try {
            await deleteDoc(doc(db, "categories", id));
            fetchCategories();
        } catch (error) {
            alert(error.message);
        }
    }
};