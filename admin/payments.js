// admin/payments.js (এরর সমাধান করা ভার্সন)
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const paymentList = document.getElementById('payment-list');

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "/"; return; }
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") { window.location.href = "/"; }
    document.getElementById('admin-loading').style.display = 'none';
    fetchPayments();
});

const fetchPayments = async () => {
    const q = query(collection(db, "premiumPayments"), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    paymentList.innerHTML = '';

    querySnapshot.forEach((pDoc) => {
        const pay = pDoc.data();
        paymentList.innerHTML += `
            <tr>
                <td>${pay.userName}<br><small>${pay.userEmail}</small></td>
                <td><b>${pay.plan}</b></td>
                <td>${pay.amount}৳</td>
                <td>${pay.method}<br>${pay.senderNumber}</td>
                <td><code>${pay.transactionId}</code></td>
                <td><span class="status-badge status-pending">Pending</span></td>
                <td>
                    <button class="approve-btn" onclick="approvePayment('${pDoc.id}', '${pay.uid}', '${pay.plan}', '${pay.userName}', '${pay.userEmail}')">Approve</button>
                    <button class="reject-btn" onclick="rejectPayment('${pDoc.id}')">X</button>
                </td>
            </tr>
        `;
    });
};

window.approvePayment = async (payID, userUID, plan, name, email) => {
    if (confirm("আপনি কি নিশ্চিত এই পেমেন্টটি ভেরিফাই করেছেন?")) {
        try {
            let days = 30;
            if (plan === "3 Months") days = 90;
            if (plan === "Yearly") days = 365;

            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + days);

            // স্মার্ট আপডেট: ইউজার না থাকলে তৈরি করবে, থাকলে আপডেট করবে (merge: true)
            const userRef = doc(db, "users", userUID);
            await setDoc(userRef, {
                uid: userUID,
                name: name,
                email: email,
                premium: true,
                premiumPlan: plan,
                premiumExpireDate: expiryDate.getTime()
            }, { merge: true });

            // পেমেন্ট রিকোয়েস্ট আপডেট করা
            await updateDoc(doc(db, "premiumPayments", payID), {
                status: "approved"
            });

            alert("প্রিমিয়াম মেম্বারশিপ এক্টিভেট করা হয়েছে! ✅");
            fetchPayments();
        } catch (error) {
            console.error("Error:", error);
            alert("ভুল হয়েছে: " + error.message);
        }
    }
};

window.rejectPayment = async (id) => {
    if (confirm("রিকোয়েস্টটি ডিলিট করতে চান?")) {
        await deleteDoc(doc(db, "premiumPayments", id));
        fetchPayments();
    }
};