-- RECONSTRUCTED BASELINE (not in the supplied ZIP).
-- Inferred from the queries in functions/api/*.js. Every statement is
-- IF NOT EXISTS, so it is a no-op on a database that already has these tables.
-- Compare with your live schema (`wrangler d1 execute dental --remote --command ".schema"`) before relying on it.

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  preferred_date TEXT NOT NULL DEFAULT '',
  scheduled_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  reference TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'website',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointment_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  last_request_at INTEGER NOT NULL,
  token TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0
);
