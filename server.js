const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Static fayllar uchun

// Reyting ma'lumotlari
const scoresFilePath = path.join(__dirname, "scores.json");

// Fayl mavjudligini tekshirish
if (!fs.existsSync(scoresFilePath)) {
    fs.writeFileSync(scoresFilePath, JSON.stringify([])); // Fayl yaratish
}

// Reyting ma'lumotlarini o'qish
function readScores() {
    return JSON.parse(fs.readFileSync(scoresFilePath));
}

// Reyting ma'lumotlarini yozish
function writeScores(scores) {
    fs.writeFileSync(scoresFilePath, JSON.stringify(scores));
}

// Natijani saqlash
app.post("/api/save-score", (req, res) => {
    const { name, score } = req.body;
    const scores = readScores();
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score); // Reytingni kamayish tartibida saralash
    writeScores(scores);
    res.json({ success: true });
});

// Reyting ma'lumotlarini olish
app.get("/api/get-scores", (req, res) => {
    const scores = readScores();
    res.json(scores.slice(0, 30)); // Eng yaxshi 30 natija
});

// Reyting sahifasi
app.get("/rating", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "rating.html"));
});

// Asosiy sahifa
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serverni ishga tushurish
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} da ishga tushdi`);
});
