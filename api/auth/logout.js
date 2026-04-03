// POST /api/auth/logout
// Header: Authorization: Bearer <token>

const { sql } = require('../_db');
const { cors } = require('../_auth');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  if (token) {
    try { await sql`DELETE FROM sessions WHERE token = ${token}`; } catch(e) {}
  }
  return res.status(200).json({ ok: true });
};
