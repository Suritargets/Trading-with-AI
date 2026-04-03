// GET /api/auth/session
// Header: Authorization: Bearer <token>
// Returns: { valid: true, user: {...} } or { valid: false }

const { validateSession, cors } = require('../_auth');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await validateSession(req);
  if (!user) return res.status(200).json({ valid: false });
  return res.status(200).json({ valid: true, user });
};
