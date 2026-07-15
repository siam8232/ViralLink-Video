// public/js/ads-loader.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const initializeAds = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // লগইন থাকলে চেক করো সে প্রিমিয়াম কি না
            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (userSnap.exists() && userSnap.data().premium === true) {
                console.log("Premium User: Ads Disabled 👑");
                return; // প্রিমিয়াম হলে অ্যাড লোড হবে না
            }
        }
        
        // গেস্ট এবং সাধারণ ইউজার—সবার জন্য অ্যাড লোড হবে
        console.log("Loading Ads for all non-premium users... 📢");
        fetchAndInjectAds();
    });
};

const fetchAndInjectAds = async () => {
    const types = ['popunder', 'social', 'banner'];
    for (const type of types) {
        const adSnap = await getDoc(doc(db, "advertisements", type));
        if (adSnap.exists() && adSnap.data().enabled) {
            const code = adSnap.data().code;
            if (type === 'banner') {
                const box = document.getElementById('ad-banner-placeholder');
                if (box) runAd(code, box);
            } else { runAd(code, document.body); }
        }
    }
};

function runAd(code, target) {
    const div = document.createElement('div');
    div.innerHTML = code;
    target.appendChild(div);
    const scripts = div.querySelectorAll('script');
    scripts.forEach(s => {
        const ns = document.createElement('script');
        Array.from(s.attributes).forEach(a => ns.setAttribute(attr.name, attr.value));
        ns.text = s.innerHTML;
        s.parentNode.replaceChild(ns, s);
    });
}