// Public booking engine: options, availability, book, cancel, reschedule.
import { notifyAppointment } from "./notify.js";

const J = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
});
const hex = (buf) => Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, "0")).join("");
const rand = (n) => { const b = new Uint8Array(n); crypto.getRandomValues(b); return hex(b); };
export const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
async function hmac(value, secret) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(value)));
}
function sameOrigin(req) { const o = req.headers.get("Origin"); if (!o) return false; try { return new URL(o).origin === new URL(req.url).origin; } catch { return false; } }
async function body(req, max = 4096) {
  if (!(req.headers.get("Content-Type") || "").toLowerCase().includes("application/json")) return null;
  const raw = await req.text(); if (raw.length > max) return null;
  try { const b = JSON.parse(raw); return b && typeof b === "object" && !Array.isArray(b) ? b : null; } catch { return null; }
}

// ---------- pure helpers (exported for tests) ----------
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/, TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export function validDate(s) {
  if (!DATE_RE.test(s)) return false; const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d)); return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
export const weekdayOf = (date) => { const [y, m, d] = date.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
export const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
export const fromMin = (n) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export function addDays(date, n) { const [y, m, d] = date.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); }
export function localNow(tz, nowMs = Date.now()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(nowMs)).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}
const overlap = (a0, a1, b0, b1) => a0 < b1 && b0 < a1;

/** Slots for one dentist (or null = clinic-wide) on one date. Pure function. */
export function computeSlots({ date, hours, timeOff, appts, duration, step, now, minNotice }) {
  const wd = weekdayOf(date), out = [];
  const nowAbs = now.date === date ? now.minutes + minNotice : (now.date > date ? Infinity : -Infinity);
  const busy = [
    ...appts.map(a => [toMin(a.scheduled_at.slice(11, 16)), toMin(a.scheduled_at.slice(11, 16)) + a.duration_minutes]),
    ...timeOff.map(t => [t.starts_at.slice(0, 10) < date ? 0 : toMin(t.starts_at.slice(11, 16)), t.ends_at.slice(0, 10) > date ? 1440 : toMin(t.ends_at.slice(11, 16))])
  ];
  for (const h of hours.filter(h => h.weekday === wd)) {
    for (let s = toMin(h.start_time); s + duration <= toMin(h.end_time); s += step) {
      if (s < nowAbs) continue;
      if (busy.some(([b0, b1]) => overlap(s, s + duration, b0, b1))) continue;
      out.push(fromMin(s));
    }
  }
  return [...new Set(out)].sort();
}

// ---------- data loading ----------
async function settings(env) {
  const rows = (await env.DB.prepare("SELECT key,value FROM settings").all()).results || [];
  const s = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return { tz: s.timezone || "Africa/Algiers", step: Number(s.slot_step_minutes) || 30, minNotice: Number(s.min_notice_minutes) || 0, maxDays: Number(s.max_days_ahead) || 60, enabled: s.online_booking_enabled === "1" };
}
async function dentistsFor(env, serviceId) {
  return (await env.DB.prepare(`SELECT d.id,d.name FROM dentists d JOIN dentist_services ds ON ds.dentist_id=d.id
    WHERE d.active=1 AND ds.service_id=? ORDER BY d.sort_order,d.id`).bind(serviceId).all()).results || [];
}
async function slotsForDentist(env, st, dentistId, date, duration, now, ignoreAppointmentId = 0) {
  const own = (await env.DB.prepare("SELECT weekday,start_time,end_time FROM working_hours WHERE dentist_id=?").bind(dentistId).all()).results || [];
  const hours = own.length ? own : (await env.DB.prepare("SELECT weekday,start_time,end_time FROM working_hours WHERE dentist_id IS NULL").all()).results || [];
  const timeOff = (await env.DB.prepare(`SELECT starts_at,ends_at FROM time_off WHERE (dentist_id IS NULL OR dentist_id=?) AND substr(starts_at,1,10)<=? AND substr(ends_at,1,10)>=?`).bind(dentistId, date, date).all()).results || [];
  const appts = (await env.DB.prepare(`SELECT scheduled_at,duration_minutes FROM appointments WHERE dentist_id=? AND id!=? AND status IN ('pending','confirmed') AND substr(scheduled_at,1,10)=?`).bind(dentistId, ignoreAppointmentId, date).all()).results || [];
  return computeSlots({ date, hours, timeOff, appts, duration, step: st.step, now, minNotice: st.minNotice });
}
const dateInRange = (st, date, now) => validDate(date) && date >= now.date && date <= addDays(now.date, st.maxDays);

