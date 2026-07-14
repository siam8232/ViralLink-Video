// public/js/ads-loader.js
import { auth, db } from "/firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const initializeAds = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userSnap = await getDoc(doc(db, "users", user.uid));
                if (userSnap.exists() && userSnap.data().premium === true) {
                    console.log("Premium User: Ads Disabled 👑");
                    return; 
                }
            } catch (e) { console.error(e); }
        }

        // ৫ সেকেন্ড পর অ্যাড লোড শুরু হবে
        console.log("Ads will show in 5 seconds...");
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
        } catch (e) { console.error(e); }
    }
};

// এই ফাংশনটি যেকোনো অ্যাড কোডকে রান করাবেই করাবে
function runAdScript(code, target) {
    const div = document.createElement('div');
    div.innerHTML = code;
    const scripts = div.querySelectorAll('script');
    
    // কোডের ভেতরে থাকা টেক্সট/এইচটিএমএল ঢোকানো
    target.appendChild(div);

    // কোডের ভেতরে থাকা স্ক্রিপ্টগুলো আলাদাভাবে রান করানো (খুবই জরুরি)
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}