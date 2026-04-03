// GET  /api/users         → list all users (admin only)
// POST /api/users         → create user (admin only)
// PUT  /api/users         → update user (admin only)
// DELETE /api/users?id=x → delete user (admin only)

const { sql } = require('../_db');
const { validateSession, requireAdmin, cors } = require('../_auth');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await validateSession(req);
  if (!requireAdmin(user)) return res.status(403).json({ error: 'Geen toegang.' });

  // GET — list users
  if (req.method === 'GET') {
    const users = await sql`
      SELECT id, name, email, package, role, status, created_at, last_login, note
      FROM users ORDER BY created_at ASC
    `;
    return res.status(200).json(users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      package: u.package,
      role: u.role || 'student',
      status: u.status,
      createdAt: u.created_at,
      lastLogin: u.last_login || null,
      note: u.note || ''
    })));
  }

  // POST — create user
  if (req.method === 'POST') {
    const { id, name, email, passwordHash, package: pkg, role, status, note } = req.body || {};
    if (!name || !email || !passwordHash) {
      return res.status(400).json({ error: 'Naam, email en wachtwoord zijn verplicht.' });
    }
    // Check duplicate email
    const dup = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
    if (dup.length) return res.status(400).json({ error: 'Dit login/email bestaat al.' });

    const newId = id || ('u_' + Date.now());
    await sql`
      INSERT INTO users (id, name, email, password_hash, package, role, status, note)
      VALUES (${newId}, ${name}, ${email.toLowerCase()}, ${passwordHash}, ${pkg||'maand1'}, ${role||'student'}, ${status||'active'}, ${note||''})
    `;
    return res.status(201).json({ ok: true, id: newId });
  }

  // PUT — update user
  if (req.method === 'PUT') {
    const { id, name, email, passwordHash, package: pkg, role, status, note } = req.body || {};
    if (!id) return res.status(400).json({ error: 'ID is verplicht.' });

    // Check duplicate email for other users
    const dup = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email}) AND id != ${id} LIMIT 1`;
    if (dup.length) return res.status(400).json({ error: 'Dit login/email bestaat al.' });

    if (passwordHash) {
      await sql`
        UPDATE users SET name=${name}, email=${email.toLowerCase()}, password_hash=${passwordHash},
          package=${pkg}, role=${role||'student'}, status=${status}, note=${note||''}
        WHERE id=${id}
      `;
    } else {
      await sql`
        UPDATE users SET name=${name}, email=${email.toLowerCase()},
          package=${pkg}, role=${role||'student'}, status=${status}, note=${note||''}
        WHERE id=${id}
      `;
    }
    return res.status(200).json({ ok: true });
  }

  // DELETE — delete user
  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id;
    if (!id) return res.status(400).json({ error: 'ID is verplicht.' });
    await sql`DELETE FROM sessions WHERE user_id = ${id}`;
    await sql`DELETE FROM users WHERE id = ${id} AND package != 'admin'`;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
