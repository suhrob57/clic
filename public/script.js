let game = {
    coins: 0,
    energy: 100,
    maxEnergy: 100,
    perClick: 1,
    clickCost: 10,
    energyCost: 50,
    playerId: localStorage.getItem("playerId") || `Player${Math.floor(Math.random() * 100000)}`
};

// Agar yangi o‘yinchi bo‘lsa, ID ni saqlash
if (!localStorage.getItem("playerId")) localStorage.setItem("playerId", game.playerId);

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

async function syncWithServer() {
    await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            playerId: game.playerId,
            coins: game.coins,
            energy: game.energy,
            maxEnergy: game.maxEnergy,
            perClick: game.perClick
        })
    });
    updateLeaderboard();
}

function tapCoin() {
    if (game.energy >= 1) {
        game.coins += game.perClick;
        game.energy -= 1;
        showCoinGain(game.perClick);
        updateStats();
        document.getElementById("coin").style.transform = "scale(0.9)";
        setTimeout(() => document.getElementById("coin").style.transform = "scale(1)", 100);
        syncWithServer();
    } else {
        showMessage("Energiya tugadi! Kutib turing...");
    }
}

async function upgradeClick() {
    if (game.coins >= game.clickCost) {
        game.coins -= game.clickCost;
        game.perClick += 1;
        game.clickCost = Math.floor(game.clickCost * 1.5);
        showMessage(`Daromad oshirildi! +${game.perClick} TapCoin`);
        updateStats();
        await syncWithServer();
    } else {
        showMessage("Yetarli TapCoin yo‘q!");
    }
}

async function upgradeEnergy() {
    if (game.coins >= game.energyCost) {
        game.coins -= game.energyCost;
        game.maxEnergy += 50;
        game.energy = game.maxEnergy;
        game.energyCost = Math.floor(game.energyCost * 2);
        showMessage(`Energiya chegarasi oshirildi! ${game.maxEnergy}`);
        updateStats();
        await syncWithServer();
    } else {
        showMessage("Yetarli TapCoin yo‘q!");
    }
}

async function inviteFriend() {
    game.coins += 50;
    showMessage("Do‘st taklif qilindi! +50 TapCoin");
    updateStats();
    await syncWithServer();
}

async function updateLeaderboard() {
    const response = await fetch("/api/leaderboard");
    const leaderboard = await response.json();
    renderLeaderboard(leaderboard);
}

function renderLeaderboard(leaderboard) {
    const list = document.getElementById("leaderboard-list");
    list.innerHTML = "";
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
setInterval(async () => {
    if (game.energy < game.maxEnergy) {
        game.energy = Math.min(game.maxEnergy, game.energy + 1);
        updateStats();
        await syncWithServer();
    }
}, 2000);

// O‘yin boshlanganda serverdan ma’lumotlarni olish
async function init() {
    const response = await fetch(`/api/update?playerId=${game.playerId}`);
    const playerData = await response.json();
    if (playerData.coins !== undefined) {
        game.coins = playerData.coins;
        game.energy = playerData.energy;
        game.maxEnergy = playerData.maxEnergy;
        game.perClick = playerData.perClick;
    }
    updateStats();
    updateLeaderboard();
}

init();
