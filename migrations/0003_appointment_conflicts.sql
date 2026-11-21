
ALTER TABLE appointments
ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 30;

CREATE TRIGGER IF NOT EXISTS prevent_appointment_overlap_insert
BEFORE INSERT ON appointments
WHEN NEW.scheduled_at IS NOT NULL
 AND NEW.status IN ('pending', 'confirmed')
 AND EXISTS (
   SELECT 1
   FROM appointments a
   WHERE a.scheduled_at IS NOT NULL
     AND a.status IN ('pending', 'confirmed')
     AND julianday(a.scheduled_at) <
         julianday(NEW.scheduled_at, '+' || NEW.duration_minutes || ' minutes')
     AND julianday(a.scheduled_at, '+' || a.duration_minutes || ' minutes')
         > julianday(NEW.scheduled_at)
 )
BEGIN
  SELECT RAISE(ABORT, 'appointment_conflict');
END;

CREATE TRIGGER IF NOT EXISTS prevent_appointment_overlap_update
BEFORE UPDATE OF scheduled_at, status, duration_minutes ON appointments
WHEN NEW.scheduled_at IS NOT NULL
 AND NEW.status IN ('pending', 'confirmed')
 AND EXISTS (
   SELECT 1
   FROM appointments a
   WHERE a.id != NEW.id
     AND a.scheduled_at IS NOT NULL
     AND a.status IN ('pending', 'confirmed')
     AND julianday(a.scheduled_at) <
         julianday(NEW.scheduled_at, '+' || NEW.duration_minutes || ' minutes')
     AND julianday(a.scheduled_at, '+' || a.duration_minutes || ' minutes')
         > julianday(NEW.scheduled_at)
 )
BEGIN
  SELECT RAISE(ABORT, 'appointment_conflict');
END;