// ---------- handlers ----------
export async function bookingOptions({ env }) {
  const st = await settings(env);
  const services = (await env.DB.prepare("SELECT id,slug,name_ar,name_fr,name_en,duration_minutes,price_from FROM services WHERE active=1 AND bookable=1 ORDER BY sort_order,id").all()).results || [];
  const dentists = (await env.DB.prepare(`SELECT d.id,d.name,d.title_ar,d.title_fr,d.title_en,
    (SELECT group_concat(service_id) FROM dentist_services WHERE dentist_id=d.id) AS service_ids FROM dentists d WHERE d.active=1 ORDER BY d.sort_order,d.id`).all()).results || [];
  const hasHours = !!(await env.DB.prepare("SELECT 1 AS x FROM working_hours LIMIT 1").first());
  // Online booking is only offered when the clinic has actually configured dentists + hours.
  const available = st.enabled && hasHours && dentists.length > 0;
  return J({ ok: true, onlineBooking: available, timezone: st.tz, maxDaysAhead: st.maxDays,
    services, dentists: dentists.map(d => ({ ...d, service_ids: (d.service_ids || "").split(",").filter(Boolean).map(Number) })) });
}

export async function availability({ request, env }) {
  const u = new URL(request.url), slug = u.searchParams.get("service") || "", date = u.searchParams.get("date") || "", dq = u.searchParams.get("dentist") || "any";
  const st = await settings(env), now = localNow(st.tz);
  if (!st.enabled) return J({ ok: false, error: "booking_disabled" }, 503);
  if (!dateInRange(st, date, now)) return J({ ok: false, error: "invalid_date" }, 400);
  const svc = await env.DB.prepare("SELECT id,duration_minutes FROM services WHERE slug=? AND active=1 AND bookable=1").bind(slug).first();
  if (!svc) return J({ ok: false, error: "invalid_service" }, 400);
  let ds = await dentistsFor(env, svc.id);
  if (dq !== "any") { const id = Number(dq); ds = ds.filter(d => d.id === id); if (!ds.length) return J({ ok: false, error: "invalid_dentist" }, 400); }
  const map = {};
  for (const d of ds) for (const t of await slotsForDentist(env, st, d.id, date, svc.duration_minutes, now)) (map[t] ||= []).push(d.id);
  return J({ ok: true, date, slots: Object.keys(map).sort().map(t => ({ time: t, dentists: map[t] })) });
}

async function insertBooking(env, { ipHash, name, phone, email, svc, dentistId, startsAt, lang, tokenHash, reference, source = "website" }) {
  const now = Math.floor(Date.now() / 1000), rlToken = rand(16);
  const rl = env.DB.prepare(`INSERT INTO appointment_rate_limits (ip_hash,last_request_at,token) VALUES (?,?,?)
    ON CONFLICT(ip_hash) DO UPDATE SET last_request_at=excluded.last_request_at, token=excluded.token
    WHERE appointment_rate_limits.last_request_at <= excluded.last_request_at - 60 RETURNING token`).bind(ipHash, now, rlToken);
  const ins = env.DB.prepare(`INSERT INTO appointments (patient_name,phone,email,service_type,service_id,dentist_id,preferred_date,scheduled_at,duration_minutes,status,reference,source,language,manage_token_hash)
    SELECT ?,?,?,?,?,?,'',?,?,'pending',?,?,?,? WHERE EXISTS (SELECT 1 FROM appointment_rate_limits WHERE ip_hash=? AND token=?) RETURNING id,reference`)
    .bind(name, phone, email, svc.slug, svc.id, dentistId, startsAt, svc.duration_minutes, reference, source, lang, tokenHash, ipHash, rlToken);
  const res = await env.DB.batch([rl, ins]);
  if (!res[0]?.results?.length) return { error: "rate_limited" };
  return { row: res[1]?.results?.[0] };
}

