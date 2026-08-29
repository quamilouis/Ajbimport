-- =========================================================
-- AJB IMPORTS GHANA
-- SQLite Database Schema
-- =========================================================
-- Database file: data/website.db
-- =========================================================

PRAGMA journal_mode = WAL;

-- =========================================================
-- Admins Table
-- =========================================================
-- Stores administrator accounts for the admin dashboard.
-- Supports bcrypt password hashes, password reset tokens,
-- and legacy migration from admins.json.

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  createdAt TEXT NOT NULL,
  resetTokenHash TEXT,
  resetTokenExpires INTEGER,
  passwordChangedAt TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_email ON admins(email);


-- =========================================================
-- Quote Submissions Table
-- =========================================================
-- Stores customer shipment enquiries submitted through
-- the public quote form on the website.

CREATE TABLE IF NOT EXISTS quote_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  createdAt TEXT NOT NULL,
  fullName TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  service TEXT,
  origin TEXT,
  destination TEXT,
  cargoType TEXT,
  cargoWeight TEXT,
  cargoVolume TEXT,
  shippingDate TEXT,
  preferredContact TEXT DEFAULT 'Email / Phone',
  message TEXT,
  status TEXT DEFAULT 'New',
  adminNotes TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_quote_email ON quote_submissions(email);


-- =========================================================
-- Example Seed Data (Optional)
-- =========================================================
-- Uncomment and run manually if you need a demo admin.
-- Make sure to replace the hash with a real bcrypt hash.

-- INSERT INTO admins (id, fullName, email, passwordHash, role, createdAt)
-- VALUES (
--   'admin-001',
--   'Administrator',
--   'admin@ajbimports.com',
--   '$2a$12$REPLACE_WITH_REAL_BCRYPT_HASH',
--   'admin',
--   '2026-08-29T00:00:00.000Z'
-- );
