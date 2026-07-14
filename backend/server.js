// backend/server.js (Render এর জন্য স্থায়ী সমাধান)

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// ১. মিডলওয়্যার সেটআপ
app.use(cors());
app.use(express.json());

// ২. স্ট্যাটিক ফোল্ডারগুলো সার্ভ করা
// public, admin এবং firebase ফোল্ডারগুলো ব্রাউজারকে চেনানো
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/firebase', express.static(path.join(__dirname, '../firebase')));

// ৩. মেইন রুট (হোমপেজ)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ৪. অ্যাডমিন রুট
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// ৫. ক্যাচ-অল রুট (যেকোনো লিঙ্কে ঢুকলে ইনডেক্স পেজে পাঠাবে)
// এটি আগের '*' এর বদলে ব্যবহার করা হচ্ছে যাতে এরর না আসে
app.use((req, res, next) => {
    res.status(200).sendFile(path.join(__dirname, '../public/index.html'));
});

// ৬. সার্ভার পোর্ট
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});