export async function book({ request, env, ctx }) {
  if (!sameOrigin(request)) return J({ ok: false, error: "forbidden" }, 403);
  const b = await body(request); if (!b) return J({ ok: false, error: "invalid_input" }, 400);
  if (typeof b.website === "string" && b.website.trim()) return J({ ok: true, reference: "" }, 202); // honeypot
  if (!env.DB || !env.RATE_LIMIT_SECRET) return J({ ok: false, error: "server_configuration_error" }, 503);
  const name = String(b.name ?? "").trim().replace(/\s+/g, " "), phone = String(b.phone ?? "").trim().replace(/\s+/g, " "), email = String(b.email ?? "").trim().toLowerCase();
  const digits = phone.replace(/\D/g, ""), lang = ["ar", "fr", "en"].includes(b.language) ? b.language : "";
  if (name.length < 2 || name.length > 100 || /[\u0000-\u001F\u007F]/.test(name) || !/^[+()\d\s.-]{8,25}$/.test(phone) || digits.length < 8 || digits.length > 15
    || (email && (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))) || !lang || b.consent !== true
    || typeof b.date !== "string" || typeof b.time !== "string" || !TIME_RE.test(b.time)) return J({ ok: false, error: "invalid_input" }, 400);
  const st = await settings(env), now = localNow(st.tz);
  if (!st.enabled) return J({ ok: false, error: "booking_disabled" }, 503);
  if (!dateInRange(st, b.date, now)) return J({ ok: false, error: "invalid_date" }, 400);
  const svc = await env.DB.prepare("SELECT id,slug,duration_minutes FROM services WHERE slug=? AND active=1 AND bookable=1").bind(String(b.service)).first();
  if (!svc) return J({ ok: false, error: "invalid_service" }, 400);
  let candidates = await dentistsFor(env, svc.id);
  if (b.dentist !== "any" && b.dentist != null) { candidates = candidates.filter(d => d.id === Number(b.dentist)); if (!candidates.length) return J({ ok: false, error: "invalid_dentist" }, 400); }
  // Server-side availability check (the DB trigger is the final arbiter for races).
  const free = []; for (const d of candidates) if ((await slotsForDentist(env, st, d.id, b.date, svc.duration_minutes, now)).includes(b.time)) free.push(d);
  if (!free.length) return J({ ok: false, error: "slot_unavailable" }, 409);
  const ip = request.headers.get("CF-Connecting-IP"); if (!ip) return J({ ok: false, error: "ip_unavailable" }, 400);
  const ipHash = await hmac(`book:${ip}`, env.RATE_LIMIT_SECRET), startsAt = `${b.date}T${b.time}`, manageToken = rand(24), tokenHash = await sha256(manageToken);
  for (const d of free) {                       // "any dentist": fall through if a concurrent booking took the first choice
    try {
      const r = await insertBooking(env, { ipHash, name, phone, email, svc, dentistId: d.id, startsAt, lang, tokenHash, reference: `NOVA-${rand(8).toUpperCase()}` });
      if (r.error) return J({ ok: false, error: r.error }, 429);
      if (r.row) {
        ctx?.waitUntil?.(notifyAppointment(env, "created", { reference: r.row.reference, name, email, phone, service: svc.slug, startsAt, lang, manageToken, origin: new URL(request.url).origin }));
        return J({ ok: true, reference: r.row.reference, manageToken, scheduled_at: startsAt, status: "pending" }, 201);
      }
    } catch (e) { if (String(e?.message || "").includes("appointment_conflict")) continue; console.error("book error", e); return J({ ok: false, error: "database_write_failed" }, 503); }
  }
  return J({ ok: false, error: "slot_unavailable" }, 409);
}

