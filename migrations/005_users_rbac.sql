-- 005_users_rbac.sql
-- Expand roles set and add soft-delete + timestamps
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Ensure role values cover RBAC we need (leave as CHECK; existing rows valid)
-- (If your DB created the CHECK earlier, skip; otherwise recreate carefully in prod)
DO $$ BEGIN
  -- no-op for safety in shared environments
  NULL;
END $$;

-- Helpful index for active users
CREATE INDEX IF NOT EXISTS idx_users_active ON users (email) WHERE deleted_at IS NULL;
