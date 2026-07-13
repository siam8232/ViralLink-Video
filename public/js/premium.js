// public/js/premium.js (সম্পূর্ণ আপডেট করা কোড)

import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentUID = null;
let currentUserName = null;
let currentUserEmail = null;

// ১. ইউজারের অবস্থা চেক করা
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUID = user.uid;
        currentUserName = user.displayName;
        currentUserEmail = user.email;
    } else {
        alert("পেমেন্ট করতে প্রথমে লগইন করুন!");
        window.location.href = "/";
    }
});

// ২. পেমেন্ট ফর্ম সাবমিট করা
document.getElementById('payment-form').onsubmit = async (e) => {
    e.preventDefault();
    
    // HTML থেকে ডেটা নেওয়া
    const plan = document.getElementById('selected-plan').value;
    const price = document.getElementById('selected-price').value;
    const method = document.getElementById('selected-method').value;
    const senderNum = document.getElementById('sender-num').value;
    const trxId = document.getElementById('trx-id').value;

    // ভ্যালিডেশন (চেক করা সব তথ্য দেওয়া হয়েছে কি না)
    if (!plan || !price) {
        alert("দয়া করে একটি প্রিমিয়াম প্ল্যান সিলেক্ট করুন!");
        return;
    }
    if (!method) {
        alert("দয়া করে একটি পেমেন্ট মাধ্যম (bKash/Nagad...) সিলেক্ট করুন!");
        return;
    }

    try {
        // ৩. ফায়ারবেস ডাটাবেসে পেমেন্ট রিকোয়েস্ট পাঠানো
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
        console.error("Payment Error:", error);
        alert("পেমেন্ট রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে: " + error.message);
    }
};