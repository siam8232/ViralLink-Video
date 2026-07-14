// backend/server.js (সম্পূর্ণ কোড)
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ১. ফোল্ডারগুলো সার্ভারকে চিনিয়ে দেওয়া (খুবই জরুরি)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/firebase', express.static(path.join(__dirname, '../firebase')));

// ২. হোমপেজ রুট
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ৩. অ্যাডমিন পেজ রুট
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`সার্ভার চলছে: http://localhost:${PORT}`);
});