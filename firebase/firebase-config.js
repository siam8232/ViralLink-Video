// firebase/firebase-config.js

// ১. ফায়ারবেসের মেইন সার্ভিসগুলো ইন্টারনেট থেকে নিয়ে আসছি
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ২. আপনার ফায়ারবেস প্রজেক্টের সিক্রেট কানেকশন তথ্য
const firebaseConfig = {
    apiKey: "AIzaSyAem0A-Y8FNQ6oXTNqpfIh5BOOObZxtNYk",
    authDomain: "virallink-video.firebaseapp.com",
    projectId: "virallink-video",
    storageBucket: "virallink-video.firebasestorage.app",
    messagingSenderId: "972803759591",
    appId: "1:972803759591:web:a7c294a2712c31b737f142"
};

// ৩. ফায়ারবেস কানেকশন চালু করছি
const app = initializeApp(firebaseConfig);

// ৪. লগইন এবং ডাটাবেস ব্যবহারের জন্য এক্সপোর্ট করছি
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

console.log("Firebase Connected Successfully! 🔥");