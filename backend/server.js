// backend/server.js

const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ১. স্ট্যাটিক ফাইলগুলো সার্ভ করা (সব ফাইল এখন public এর ভেতরে থাকবে)
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

// ৪. ভুল রুট হ্যান্ডেল করা
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});