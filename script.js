let game = {
    coins: 0,
    energy: 100,
    maxEnergy: 100,
    perClick: 1,
    clickCost: 10,
    energyCost: 50,
    playerName: "Player" + Math.floor(Math.random() * 1000) // Har bir foydalanuvchi uchun tasodifiy ism
};

// `leaderboard` ni `localStorage` dan olish yoki bo‘sh massiv bilan boshlash
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

function updateStats() {
    document.getElementById("coins").textContent = Math.floor(game.coins);
    document.getElementById("energy").textContent = Math.floor(game.energy);
    document.getElementById("max-energy").textContent = game.maxEnergy;
    document.getElementById("per-click").textContent = game.perClick;
    document.getElementById("click-cost").textContent = game.clickCost;
    document.getElementById("energy-cost").textContent = game.energyCost;
}

function showMessage(text) {
    document.getElementById("message").textContent = text;
    setTimeout(() => document.getElementById("message").textContent = "", 2000);
}

function showCoinGain(amount) {
    const gain = document.createElement("div");
    gain.textContent = `+${amount}`;
    gain.id = "coin-gain";
    gain.style.left = `${event.clientX}px`;
    gain.style.top = `${event.clientY}px`;
    document.body.appendChild(gain);
    setTimeout(() => gain.remove(), 1000);
}

function tapCoin() {
    if (game.energy >= 1) {
        game.coins += game.perClick;
        game.energy -= 1;
        showCoinGain(game.perClick);
        updateStats();
        document.getElementById("coin").style.transform = "scale(0.9)";
        setTimeout(() => document.getElementById("coin").style.transform = "scale(1)", 100);
        updateLeaderboard(); // Har bosishda reyting yangilanadi
    } else {
        showMessage("Energiya tugadi! Kutib turing...");
    }
}

function upgradeClick() {
    if (game.coins >= game.clickCost) {
        game.coins -= game.clickCost;
        game.perClick += 1;
        game.clickCost = Math.floor(game.clickCost * 1.5);
        showMessage(`Daromad oshirildi! +${game.perClick} TapCoin`);
        updateStats();
        updateLeaderboard();
    } else {
        showMessage("Yetarli TapCoin yo‘q!");
    }
}

function upgradeEnergy() {
    if (game.coins >= game.energyCost) {
        game.coins -= game.energyCost;
        game.maxEnergy += 50;
        game.energy = game.maxEnergy;
        game.energyCost = Math.floor(game.energyCost * 2);
        showMessage(`Energiya chegarasi oshirildi! ${game.maxEnergy}`);
        updateStats();
        updateLeaderboard();
    } else {
        showMessage("Yetarli TapCoin yo‘q!");
    }
}

function inviteFriend() {
    game.coins += 50;
    showMessage("Do‘st taklif qilindi! +50 TapCoin");
    updateStats();
    updateLeaderboard();
}

function updateLeaderboard() {
    // O‘yinchi ma’lumotlarini yangilash
    const playerScore = { name: game.playerName, score: Math.floor(game.coins) };
    const existingIndex = leaderboard.findIndex(p => p.name === game.playerName);
    if (existingIndex !== -1) {
        leaderboard[existingIndex] = playerScore; // Agar o‘yinchi allaqachon mavjud bo‘lsa, yangilash
    } else {
        leaderboard.push(playerScore); // Yangi o‘yinchi qo‘shish
    }

    // Reytingni saralash va top 5 ni olish
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5);

    // `localStorage` ga saqlash
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    // Ekranga chiqarish
    renderLeaderboard();
}

function renderLeaderboard() {
    const list = document.getElementById("leaderboard-list");
    list.innerHTML = ""; // Avvalgi ro‘yxatni tozalash
    if (leaderboard.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Hozircha reyting bo‘sh";
        list.appendChild(li);
    } else {
        leaderboard.forEach(player => {
            const li = document.createElement("li");
            li.textContent = `${player.name}: ${player.score} TapCoin`;
            list.appendChild(li);
        });
    }
}

// Energiyani har 2 soniyada tiklash
setInterval(() => {
    if (game.energy < game.maxEnergy) {
        game.energy = Math.min(game.maxEnergy, game.energy + 1);
        updateStats();
    }
}, 2000);

// O‘yin boshlanganda holatni yangilash
updateStats();
renderLeaderboard();
