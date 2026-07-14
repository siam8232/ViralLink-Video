// admin/payments.js

import { db } from "../firebase/firebase-config.js";
import { collection, getDocs, doc, updateDoc, setDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const paymentList = document.getElementById('admin-payment-list');

// ১. ডাটাবেস থেকে পেন্ডিং পেমেন্টগুলো নিয়ে আসার ফাংশন
const fetchPayments = async () => {
    try {
        const q = query(collection(db, "premiumPayments"), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        paymentList.innerHTML = '';

        if (querySnapshot.empty) {
            paymentList.innerHTML = '<tr><td colspan="6" style="text-align:center;">কোনো নতুন পেমেন্ট রিকোয়েস্ট নেই।</td></tr>';
            return;
        }

        querySnapshot.forEach((pDoc) => {
            const pay = pDoc.data();
            const payID = pDoc.id;

            const row = `
                <tr>
                    <td>${pay.userName}<br><small style="color:#888;">${pay.userEmail}</small></td>
                    <td style="color:gold; font-weight:bold;">${pay.plan}<br><small>${pay.amount}৳</small></td>
                    <td>${pay.method}<br><small>${pay.senderNumber}</small></td>
                    <td><code>${pay.transactionId}</code></td>
                    <td><span class="status-badge status-pending">Pending</span></td>
                    <td>
                        <button class="approve-btn" onclick="approvePayment('${payID}', '${pay.uid}', '${pay.plan}', '${pay.userName}', '${pay.userEmail}')">Approve</button>
                        <button class="reject-btn" onclick="rejectPayment('${payID}')">X</button>
                    </td>
                </tr>
            `;
            paymentList.innerHTML += row;
        });
    } catch (error) {
        console.error("Fetch Payments Error:", error);
    }
};

// ২. পেমেন্ট অ্যাপ্রুভ করার ফাংশন (মেয়াদ হিসাবসহ)
window.approvePayment = async (payID, userUID, plan, name, email) => {
    if (confirm(`আপনি কি নিশ্চিত যে ${name}-এর পেমেন্টটি সঠিক?`)) {
        try {
            // প্ল্যান অনুযায়ী কত দিন মেয়াদ হবে তা ঠিক করা
            let days = 30;
            if (plan === "3 Months") days = 90;
            if (plan === "Yearly") days = 365;

            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + days);

            // ইউজারের প্রোফাইলে প্রিমিয়াম তথ্য সেভ করা
            const userRef = doc(db, "users", userUID);
            await setDoc(userRef, {
                uid: userUID,
                name: name,
                email: email,
                premium: true,
                premiumPlan: plan,
                premiumExpireDate: expiryDate.getTime()
            }, { merge: true });

            // পেমেন্ট রিকোয়েস্টের স্ট্যাটাস পরিবর্তন করা
            await updateDoc(doc(db, "premiumPayments", payID), {
                status: "approved"
            });

            alert("অভিনন্দন! প্রিমিয়াম মেম্বারশিপ সফলভাবে চালু হয়েছে। ✅");
            fetchPayments(); // তালিকা আপডেট করা
        } catch (error) {
            console.error("Approve Error:", error);
            alert("অ্যাপ্রুভ করতে সমস্যা হয়েছে: " + error.message);
        }
    }
};

// ৩. পেমেন্ট রিজেক্ট বা ডিলিট করা
window.rejectPayment = async (id) => {
    if (confirm("আপনি কি এই রিকোয়েস্টটি ডিলিট করতে চান?")) {
        try {
            await deleteDoc(doc(db, "premiumPayments", id));
            fetchPayments();
        } catch (error) {
            alert("ভুল হয়েছে: " + error.message);
        }
    }
};

// পেজ লোড হলে পেমেন্ট লিস্ট নিয়ে আসো
fetchPayments();