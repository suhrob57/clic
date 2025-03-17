const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    const { playerId, coins, energy, maxEnergy, perClick } = req.body;
    try {
        await pool.query(
            "INSERT INTO players (player_id, coins, energy, max_energy, per_click) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (player_id) DO UPDATE SET coins = $2, energy = $3, max_energy = $4, per_click = $5",
            [playerId, coins, energy, maxEnergy, perClick]
        );
        res.status(200).json({ message: "Player updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
