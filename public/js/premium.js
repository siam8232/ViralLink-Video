// public/js/premium.js

import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentUID = null;
let currentUserName = null;
let currentUserEmail = null;

// ১. ইউজারের অবস্থা চেক করা (লগইন ছাড়া পেমেন্ট করা যাবে না)
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUID = user.uid;
        currentUserName = user.displayName;
        currentUserEmail = user.email;
    } else {
        alert("পেমেন্ট করতে হলে আপনাকে প্রথমে লগইন করতে হবে!");
        window.location.href = "/";
    }
});

// ২. পেমেন্ট ফর্ম সাবমিট হ্যান্ডেল করা
const paymentForm = document.getElementById('payment-form');
if (paymentForm) {
    paymentForm.onsubmit = async (e) => {
        e.preventDefault();

        // ফরম থেকে ডাটা নেওয়া
        const plan = document.getElementById('selected-plan').value;
        const price = document.getElementById('selected-price').value;
        const method = document.getElementById('selected-method').value;
        const senderNum = document.getElementById('sender-num').value.trim();
        const trxId = document.getElementById('trx-id').value.trim();

        // তথ্য চেক করা (Validation)
        if (!plan) {
            alert("দয়া করে একটি প্রিমিয়াম প্ল্যান সিলেক্ট করুন!");
            return;
        }
        if (!method) {
            alert("দয়া করে একটি পেমেন্ট মাধ্যম (bKash/Nagad) সিলেক্ট করুন!");
            return;
        }

        try {
            // ৩. ডাটাবেসে পেমেন্ট রিকোয়েস্ট পাঠানো
            await addDoc(collection(db, "premiumPayments"), {
                uid: currentUID,
                userName: currentUserName,
                userEmail: currentUserEmail,
                plan: plan,
                amount: price,
                method: method,
                senderNumber: senderNum,
                transactionId: trxId,
                status: "pending", // শুরুতে স্ট্যাটাস থাকবে পেন্ডিং
                submittedAt: serverTimestamp()
            });

            alert("ধন্যবাদ! আপনার পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে। অ্যাডমিন ভেরিফাই করলে আপনার প্রিমিয়াম এক্টিভেট হবে। 🎉");
            window.location.href = "/"; // হোমপেজে ফেরত পাঠানো
        } catch (error) {
            console.error("Payment Submission Error:", error);
            alert("পেমেন্ট রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        }
    };
}