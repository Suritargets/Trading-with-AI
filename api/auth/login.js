// POST /api/auth/login
// Body: { email, passwordHash }
// Returns: { token, user: { userId, userName, package, role } }

const { sql } = require('../_db');
const { cors, PACKAGES } = require('../_auth');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, passwordHash } = req.body || {};
  if (!email || !passwordHash) {
    return res.status(400).json({ error: 'Email en wachtwoord zijn verplicht.' });
  }

  try {
    // Find user by email
    const users = await sql`
      SELECT id, name, email, password_hash, package, role, status, note
      FROM users
      WHERE LOWER(email) = LOWER(${email.trim()})
      LIMIT 1
    `;

    if (!users.length) {
      return res.status(401).json({ error: 'Gebruiker niet gevonden.' });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is gesuspendeerd. Neem contact op met de beheerder.' });
    }

    if (user.password_hash !== passwordHash.toLowerCase()) {
      return res.status(401).json({ error: 'Onjuist wachtwoord.' });
    }

    // Create session token
    const token = crypto.randomBytes(48).toString('hex');
    const pkg = PACKAGES[user.package] || PACKAGES.maand1;
    const expiresAt = new Date(Date.now() + pkg.sessionHours * 3600000);

    await sql`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (${token}, ${user.id}, ${expiresAt})
    `;

    // Update last_login
    await sql`
      UPDATE users SET last_login = CURRENT_DATE WHERE id = ${user.id}
    `;

    // Clean up expired sessions
    await sql`DELETE FROM sessions WHERE expires_at < NOW()`;

    return res.status(200).json({
      token,
      user: {
        userId:   user.id,
        userName: user.name,
        email:    user.email,
        package:  user.package,
        role:     user.role,
        sessionHours: pkg.sessionHours,
        months:   pkg.months,
        loginTime: Date.now()
      }
    });

  } catch(e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Server fout. Probeer opnieuw.' });
  }
};
