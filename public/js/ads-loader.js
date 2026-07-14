// public/js/ads-loader.js

import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// এই ফাংশনটি হোমপেজ থেকে কল করা হবে
export const initializeAds = async () => {
    onAuthStateChanged(auth, async (user) => {
        let isPremium = false;

        if (user) {
            try {
                const userSnap = await getDoc(doc(db, "users", user.uid));
                if (userSnap.exists() && userSnap.data().premium === true) {
                    console.log("Premium User: Ads Disabled 👑");
                    return; // প্রিমিয়াম ইউজার হলে এখানেই কোড শেষ
                }
            } catch (e) { console.error("Ad check error:", e); }
        }

        // ৫ সেকেন্ড বিরতি দিয়ে অ্যাড লোড শুরু হবে
        console.log("Normal/Guest User: Loading Ads in 5s...");
        setTimeout(() => {
            fetchAndInjectAds();
        }, 5000); 
    });
};

const fetchAndInjectAds = async () => {
    const types = ['popunder', 'social', 'banner'];
    for (const type of types) {
        try {
            const adSnap = await getDoc(doc(db, "advertisements", type));
            if (adSnap.exists() && adSnap.data().enabled) {
                const adData = adSnap.data();
                
                if (type === 'banner') {
                    const container = document.getElementById('ad-banner-placeholder');
                    if (container) runAdScript(adData.code, container);
                } else {
                    runAdScript(adData.code, document.body);
                }
            }
        } catch (e) { console.error(`Error loading ${type} ad:`, e); }
    }
};

// যেকোনো অ্যাড কোড রান করানোর ফাংশন
function runAdScript(code, target) {
    const div = document.createElement('div');
    div.innerHTML = code;
    const scripts = div.querySelectorAll('script');
    target.appendChild(div);

    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}