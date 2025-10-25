-- 004_users_auth.sql
-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure columns for auth
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('customer','merchant','rider','admin')) DEFAULT 'admin';

-- Admin seed (change email/password after running in PROD)
INSERT INTO users (role, name, phone, email, otp_verified, wallet_balance, password_hash)
VALUES (
  'admin',
  'Saklin Admin',
  '+96890000000',
  'admin@saklin.om',
  true,
  0,
  crypt('admin123', gen_salt('bf', 10))
)
ON CONFLICT (email) DO NOTHING;

-- Helper index
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
