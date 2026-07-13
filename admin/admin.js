// admin/admin.js (সম্পূর্ণ কোড)
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "/"; // লগইন না থাকলে হোমপেজে পাঠাও
        return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().role === "admin") {
        document.getElementById('admin-loading').style.display = 'none';
        document.getElementById('admin-name').innerText = user.displayName;
    } else {
        alert("আপনি অ্যাডমিন নন!");
        window.location.href = "/";
    }
});