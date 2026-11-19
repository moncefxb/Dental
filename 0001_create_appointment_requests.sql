-- Store only the minimum information needed to respond to an appointment request.
-- Do not add diagnosis, symptoms, medical history, or other sensitive health details here.
CREATE TABLE IF NOT EXISTS appointment_requests (
  id TEXT PRIMARY KEY NOT NULL,
  full_name TEXT NOT NULL CHECK (length(full_name) BETWEEN 2 AND 100),
  phone TEXT NOT NULL CHECK (length(phone) BETWEEN 8 AND 25),
  service TEXT NOT NULL CHECK (service IN (
    'general', 'cosmetic', 'orthodontics', 'restorative', 'implants', 'pediatric', 'other'
  )),
  preferred_date TEXT,
  language TEXT NOT NULL CHECK (language IN ('ar', 'fr', 'en')),
  consented_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'cancelled', 'completed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointment_requests_created_at
  ON appointment_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointment_requests_status_created_at
  ON appointment_requests (status, created_at DESC);
