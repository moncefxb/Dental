import { hasAdminSession } from "./admin.js";

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      ...headers
    }
  });
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function readJson(request) {
  const type = request.headers.get("Content-Type") || "";
  if (!type.toLowerCase().includes("application/json")) return null;

  const raw = await request.text();
  if (raw.length > 12000) return null;

  try {
    const body = JSON.parse(raw);
    return body && typeof body === "object" && !Array.isArray(body)
      ? body
      : null;
  } catch {
    return null;
  }
}

function validDate(value) {
  if (typeof value !== "string") return false;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));

  return date.getUTCFullYear() === Number(y) &&
    date.getUTCMonth() === Number(m) - 1 &&
    date.getUTCDate() === Number(d);
}

const SERVICES = new Set([
  "general",
  "cosmetic",
  "orthodontics",
  "restorative",
  "implants",
  "pediatric",
  "other"
]);

async function authorized(request, env, write = false) {
  if (write && !sameOrigin(request)) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  if (!(await hasAdminSession(request, env))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  return null;
}

// GET /api/admin/patients
export async function adminListPatients({ request, env }) {
  const denied = await authorized(request, env);
  if (denied) return denied;

  try {
    const url = new URL(request.url);
    const search = (url.searchParams.get("q") || "").trim().slice(0, 100);

    const result = await env.DB.prepare(`
      SELECT
        p.id,
        p.patient_name,
        p.phone,
        p.notes,
        p.created_at,
        p.updated_at,
        COUNT(DISTINCT v.id) AS visits_count,
        MAX(v.visit_date) AS last_visit
      FROM patients p
      LEFT JOIN visits v ON v.patient_id = p.id
      WHERE
        ? = ''
        OR p.patient_name LIKE '%' || ? || '%'
        OR p.phone LIKE '%' || ? || '%'
      GROUP BY p.id
      ORDER BY p.patient_name COLLATE NOCASE
      LIMIT 300
    `).bind(search, search, search).all();

    return json({ ok: true, patients: result.results || [] });
  } catch (error) {
    console.error("adminListPatients:", error);
    return json({ ok: false, error: "database_error" }, 503);
  }
}

// GET /api/admin/patients/detail?id=123
export async function adminGetPatient({ request, env }) {
  const denied = await authorized(request, env);
  if (denied) return denied;

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isSafeInteger(id) || id < 1) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  try {
    const patient = await env.DB.prepare(`
      SELECT id, patient_name, phone, notes, created_at, updated_at
      FROM patients
      WHERE id = ?
    `).bind(id).first();

    if (!patient) return json({ ok: false, error: "not_found" }, 404);

    const visits = await env.DB.prepare(`
      SELECT id, patient_id, appointment_id, visit_date,
             service_type, diagnosis, treatment, notes, created_at
      FROM visits
      WHERE patient_id = ?
      ORDER BY visit_date DESC, id DESC
      LIMIT 200
    `).bind(id).all();

    const appointments = await env.DB.prepare(`
      SELECT id, service_type, scheduled_at, status, reference, source, created_at
      FROM appointments
      WHERE patient_id = ?
      ORDER BY datetime(created_at) DESC
      LIMIT 100
    `).bind(id).all();

    return json({
      ok: true,
      patient,
      visits: visits.results || [],
      appointments: appointments.results || []
    });
  } catch (error) {
    console.error("adminGetPatient:", error);
    return json({ ok: false, error: "database_error" }, 503);
  }
}

