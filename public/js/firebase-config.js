// firebase/firebase-config.js

// ১. ফায়ারবেস কোর (Core) এবং প্রয়োজনীয় সার্ভিসগুলো ইমপোর্ট করছি (CDN ব্যবহার করে)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ২. আপনার ওয়েবসাইটের ফায়ারবেস কনফিগারেশন (আপনার দেওয়া সিক্রেট চাবিগুলো)
const firebaseConfig = {
    apiKey: "AIzaSyAem0A-Y8FNQ6oXTNqpfIh5BOOObZxtNYk",
    authDomain: "virallink-video.firebaseapp.com",
    projectId: "virallink-video",
    storageBucket: "virallink-video.firebasestorage.app",
    messagingSenderId: "972803759591",
    appId: "1:972803759591:web:a7c294a2712c31b737f142"
};

// ৩. ফায়ারবেস চালু (Initialize) করছি
const app = initializeApp(firebaseConfig);

// ৪. অথেনটিকেশন (লগইন) এবং ডাটাবেস (Firestore) চালু করছি
const auth = getAuth(app);
const db = getFirestore(app);

// ৫. গুগল লগইনের প্রোভাইডার সেট করছি
const googleProvider = new GoogleAuthProvider();

// ৬. এই জিনিসগুলো ওয়েবসাইটের অন্যান্য ফাইলে ব্যবহারের জন্য এক্সপোর্ট (Export) করছি
export { auth, db, googleProvider };

console.log("Firebase Successfully Initialized! 🔥");