// Neon database connection helper
const { neon } = require('@neondatabase/serverless');

// Neon via Vercel integration uses POSTGRES_URL, direct setup uses DATABASE_URL
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('No database URL found. Set DATABASE_URL or POSTGRES_URL.');
}

const sql = neon(connectionString);

module.exports = { sql };
