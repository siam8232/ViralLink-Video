// admin/users.js

import { db } from "../firebase/firebase-config.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const userTableBody = document.getElementById('admin-user-list');

// ডাটাবেস থেকে সব ইউজার নিয়ে আসার ফাংশন
const fetchUsers = async () => {
    try {
        // ইউজারদের নতুন থেকে পুরনো সিরিয়ালে সাজানো (যদি createdAt থাকে)
        const querySnapshot = await getDocs(collection(db, "users"));
        
        userTableBody.innerHTML = ''; // টেবিল পরিষ্কার করা

        if (querySnapshot.empty) {
            userTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">কোনো ইউজার পাওয়া যায়নি।</td></tr>';
            return;
        }

        querySnapshot.forEach((uDoc) => {
            const user = uDoc.data();
            
            // প্রিমিয়াম মেয়াদ শেষ হওয়ার তারিখ ফরম্যাট করা
            let expiryDate = "N/A";
            if (user.premium && user.premiumExpireDate) {
                expiryDate = new Date(user.premiumExpireDate).toLocaleDateString('bn-BD');
            }

            const row = `
                <tr>
                    <td>
                        <img src="${user.photoURL || 'https://via.placeholder.com/40'}" class="user-avatar">
                        <span style="font-weight:600;">${user.name || 'Unknown'}</span>
                    </td>
                    <td>${user.email}</td>
                    <td>
                        <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-free'}">
                            ${user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${user.premium ? 'badge-premium' : 'badge-free'}">
                            ${user.premium ? 'Premium' : 'Free'}
                        </span>
                    </td>
                    <td>${expiryDate}</td>
                </tr>
            `;
            userTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Fetch Users Error:", error);
        userTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">ইউজার লোড করতে সমস্যা হয়েছে।</td></tr>';
    }
};

// পেজ লোড হলে ইউজার লিস্ট নিয়ে আসো
fetchUsers();