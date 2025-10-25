-- 006_audit_log.sql
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  at TIMESTAMP DEFAULT NOW(),
  actor_id BIGINT,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  subject TEXT,
  meta JSONB
);
CREATE INDEX IF NOT EXISTS idx_audit_at ON audit_log (at DESC);
