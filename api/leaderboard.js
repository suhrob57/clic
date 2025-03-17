const { Pool } = require('pg');

// Vercel PostgreSQL sozlamalari (environment variables dan olinadi)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    try {
        if (req.method === "GET") {
            // Reyting ro‘yxatini olish
            const result = await pool.query("SELECT * FROM leaderboard ORDER BY score DESC LIMIT 5");
            res.status(200).json(result.rows);
        } else if (req.method === "POST") {
            // O‘yinchi ma’lumotlarini yangilash
            const { name, score } = req.body;
            await pool.query(
                "INSERT INTO leaderboard (name, score) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET score = $2",
                [name, score]
            );
            res.status(200).json({ message: "Score updated" });
        } else {
            res.status(405).json({ error: "Method not allowed" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
