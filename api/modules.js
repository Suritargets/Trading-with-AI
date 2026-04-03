// GET  /api/modules → get hidden modules list (public — all logged-in users need this)
// POST /api/modules → update hidden modules (admin only)

const { sql } = require('./_db');
const { validateSession, requireAdmin, cors } = require('./_auth');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — anyone can read the module config (needed on app load)
  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT hidden_modules FROM modules_config WHERE id = 1 LIMIT 1`;
      const hidden = rows.length ? JSON.parse(rows[0].hidden_modules || '[]') : [];
      return res.status(200).json({ hiddenModules: hidden });
    } catch(e) {
      return res.status(200).json({ hiddenModules: [] });
    }
  }

  // POST — admin only
  if (req.method === 'POST') {
    const user = await validateSession(req);
    if (!requireAdmin(user)) return res.status(403).json({ error: 'Geen toegang.' });

    const { hiddenModules } = req.body || {};
    if (!Array.isArray(hiddenModules)) return res.status(400).json({ error: 'hiddenModules moet een array zijn.' });

    await sql`
      INSERT INTO modules_config (id, hidden_modules) VALUES (1, ${JSON.stringify(hiddenModules)})
      ON CONFLICT (id) DO UPDATE SET hidden_modules = EXCLUDED.hidden_modules
    `;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
