import { makeDB } from "./d1shim.mjs";
import worker from "../src/index.js";
import assert from "node:assert/strict";
let pass = 0; const t = async (n, f) => { try { await f(); pass++; console.log("ok  ", n); } catch (e) { console.log("FAIL", n, "\n   ", e.message); process.exitCode = 1; } };
const d = makeDB("../migrations");
const env = { DB: d, RATE_LIMIT_SECRET: "r".repeat(40), ADMIN_USERNAME: "owner", ADMIN_PASSWORD: "Bootstrap-Pass-123", ASSETS: { fetch: async () => new Response("asset") } };
const ctx = { waitUntil() {} };
const call = async (path, { method = "GET", body, cookie, ip = "10.0.0.1", origin = "https://nova.test" } = {}) => {
  const h = { "CF-Connecting-IP": ip }; if (origin) h.Origin = origin; if (cookie) h.Cookie = cookie; if (body) h["Content-Type"] = "application/json";
  const res = await worker.fetch(new Request("https://nova.test" + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined }), env, ctx);
  const text = await res.text(); let j = null; try { j = JSON.parse(text); } catch {} return { res, j, cookie: (res.headers.get("Set-Cookie") || "").split(";")[0] };
};
let ck;
await t("unauthenticated admin API => 401", async () => { for (const p of ["/api/admin/appointments", "/api/admin/patients", "/api/admin/services", "/api/admin/audit", "/api/admin/export"]) assert.equal((await call(p)).res.status, 401, p); });
await t("wrong password => 401, no session", async () => { assert.equal((await call("/api/admin/login", { method: "POST", body: { username: "owner", password: "nope" } })).res.status, 401); });
await t("bootstrap login creates HASHED admin; cookie is HttpOnly+Secure+Strict", async () => {
  const r = await call("/api/admin/login", { method: "POST", body: { username: "Owner", password: "Bootstrap-Pass-123" } }); assert.equal(r.res.status, 200);
  const sc = r.res.headers.get("Set-Cookie"); assert.match(sc, /HttpOnly/); assert.match(sc, /Secure/); assert.match(sc, /SameSite=Strict/); ck = r.cookie;
  const u = d.db.prepare("SELECT password_hash FROM admin_users").get(); assert.match(u.password_hash, /^pbkdf2\$sha256\$100000\$/); assert.ok(!u.password_hash.includes("Bootstrap"));
  const s = d.db.prepare("SELECT token_hash FROM admin_sessions").get(); assert.ok(!ck.includes(s.token_hash)); // only hash stored
});
await t("session works on legacy endpoints (patients, appointments)", async () => { assert.equal((await call("/api/admin/patients", { cookie: ck })).res.status, 200); assert.equal((await call("/api/admin/appointments", { cookie: ck })).res.status, 200); });
await t("env password no longer works once a user exists with a different password", async () => {
  d.db.exec("UPDATE admin_users SET password_hash=(SELECT password_hash FROM admin_users)"); // no-op; ensure second bootstrap impossible:
  const r = await call("/api/admin/login", { method: "POST", ip: "10.0.0.2", body: { username: "attacker", password: "Bootstrap-Pass-123" } }); assert.equal(r.res.status, 401);
});
await t("CSRF: write without same Origin => 403", async () => { assert.equal((await call("/api/admin/services", { method: "POST", cookie: ck, origin: null, body: {} })).res.status, 403); assert.equal((await call("/api/admin/services", { method: "POST", cookie: ck, origin: "https://evil.test", body: {} })).res.status, 403); });
await t("service create/update validated + audited", async () => {
  const ok = await call("/api/admin/services", { method: "POST", cookie: ck, body: { slug: "whitening", name_ar: "تبييض", name_fr: "Blanchiment", name_en: "Whitening", duration_minutes: 45, bookable: 1, active: 1, price_from: 8000 } }); assert.equal(ok.res.status, 201);
  assert.equal((await call("/api/admin/services", { method: "POST", cookie: ck, body: { slug: "BAD SLUG", name_ar: "a", name_fr: "a", name_en: "a", duration_minutes: 45, bookable: 1, active: 1 } })).res.status, 400);
  assert.equal((await call("/api/admin/services", { method: "POST", cookie: ck, body: { slug: "whitening", name_ar: "a", name_fr: "a", name_en: "a", duration_minutes: 45, bookable: 1, active: 1 } })).res.status, 409);
  assert.equal((await call("/api/admin/services", { method: "POST", cookie: ck, body: { slug: "x1", name_ar: "a", name_fr: "a", name_en: "a", duration_minutes: 99999, bookable: 1, active: 1 } })).res.status, 400);
});
await t("SQL-injection style input is stored inertly / rejected", async () => {
  const r = await call("/api/admin/dentists", { method: "POST", cookie: ck, body: { name: "Robert'); DROP TABLE appointments;--", active: 1, service_ids: [1] } }); assert.equal(r.res.status, 201);
  assert.ok(d.db.prepare("SELECT count(*) c FROM appointments").get().c >= 0); assert.equal(d.db.prepare("SELECT name FROM dentists").get().name, "Robert'); DROP TABLE appointments;--");
});
await t("working hours: valid saved, overlapping/invalid rejected", async () => {
  assert.equal((await call("/api/admin/hours", { method: "POST", cookie: ck, body: { dentist_id: null, rows: [{ weekday: 1, start_time: "09:00", end_time: "12:00" }, { weekday: 1, start_time: "14:00", end_time: "18:00" }] } })).res.status, 200);
  assert.equal((await call("/api/admin/hours", { method: "POST", cookie: ck, body: { dentist_id: null, rows: [{ weekday: 1, start_time: "09:00", end_time: "12:00" }, { weekday: 1, start_time: "11:00", end_time: "13:00" }] } })).res.status, 400);
  assert.equal((await call("/api/admin/hours", { method: "POST", cookie: ck, body: { dentist_id: null, rows: [{ weekday: 9, start_time: "09:00", end_time: "12:00" }] } })).res.status, 400);
  assert.equal(d.db.prepare("SELECT count(*) c FROM working_hours").get().c, 2); // failed saves did not wipe data
});
await t("settings whitelist + validation", async () => {
  assert.equal((await call("/api/admin/settings", { method: "POST", cookie: ck, body: { settings: { timezone: "Not/AZone" } } })).res.status, 400);
  assert.equal((await call("/api/admin/settings", { method: "POST", cookie: ck, body: { settings: { admin_password: "x" } } })).res.status, 400);
  assert.equal((await call("/api/admin/settings", { method: "POST", cookie: ck, body: { settings: { slot_step_minutes: "15" } } })).res.status, 200);
});
let staffCk;
await t("staff role: can use appointments, cannot change config / see audit / manage users", async () => {
  assert.equal((await call("/api/admin/users", { method: "POST", cookie: ck, body: { action: "create", username: "reception", password: "weak", role: "staff" } })).res.status, 400);
  assert.equal((await call("/api/admin/users", { method: "POST", cookie: ck, body: { action: "create", username: "reception", password: "Reception-Pass-99", role: "staff" } })).res.status, 201);
  const l = await call("/api/admin/login", { method: "POST", ip: "10.0.0.3", body: { username: "reception", password: "Reception-Pass-99" } }); assert.equal(l.res.status, 200); staffCk = l.cookie;
  assert.equal((await call("/api/admin/appointments", { cookie: staffCk })).res.status, 200);
  assert.equal((await call("/api/admin/services", { cookie: staffCk })).res.status, 200);
  assert.equal((await call("/api/admin/settings", { method: "POST", cookie: staffCk, body: { settings: { slot_step_minutes: "10" } } })).res.status, 403);
  assert.equal((await call("/api/admin/audit", { cookie: staffCk })).res.status, 403);
  assert.equal((await call("/api/admin/users", { cookie: staffCk })).res.status, 403);
});
await t("status change by staff is audited and notifies (email skipped when unconfigured)", async () => {
  d.db.exec("INSERT INTO appointments(patient_name,phone,service_type,reference,status) VALUES ('P','12345678','general','NOVA-AAAAAAAAAAAAAAAA','pending')");
  const r = await call("/api/admin/appointments/status", { method: "POST", cookie: staffCk, body: { id: 1, status: "confirmed" } }); assert.equal(r.res.status, 200);
  assert.ok(d.db.prepare("SELECT 1 FROM audit_logs WHERE action='appointment.confirmed' AND actor='reception'").get());
});
await t("audit log has entries and contains no patient name/phone", async () => {
  const j = (await call("/api/admin/audit", { cookie: ck })).j; assert.ok(j.logs.length > 5); const s = JSON.stringify(j.logs); assert.ok(!s.includes("12345678") && !/"P"/.test(s));
});
await t("brute force: 5 bad logins from one IP => 429 even with right password", async () => {
  for (let i = 0; i < 5; i++) await call("/api/admin/login", { method: "POST", ip: "66.6.6.6", body: { username: "owner", password: "bad" + i } });
  assert.equal((await call("/api/admin/login", { method: "POST", ip: "66.6.6.6", body: { username: "owner", password: "Bootstrap-Pass-123" } })).res.status, 429);
});
await t("password change: weak rejected, strong works, other sessions revoked", async () => {
  assert.equal((await call("/api/admin/password", { method: "POST", cookie: ck, body: { current: "Bootstrap-Pass-123", next: "short" } })).res.status, 400);
  assert.equal((await call("/api/admin/password", { method: "POST", cookie: ck, body: { current: "wrong", next: "A-Much-Longer-Pass-1" } })).res.status, 401);
  const second = (await call("/api/admin/login", { method: "POST", ip: "10.0.0.9", body: { username: "owner", password: "Bootstrap-Pass-123" } })).cookie;
  assert.equal((await call("/api/admin/password", { method: "POST", cookie: ck, body: { current: "Bootstrap-Pass-123", next: "A-Much-Longer-Pass-1" } })).res.status, 200);
  assert.equal((await call("/api/admin/session", { cookie: second })).j.authenticated, false); assert.equal((await call("/api/admin/session", { cookie: ck })).j.authenticated, true);
});
await t("logout revokes the session server-side (replaying the cookie fails)", async () => {
  await call("/api/admin/logout", { method: "POST", cookie: ck }); assert.equal((await call("/api/admin/appointments", { cookie: ck })).res.status, 401);
});
await t("disabling a user kills their live sessions", async () => {
  const o = (await call("/api/admin/login", { method: "POST", ip: "10.0.0.11", body: { username: "owner", password: "A-Much-Longer-Pass-1" } })).cookie;
  assert.equal((await call("/api/admin/users", { method: "POST", cookie: o, body: { action: "set_active", id: 2, active: 0 } })).res.status, 200);
  assert.equal((await call("/api/admin/appointments", { cookie: staffCk })).res.status, 401);
  assert.equal((await call("/api/admin/users", { method: "POST", cookie: o, body: { action: "set_active", id: 1, active: 0 } })).res.status, 409);
});
await t("forged / malformed cookies rejected", async () => { for (const c of ["nova_admin_session=" + "a".repeat(64), "nova_admin_session=1.2.3", "nova_admin_session="]) assert.equal((await call("/api/admin/appointments", { cookie: c })).res.status, 401); });
await t("health + unknown API route + public static pass-through", async () => { assert.equal((await call("/api/health")).res.status, 200); assert.equal((await call("/api/nope")).res.status, 404); assert.equal((await call("/index.html")).res.status, 200); });
console.log(`\n${pass} passed`);
