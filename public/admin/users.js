// admin/users.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, doc, getDoc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const userTable = document.getElementById('user-list-table');

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; }
    document.getElementById('admin-loading').style.display = 'none';
    fetchUsers();
});

const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    userTable.innerHTML = '';

    querySnapshot.forEach((uDoc) => {
        const userData = uDoc.data();
        const isPremium = userData.premium || false;
        
        // তারিখ ফরম্যাট করা
        let expiryDate = "N/A";
        if (isPremium && userData.premiumExpireDate) {
            expiryDate = new Date(userData.premiumExpireDate).toLocaleDateString('bn-BD');
        }

        userTable.innerHTML += `
            <tr>
                <td>
                    <img src="${userData.photoURL || 'https://via.placeholder.com/40'}" class="user-avatar">
                    ${userData.name}
                </td>
                <td>${userData.email}</td>
                <td><span class="badge" style="background:#555">${userData.role}</span></td>
                <td>
                    <span class="badge ${isPremium ? 'badge-premium' : 'badge-free'}">
                        ${isPremium ? 'Premium' : 'Free'}
                    </span>
                </td>
                <td>${expiryDate}</td>
                <td>
                    ${isPremium ? 
                        `<button class="action-btn remove-btn" onclick="togglePremium('${uDoc.id}', false)">রিমুভ প্রিমিয়াম</button>` : 
                        `<button class="action-btn" style="background:green" onclick="togglePremium('${uDoc.id}', true)">প্রিমিয়াম দিন</button>`
                    }
                </td>
            </tr>
        `;
    });
};

// প্রিমিয়াম স্ট্যাটাস বদলানোর ফাংশন
window.togglePremium = async (uid, status) => {
    if (confirm(status ? "তাকে কি প্রিমিয়াম দিতে চান?" : "তার প্রিমিয়াম কি বাতিল করতে চান?")) {
        try {
            const userRef = doc(db, "users", uid);
            const updateData = { premium: status };
            
            if (status) {
                // ম্যানুয়ালি ১ মাসের মেয়াদ দেওয়া
                const exp = new Date();
                exp.setDate(exp.getDate() + 30);
                updateData.premiumExpireDate = exp.getTime();
                updateData.premiumPlan = "Manual (1 Month)";
            } else {
                updateData.premiumExpireDate = null;
                updateData.premiumPlan = null;
            }

            await updateDoc(userRef, updateData);
            alert("সফলভাবে আপডেট হয়েছে!");
            fetchUsers();
        } catch (error) {
            alert(error.message);
        }
    }
};