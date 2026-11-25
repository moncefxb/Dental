// Admin management API (all routes require an admin session; writes require same-origin).
import { json, readJson, requireAdmin, audit, hashPassword, passwordOk } from "./auth.js";
import { notifyAppointment } from "./notify.js";

const str = (v, max, min = 0) => typeof v === "string" && v.trim().length >= min && v.trim().length <= max ? v.trim() : null;
const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi ? v : null;
const flag = (v) => v === true || v === 1 ? 1 : v === false || v === 0 ? 0 : null;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/, DT = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/;
const bad = (field) => json({ ok: false, error: "invalid_input", field }, 400);
const rows = async (env, sql, ...a) => (await env.DB.prepare(sql).bind(...a).all()).results || [];

const R = {
  async services({ env, request, user, method, b }) {
    if (method === "GET") return json({ ok: true, services: await rows(env, "SELECT * FROM services ORDER BY sort_order,id") });
    const f = { slug: str(b.slug, 40, 2), name_ar: str(b.name_ar, 120, 1), name_fr: str(b.name_fr, 120, 1), name_en: str(b.name_en, 120, 1),
      duration_minutes: int(b.duration_minutes, 5, 480), bookable: flag(b.bookable), active: flag(b.active), sort_order: int(b.sort_order ?? 0, 0, 999),
      price_from: b.price_from == null || b.price_from === "" ? null : int(b.price_from, 0, 100000000) };
    for (const [k, v] of Object.entries(f)) if (v === null && k !== "price_from") return bad(k);
    if (b.price_from != null && b.price_from !== "" && f.price_from === null) return bad("price_from");
    if (!/^[a-z0-9-]+$/.test(f.slug)) return bad("slug");
    try {
      if (b.id) {
        const r = await env.DB.prepare("UPDATE services SET slug=?,name_ar=?,name_fr=?,name_en=?,duration_minutes=?,bookable=?,active=?,sort_order=?,price_from=? WHERE id=? RETURNING id")
          .bind(f.slug, f.name_ar, f.name_fr, f.name_en, f.duration_minutes, f.bookable, f.active, f.sort_order, f.price_from, b.id).first();
        if (!r) return json({ ok: false, error: "not_found" }, 404);
        await audit(env, request, user.username, "service.update", "service", r.id); return json({ ok: true, id: r.id });
      }
      const r = await env.DB.prepare("INSERT INTO services (slug,name_ar,name_fr,name_en,duration_minutes,bookable,active,sort_order,price_from) VALUES (?,?,?,?,?,?,?,?,?) RETURNING id")
        .bind(f.slug, f.name_ar, f.name_fr, f.name_en, f.duration_minutes, f.bookable, f.active, f.sort_order, f.price_from).first();
      await audit(env, request, user.username, "service.create", "service", r.id); return json({ ok: true, id: r.id }, 201);
    } catch (e) { return String(e.message).includes("UNIQUE") ? json({ ok: false, error: "duplicate_slug" }, 409) : Promise.reject(e); }
  },
  async dentists({ env, request, user, method, b }) {
    if (method === "GET") {
      const d = await rows(env, "SELECT * FROM dentists ORDER BY sort_order,id"), l = await rows(env, "SELECT dentist_id,service_id FROM dentist_services");
      return json({ ok: true, dentists: d.map(x => ({ ...x, service_ids: l.filter(y => y.dentist_id === x.id).map(y => y.service_id) })) });
    }
    const f = { name: str(b.name, 120, 2), active: flag(b.active), sort_order: int(b.sort_order ?? 0, 0, 999) };
    for (const k of ["title", "bio"]) for (const l of ["ar", "fr", "en"]) { const v = str(b[`${k}_${l}`] ?? "", k === "bio" ? 2000 : 160); if (v === null && (b[`${k}_${l}`] ?? "") !== "") return bad(`${k}_${l}`); f[`${k}_${l}`] = v ?? ""; }
    for (const [k, v] of Object.entries(f)) if (v === null) return bad(k);
    const ids = Array.isArray(b.service_ids) ? b.service_ids.filter(Number.isInteger) : [];
    const cols = "name,active,sort_order,title_ar,title_fr,title_en,bio_ar,bio_fr,bio_en", vals = [f.name, f.active, f.sort_order, f.title_ar, f.title_fr, f.title_en, f.bio_ar, f.bio_fr, f.bio_en];
    let id = b.id;
    if (id) {
      const r = await env.DB.prepare(`UPDATE dentists SET ${cols.split(",").map(c => c + "=?").join(",")} WHERE id=? RETURNING id`).bind(...vals, id).first();
      if (!r) return json({ ok: false, error: "not_found" }, 404);
    } else id = (await env.DB.prepare(`INSERT INTO dentists (${cols}) VALUES (${vals.map(() => "?").join(",")}) RETURNING id`).bind(...vals).first()).id;
    await env.DB.batch([env.DB.prepare("DELETE FROM dentist_services WHERE dentist_id=?").bind(id),
      ...ids.map(s => env.DB.prepare("INSERT INTO dentist_services (dentist_id,service_id) SELECT ?,id FROM services WHERE id=?").bind(id, s))]);
    await audit(env, request, user.username, b.id ? "dentist.update" : "dentist.create", "dentist", id); return json({ ok: true, id }, b.id ? 200 : 201);
  },
  async hours({ env, request, user, method, b }) {
    if (method === "GET") return json({ ok: true, hours: await rows(env, "SELECT id,dentist_id,weekday,start_time,end_time FROM working_hours ORDER BY dentist_id,weekday,start_time") });
    const did = b.dentist_id === null || b.dentist_id === undefined ? null : int(b.dentist_id, 1, 1e9); if (b.dentist_id != null && did === null) return bad("dentist_id");
    if (!Array.isArray(b.rows) || b.rows.length > 50) return bad("rows");
    for (const r of b.rows) if (int(r.weekday, 0, 6) === null || !TIME.test(r.start_time) || !TIME.test(r.end_time) || r.start_time >= r.end_time) return bad("rows");
    const byDay = {}; for (const r of b.rows) (byDay[r.weekday] ||= []).push(r);
    for (const list of Object.values(byDay)) { list.sort((x, y) => x.start_time.localeCompare(y.start_time)); for (let i = 1; i < list.length; i++) if (list[i].start_time < list[i - 1].end_time) return bad("overlapping_rows"); }
    await env.DB.batch([env.DB.prepare("DELETE FROM working_hours WHERE dentist_id IS ?").bind(did),
      ...b.rows.map(r => env.DB.prepare("INSERT INTO working_hours (dentist_id,weekday,start_time,end_time) VALUES (?,?,?,?)").bind(did, r.weekday, r.start_time, r.end_time))]);
    await audit(env, request, user.username, "hours.replace", "working_hours", did ?? "clinic", `${b.rows.length} rows`); return json({ ok: true });
  },
  async timeoff({ env, request, user, method, b }) {
    if (method === "GET") return json({ ok: true, timeoff: await rows(env, "SELECT * FROM time_off ORDER BY starts_at DESC LIMIT 200") });
    if (b.action === "delete") { const r = await env.DB.prepare("DELETE FROM time_off WHERE id=? RETURNING id").bind(b.id).first(); if (!r) return json({ ok: false, error: "not_found" }, 404); await audit(env, request, user.username, "timeoff.delete", "time_off", b.id); return json({ ok: true }); }
    const did = b.dentist_id == null ? null : int(b.dentist_id, 1, 1e9);
    if ((b.dentist_id != null && did === null) || !DT.test(b.starts_at) || !DT.test(b.ends_at) || b.starts_at >= b.ends_at) return bad("range");
    const reason = str(b.reason ?? "", 200); if (reason === null) return bad("reason");
    const r = await env.DB.prepare("INSERT INTO time_off (dentist_id,starts_at,ends_at,reason) VALUES (?,?,?,?) RETURNING id").bind(did, b.starts_at, b.ends_at, reason).first();
    await audit(env, request, user.username, "timeoff.create", "time_off", r.id); return json({ ok: true, id: r.id }, 201);
  },
  async settings({ env, request, user, method, b }) {
    const spec = { timezone: v => { try { new Intl.DateTimeFormat("en", { timeZone: v }); return typeof v === "string" && v.length < 60; } catch { return false; } },
      slot_step_minutes: v => [10, 15, 20, 30, 45, 60].includes(Number(v)), min_notice_minutes: v => int(Number(v), 0, 10080) !== null,
      max_days_ahead: v => int(Number(v), 1, 365) !== null, online_booking_enabled: v => ["0", "1"].includes(String(v)) };
    if (method === "GET") return json({ ok: true, settings: Object.fromEntries((await rows(env, "SELECT key,value FROM settings")).map(r => [r.key, r.value])) });
    const entries = Object.entries(b.settings || {}); if (!entries.length) return bad("settings");
    for (const [k, v] of entries) if (!spec[k] || !spec[k](v)) return bad(k);
    await env.DB.batch(entries.map(([k, v]) => env.DB.prepare("INSERT INTO settings (key,value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").bind(k, String(v))));
    await audit(env, request, user.username, "settings.update", "settings", "", entries.map(e => e[0]).join(",")); return json({ ok: true });
  },
  async audit({ env, method }) { return method === "GET" ? json({ ok: true, logs: await rows(env, "SELECT id,at,actor,action,entity,entity_id,detail FROM audit_logs ORDER BY id DESC LIMIT 200") }) : json({ ok: false, error: "method_not_allowed" }, 405); },
  async users({ env, request, user, method, b }) {
    if (method === "GET") return json({ ok: true, users: await rows(env, "SELECT id,username,role,active,created_at FROM admin_users ORDER BY id") });
    if (b.action === "create") {
      const u = str(b.username, 64, 3); if (!u || !/^[a-z0-9._-]+$/i.test(u) || !passwordOk(b.password) || !["admin", "staff"].includes(b.role)) return bad("user");
      try { const r = await env.DB.prepare("INSERT INTO admin_users (username,password_hash,role) VALUES (?,?,?) RETURNING id").bind(u.toLowerCase(), await hashPassword(b.password), b.role).first(); await audit(env, request, user.username, "user.create", "admin_user", r.id, b.role); return json({ ok: true, id: r.id }, 201); }
      catch (e) { return String(e.message).includes("UNIQUE") ? json({ ok: false, error: "duplicate_username" }, 409) : Promise.reject(e); }
    }
    if (b.action === "set_active") {
      if (b.id === user.id) return json({ ok: false, error: "cannot_disable_self" }, 409);
      const r = await env.DB.prepare("UPDATE admin_users SET active=? WHERE id=? RETURNING id").bind(flag(b.active) ?? 0, b.id).first(); if (!r) return json({ ok: false, error: "not_found" }, 404);
      if (!b.active) await env.DB.prepare("DELETE FROM admin_sessions WHERE user_id=?").bind(b.id).run();
      await audit(env, request, user.username, b.active ? "user.enable" : "user.disable", "admin_user", b.id); return json({ ok: true });
    }
    return bad("action");
  }
};
// Staff may manage appointments/patients (existing endpoints) and read configuration; configuration writes + users + audit are admin-only.
const ADMIN_ONLY_WRITE = new Set(["services", "dentists", "hours", "timeoff", "settings"]), ADMIN_ONLY = new Set(["users", "audit"]);

