-- ─────────────────────────────────────────────────────────────────────────────
-- ST-Trading-EDU — Neon PostgreSQL Schema
-- Run this ONCE in your Neon dashboard SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(50)  PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(64) NOT NULL,
  package      VARCHAR(20)  NOT NULL DEFAULT 'maand1',
  role         VARCHAR(20)  NOT NULL DEFAULT 'student',
  status       VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_at   DATE         NOT NULL DEFAULT CURRENT_DATE,
  last_login   DATE,
  note         TEXT         DEFAULT ''
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  token      VARCHAR(128) PRIMARY KEY,
  user_id    VARCHAR(50)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Module visibility config (single row)
CREATE TABLE IF NOT EXISTS modules_config (
  id             INTEGER PRIMARY KEY DEFAULT 1,
  hidden_modules TEXT    NOT NULL DEFAULT '[]'
);

-- Default admin user (password: kento2025)
INSERT INTO users (id, name, email, password_hash, package, role, status, note)
VALUES (
  'u_admin',
  'ST-Trading-EDU (Admin)',
  'admin',
  '5c4f8952d502e909cd4463284f07839adc1807204e09a37f70f5ce973e006356',
  'admin',
  'admin',
  'active',
  'Standaard admin account'
) ON CONFLICT (id) DO NOTHING;

-- Default modules config
INSERT INTO modules_config (id, hidden_modules)
VALUES (1, '[]')
ON CONFLICT (id) DO NOTHING;

-- Index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
