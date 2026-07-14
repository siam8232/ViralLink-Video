// admin/ads.js

import { db } from "../firebase/firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ১. আগে থেকে সেভ করা বিজ্ঞাপনগুলো ডাটাবেস থেকে নিয়ে আসার ফাংশন
const loadExistingAds = async () => {
    const types = ['popunder', 'social', 'banner'];

    for (const type of types) {
        try {
            const adSnap = await getDoc(doc(db, "advertisements", type));
            if (adSnap.exists()) {
                const data = adSnap.data();
                // বক্সে কোড বসানো
                document.getElementById(`${type}-code`).value = data.code || "";
                // চেক বক্স আপডেট করা
                document.getElementById(`${type}-active`).checked = data.enabled || false;
            }
        } catch (error) {
            console.error(`Error loading ${type} ad:`, error);
        }
    }
};

// ২. বিজ্ঞাপন সেভ করার ফাংশন
// এটি window অবজেক্টে রাখা হয়েছে যাতে HTML বাটন এটি খুঁজে পায়
window.saveAd = async (type) => {
    const code = document.getElementById(`${type}-code`).value.trim();
    const enabled = document.getElementById(`${type}-active`).checked;

    try {
        // ডাটাবেসে 'advertisements' কালেকশনের ভেতর টাইপ অনুযায়ী সেভ করা
        await setDoc(doc(db, "advertisements", type), {
            code: code,
            enabled: enabled,
            updatedAt: new Date()
        });

        alert(`${type.toUpperCase()} বিজ্ঞাপনটি সফলভাবে সেভ হয়েছে! ✅`);
    } catch (error) {
        console.error("Save Ad Error:", error);
        alert("বিজ্ঞাপন সেভ করতে সমস্যা হয়েছে: " + error.message);
    }
};

// পেজ লোড হলে আগের ডাটা নিয়ে আসো
loadExistingAds();