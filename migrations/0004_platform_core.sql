-- NOVA Platform core: services, dentists, availability, settings, audit, admin users/sessions.
-- Additive only. No existing rows are modified or deleted.
-- No clinic data is invented: dentists, working hours and prices start EMPTY and are entered in the admin.

CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL, name_fr TEXT NOT NULL, name_en TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes BETWEEN 5 AND 480),
  price_from INTEGER,                       -- NULL = "on request"; currency is a setting
  bookable INTEGER NOT NULL DEFAULT 1,      -- 0 = enquiry-only (e.g. "other")
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Slugs/labels taken from the existing NOVA booking form (script.js translations).
INSERT INTO services (slug,name_ar,name_fr,name_en,bookable,sort_order) VALUES
 ('general','الفحص والوقاية','Examen & prévention','Examination & prevention',1,1),
 ('cosmetic','تجميل الأسنان','Esthétique dentaire','Cosmetic dentistry',1,2),
 ('orthodontics','تقويم الأسنان','Orthodontie','Orthodontics',1,3),
 ('restorative','علاج وترميم الأسنان','Soins & restaurations','Dental treatment & restorations',1,4),
 ('implants','زراعة الأسنان','Implants dentaires','Dental implants',1,5),
 ('pediatric','طب أسنان الأطفال','Soins dentaires pour enfants','Children’s dentistry',1,6),
 ('other','استفسار آخر','Autre demande','Another enquiry',0,7);

CREATE TABLE dentists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title_ar TEXT NOT NULL DEFAULT '', title_fr TEXT NOT NULL DEFAULT '', title_en TEXT NOT NULL DEFAULT '',
  bio_ar TEXT NOT NULL DEFAULT '', bio_fr TEXT NOT NULL DEFAULT '', bio_en TEXT NOT NULL DEFAULT '',
  photo_key TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE dentist_services (
  dentist_id INTEGER NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (dentist_id, service_id)
);

-- weekday: 0=Sunday..6=Saturday. dentist_id NULL = clinic-wide default hours.
CREATE TABLE working_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dentist_id INTEGER REFERENCES dentists(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TEXT NOT NULL CHECK (start_time GLOB '[0-2][0-9]:[0-5][0-9]'),
  end_time   TEXT NOT NULL CHECK (end_time   GLOB '[0-2][0-9]:[0-5][0-9]'),
  CHECK (start_time < end_time)
);
CREATE INDEX idx_working_hours_lookup ON working_hours(dentist_id, weekday);

-- Closures / leave. Local naive datetimes 'YYYY-MM-DDTHH:MM'. dentist_id NULL = whole clinic.
CREATE TABLE time_off (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dentist_id INTEGER REFERENCES dentists(id) ON DELETE CASCADE,
  starts_at TEXT NOT NULL, ends_at TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  CHECK (starts_at < ends_at)
);

CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
INSERT INTO settings (key,value) VALUES
 ('timezone','Africa/Algiers'),
 ('slot_step_minutes','30'),
 ('min_notice_minutes','120'),
 ('max_days_ahead','60'),
 ('online_booking_enabled','1');

CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',   -- never store patient notes or contact data here
  ip_hash TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_audit_at ON audit_logs(at);

CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,       -- pbkdf2$sha256$iterations$salt$hash
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','staff')),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY,       -- SHA-256 of the cookie token; the raw token is never stored
  user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_sessions_expiry ON admin_sessions(expires_at);

-- Appointment extensions
ALTER TABLE appointments ADD COLUMN email TEXT NOT NULL DEFAULT '';
ALTER TABLE appointments ADD COLUMN dentist_id INTEGER REFERENCES dentists(id);
ALTER TABLE appointments ADD COLUMN service_id INTEGER REFERENCES services(id);
ALTER TABLE appointments ADD COLUMN language TEXT NOT NULL DEFAULT '';
CREATE INDEX idx_appointments_dentist_time ON appointments(dentist_id, scheduled_at);

-- Replace the clinic-wide overlap triggers from 0003 with dentist-aware ones.
-- Two bookings conflict if they overlap AND share the same dentist (or both have none = legacy single-chair behaviour).
DROP TRIGGER IF EXISTS prevent_appointment_overlap_insert;
DROP TRIGGER IF EXISTS prevent_appointment_overlap_update;

CREATE TRIGGER prevent_appointment_overlap_insert
BEFORE INSERT ON appointments
WHEN NEW.scheduled_at IS NOT NULL AND NEW.status IN ('pending','confirmed')
 AND EXISTS (
   SELECT 1 FROM appointments a
   WHERE a.scheduled_at IS NOT NULL AND a.status IN ('pending','confirmed')
     AND COALESCE(a.dentist_id,0) = COALESCE(NEW.dentist_id,0)
     AND julianday(a.scheduled_at) < julianday(NEW.scheduled_at, '+' || NEW.duration_minutes || ' minutes')
     AND julianday(a.scheduled_at, '+' || a.duration_minutes || ' minutes') > julianday(NEW.scheduled_at)
 )
BEGIN SELECT RAISE(ABORT, 'appointment_conflict'); END;

CREATE TRIGGER prevent_appointment_overlap_update
BEFORE UPDATE OF scheduled_at, status, duration_minutes, dentist_id ON appointments
WHEN NEW.scheduled_at IS NOT NULL AND NEW.status IN ('pending','confirmed')
 AND EXISTS (
   SELECT 1 FROM appointments a
   WHERE a.id != NEW.id AND a.scheduled_at IS NOT NULL AND a.status IN ('pending','confirmed')
     AND COALESCE(a.dentist_id,0) = COALESCE(NEW.dentist_id,0)
     AND julianday(a.scheduled_at) < julianday(NEW.scheduled_at, '+' || NEW.duration_minutes || ' minutes')
     AND julianday(a.scheduled_at, '+' || a.duration_minutes || ' minutes') > julianday(NEW.scheduled_at)
 )
BEGIN SELECT RAISE(ABORT, 'appointment_conflict'); END;