export async function adminManage({ request, env, ctx }, resource) {
  const method = request.method; if (!R[resource]) return json({ ok: false, error: "not_found" }, 404);
  const write = method === "POST";
  const a = await requireAdmin(request, env, { write, role: ADMIN_ONLY.has(resource) || (write && ADMIN_ONLY_WRITE.has(resource)) ? "admin" : null });
  if (a.response) return a.response;
  let b = {}; if (write) { b = await readJson(request, 16384); if (!b) return json({ ok: false, error: "invalid_input" }, 400); }
  try { return await R[resource]({ env, request, user: a.user, method, b }); }
  catch (e) { console.error("manage error", resource, e?.message); return json({ ok: false, error: "database_error" }, 503); }
}
// Appointment status change that also notifies the patient (confirm / cancel by staff).
export async function adminSetStatus({ request, env, ctx }) {
  const a = await requireAdmin(request, env, { write: true }); if (a.response) return a.response;
  const b = await readJson(request); if (!b || !Number.isSafeInteger(b.id) || !["confirmed", "cancelled", "rejected"].includes(b.status)) return json({ ok: false, error: "invalid_input" }, 400);
  try {
    const r = await env.DB.prepare("UPDATE appointments SET status=? WHERE id=? RETURNING id,status,patient_name,email,scheduled_at,reference,language").bind(b.status, b.id).first();
    if (!r) return json({ ok: false, error: "not_found" }, 404);
    await audit(env, request, a.user.username, `appointment.${b.status}`, "appointment", r.id);
    if (r.status === "confirmed" || r.status === "cancelled") ctx?.waitUntil?.(notifyAppointment(env, r.status, { reference: r.reference, name: r.patient_name, email: r.email, startsAt: r.scheduled_at, lang: r.language, origin: new URL(request.url).origin }));
    return json({ ok: true, appointment: { id: r.id, status: r.status } });
  } catch (e) { return String(e?.message).includes("appointment_conflict") ? json({ ok: false, error: "appointment_conflict" }, 409) : json({ ok: false, error: "database_error" }, 503); }
}