async function loadManaged(env, ref, token) {
  if (typeof ref !== "string" || typeof token !== "string" || !/^NOVA-[A-Z0-9]{16}$/.test(ref) || !/^[a-f0-9]{48}$/.test(token)) return null;
  const a = await env.DB.prepare("SELECT id,patient_name,email,phone,service_id,service_type,dentist_id,scheduled_at,duration_minutes,status,language,manage_token_hash FROM appointments WHERE reference=?").bind(ref).first();
  if (!a || !a.manage_token_hash) return null;
  const given = await sha256(token); let diff = 0; for (let i = 0; i < 64; i++) diff |= given.charCodeAt(i) ^ a.manage_token_hash.charCodeAt(i);
  return diff === 0 ? a : null;
}
export async function manageLookup({ request, env }) {
  const u = new URL(request.url), a = await loadManaged(env, u.searchParams.get("ref"), u.searchParams.get("token"));
  if (!a) return J({ ok: false, error: "not_found" }, 404);
  return J({ ok: true, appointment: { reference: u.searchParams.get("ref"), service: a.service_type, scheduled_at: a.scheduled_at, status: a.status } });
}
function canChange(a, st, now) {
  if (!["pending", "confirmed"].includes(a.status) || !a.scheduled_at) return false;
  const d = a.scheduled_at.slice(0, 10); if (d < now.date) return false;
  return d > now.date || toMin(a.scheduled_at.slice(11, 16)) - now.minutes >= st.minNotice;
}
export async function manageCancel({ request, env, ctx }) {
  if (!sameOrigin(request)) return J({ ok: false, error: "forbidden" }, 403);
  const b = await body(request); const a = b && await loadManaged(env, b.reference, b.token);
  if (!a) return J({ ok: false, error: "not_found" }, 404);
  const st = await settings(env);
  if (!canChange(a, st, localNow(st.tz))) return J({ ok: false, error: "not_changeable" }, 409);
  await env.DB.prepare("UPDATE appointments SET status='cancelled' WHERE id=?").bind(a.id).run();
  ctx?.waitUntil?.(notifyAppointment(env, "cancelled", { reference: b.reference, name: a.patient_name, email: a.email, startsAt: a.scheduled_at, lang: a.language, origin: new URL(request.url).origin }));
  return J({ ok: true, status: "cancelled" });
}
export async function manageReschedule({ request, env, ctx }) {
  if (!sameOrigin(request)) return J({ ok: false, error: "forbidden" }, 403);
  const b = await body(request); const a = b && await loadManaged(env, b.reference, b.token);
  if (!a) return J({ ok: false, error: "not_found" }, 404);
  if (typeof b.date !== "string" || typeof b.time !== "string" || !TIME_RE.test(b.time)) return J({ ok: false, error: "invalid_input" }, 400);
  const st = await settings(env), now = localNow(st.tz);
  if (!canChange(a, st, now)) return J({ ok: false, error: "not_changeable" }, 409);
  if (!dateInRange(st, b.date, now)) return J({ ok: false, error: "invalid_date" }, 400);
  if (!a.dentist_id) return J({ ok: false, error: "not_changeable" }, 409);
  const svc = await env.DB.prepare("SELECT duration_minutes FROM services WHERE id=?").bind(a.service_id).first();
  const ok = (await slotsForDentist(env, st, a.dentist_id, b.date, svc?.duration_minutes || a.duration_minutes, now, a.id)).includes(b.time);
  if (!ok) return J({ ok: false, error: "slot_unavailable" }, 409);
  try {
    // Rescheduling returns the appointment to 'pending' so staff re-confirm the new time.
    await env.DB.prepare("UPDATE appointments SET scheduled_at=?, status='pending' WHERE id=?").bind(`${b.date}T${b.time}`, a.id).run();
  } catch (e) { if (String(e?.message || "").includes("appointment_conflict")) return J({ ok: false, error: "slot_unavailable" }, 409); throw e; }
  ctx?.waitUntil?.(notifyAppointment(env, "rescheduled", { reference: b.reference, name: a.patient_name, email: a.email, startsAt: `${b.date}T${b.time}`, lang: a.language, origin: new URL(request.url).origin }));
  return J({ ok: true, scheduled_at: `${b.date}T${b.time}`, status: "pending" });
}