// POST /api/admin/visits
export async function adminCreateVisit({ request, env }) {
  const denied = await authorized(request, env, true);
  if (denied) return denied;

  const body = await readJson(request);
  const patientId = Number(body?.patient_id);
  const appointmentId = body?.appointment_id == null || body.appointment_id === ""
    ? null
    : Number(body.appointment_id);

  const visitDate = typeof body?.visit_date === "string"
    ? body.visit_date.trim()
    : "";

  const service = body?.service_type;
  const diagnosis = typeof body?.diagnosis === "string" ? body.diagnosis.trim() : "";
  const treatment = typeof body?.treatment === "string" ? body.treatment.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (
    !Number.isSafeInteger(patientId) || patientId < 1 ||
    (appointmentId !== null &&
      (!Number.isSafeInteger(appointmentId) || appointmentId < 1)) ||
    !validDate(visitDate) ||
    !SERVICES.has(service) ||
    diagnosis.length > 5000 ||
    treatment.length > 5000 ||
    notes.length > 5000
  ) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  try {
    const patient = await env.DB.prepare(
      "SELECT id FROM patients WHERE id = ?"
    ).bind(patientId).first();

    if (!patient) return json({ ok: false, error: "patient_not_found" }, 404);

    if (appointmentId !== null) {
      const appointment = await env.DB.prepare(
        "SELECT id FROM appointments WHERE id = ?"
      ).bind(appointmentId).first();

      if (!appointment) {
        return json({ ok: false, error: "appointment_not_found" }, 404);
      }
    }

    const visit = await env.DB.prepare(`
      INSERT INTO visits (
        patient_id, appointment_id, visit_date,
        service_type, diagnosis, treatment, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING id, patient_id, appointment_id, visit_date,
                service_type, diagnosis, treatment, notes, created_at
    `).bind(
      patientId,
      appointmentId,
      visitDate,
      service,
      diagnosis,
      treatment,
      notes
    ).first();

    return json({ ok: true, visit }, 201);
  } catch (error) {
    console.error("adminCreateVisit:", error);
    return json({ ok: false, error: "database_write_failed" }, 503);
  }
}

// GET /api/admin/reports?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function adminReports({ request, env }) {
  const denied = await authorized(request, env);
  if (denied) return denied;

  const url = new URL(request.url);
  const today = new Date().toISOString().slice(0, 10);
  const from = url.searchParams.get("from") || today;
  const to = url.searchParams.get("to") || today;

  if (!validDate(from) || !validDate(to) || from > to) {
    return json({ ok: false, error: "invalid_date_range" }, 400);
  }

  try {
    const appointmentStats = await env.DB.prepare(`
      SELECT status, COUNT(*) AS total
      FROM appointments
      WHERE date(created_at) BETWEEN ? AND ?
      GROUP BY status
    `).bind(from, to).all();

    const visitStats = await env.DB.prepare(`
      SELECT COUNT(*) AS total
      FROM visits
      WHERE visit_date BETWEEN ? AND ?
    `).bind(from, to).first();

    const serviceStats = await env.DB.prepare(`
      SELECT service_type, COUNT(*) AS total
      FROM visits
      WHERE visit_date BETWEEN ? AND ?
      GROUP BY service_type
      ORDER BY total DESC
    `).bind(from, to).all();

    const dailyVisits = await env.DB.prepare(`
      SELECT visit_date, COUNT(*) AS total
      FROM visits
      WHERE visit_date BETWEEN ? AND ?
      GROUP BY visit_date
      ORDER BY visit_date
    `).bind(from, to).all();

    const newPatients = await env.DB.prepare(`
      SELECT COUNT(*) AS total
      FROM patients
      WHERE date(created_at) BETWEEN ? AND ?
    `).bind(from, to).first();

    return json({
      ok: true,
      period: { from, to },
      appointments_by_status: appointmentStats.results || [],
      visits_total: visitStats?.total || 0,
      visits_by_service: serviceStats.results || [],
      visits_by_day: dailyVisits.results || [],
      new_patients: newPatients?.total || 0
    });
  } catch (error) {
    console.error("adminReports:", error);
    return json({ ok: false, error: "database_error" }, 503);
  }
}

// GET /api/admin/export
export async function adminExport({ request, env }) {
  const denied = await authorized(request, env);
  if (denied) return denied;

  try {
    const [patients, appointments, visits] = await Promise.all([
      env.DB.prepare("SELECT * FROM patients ORDER BY id").all(),
      env.DB.prepare("SELECT * FROM appointments ORDER BY id").all(),
      env.DB.prepare("SELECT * FROM visits ORDER BY id").all()
    ]);

    const backup = {
      application: "NOVA Dental Studio",
      format_version: 1,
      exported_at: new Date().toISOString(),
      patients: patients.results || [],
      appointments: appointments.results || [],
      visits: visits.results || []
    };

    return new Response(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="nova-backup.json"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("adminExport:", error);
    return json({ ok: false, error: "backup_failed" }, 503);
  }
      }
