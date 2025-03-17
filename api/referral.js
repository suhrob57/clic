// api/referral.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Referral link generatsiya qilish uchun funksiya
function generateReferralCode(playerId) {
  return `${playerId}-${Math.random().toString(36).substr(2, 9)}`;
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { playerId, action, referralCode } = req.body;

    try {
      if (action === 'generate') {
        // Referral kodni generatsiya qilish
        const referralCode = generateReferralCode(playerId);
        await pool.query(
          'INSERT INTO referrals(player_id, referral_code) VALUES($1, $2) ON CONFLICT (player_id) DO UPDATE SET referral_code = $2',
          [playerId, referralCode]
        );
        return res.status(200).json({ referralCode });
      }

      if (action === 'redeem') {
        // Referral kodni tekshirish va coin berish
        const result = await pool.query('SELECT player_id FROM referrals WHERE referral_code = $1', [referralCode]);
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Referral code not found' });
        }

        const referrerId = result.rows[0].player_id;
        if (referrerId === playerId) {
          return res.status(400).json({ error: 'You cannot use your own referral code' });
        }

        // Referrer’ga coin berish (masalan, 100 coin)
        await pool.query(
          'UPDATE players SET coins = coins + 100 WHERE player_id = $1',
          [referrerId]
        );

        // Taklif qilingan o‘yinchi uchun qaydni belgilash
        await pool.query(
          'INSERT INTO referral_usage(referral_code, used_by) VALUES($1, $2)',
          [referralCode, playerId]
        );

        return res.status(200).json({ message: 'Referral redeemed, coins awarded!' });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Error in referral API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
