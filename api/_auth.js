// Session validation helper — used by all protected API routes
const { sql } = require('./_db');

const PACKAGES = {
  admin:  { sessionHours: 24, months: [1,2,3] },
  full:   { sessionHours: 24, months: [1,2,3] },
  maand1: { sessionHours: 2,  months: [1] },
  maand2: { sessionHours: 2,  months: [1,2] },
  maand3: { sessionHours: 2,  months: [1,2,3] }
};

async function validateSession(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return null;

  try {
    const rows = await sql`
      SELECT s.user_id, s.expires_at, u.name, u.email, u.package, u.role, u.status
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ${token}
        AND s.expires_at > NOW()
        AND u.status = 'active'
      LIMIT 1
    `;
    if (!rows.length) return null;
    const row = rows[0];
    return {
      userId:  row.user_id,
      userName: row.name,
      email:   row.email,
      package: row.package,
      role:    row.role,
      status:  row.status,
      token
    };
  } catch(e) {
    console.error('validateSession error:', e);
    return null;
  }
}

function requireAdmin(user) {
  return user && user.package === 'admin';
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = { validateSession, requireAdmin, cors, PACKAGES };
