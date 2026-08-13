-- Backs lib/rateLimit.ts. Postgres-backed (not in-memory) so limits hold up
-- correctly across multiple serverless instances in production, not just in
-- a single long-running dev server.
CREATE TABLE IF NOT EXISTS rate_limit_hits (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_key_time ON rate_limit_hits(key, created_at);
