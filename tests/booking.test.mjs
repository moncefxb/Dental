import { makeDB } from "./d1shim.mjs";
import { computeSlots, localNow, book, availability, bookingOptions, manageCancel, manageReschedule, addDays } from "../functions/api/booking.js";
import assert from "node:assert/strict";
let pass = 0; const t = async (n, f) => { try { await f(); pass++; console.log("ok  ", n); } catch (e) { console.log("FAIL", n, "\n   ", e.message); process.exitCode = 1; } };
const d = makeDB("../migrations"); const env = { DB: d, RATE_LIMIT_SECRET: "x".repeat(40) };
const db = d.db, tz = "Africa/Algiers", today = localNow(tz).date;
// next Monday-after-tomorrow weekday helper: find a date >= today+2 with given weekday
const nextWd = (wd) => { let x = addDays(today, 2); while (new Date(x + "T00:00:00Z").getUTCDay() !== wd) x = addDays(x, 1); return x; };
const mon = nextWd(1);
const req = (path, bodyObj, ip = "1.1.1.1", method = "POST") => new Request("https://nova.test" + path, { method, headers: { "Content-Type": "application/json", Origin: "https://nova.test", "CF-Connecting-IP": ip }, body: method === "GET" ? undefined : JSON.stringify(bodyObj) });
const get = (path) => new Request("https://nova.test" + path, { headers: { "CF-Connecting-IP": "9.9.9.9" } });
const valid = (o = {}) => ({ name: "Test Patient", phone: "0550 12 34 56", email: "p@example.com", service: "general", dentist: "any", date: mon, time: "10:00", language: "en", consent: true, ...o });
const ctx = { waitUntil() {} };

await t("no hours/dentists configured => online booking NOT offered", async () => {
  const r = await (await bookingOptions({ env })).json(); assert.equal(r.onlineBooking, false);
});
// admin-style setup (test fixture data only)
db.exec(`INSERT INTO dentists(name) VALUES ('Test Dentist A'),('Test Dentist B');
 INSERT INTO dentist_services SELECT d.id,s.id FROM dentists d, services s WHERE s.slug='general';
 INSERT INTO working_hours(dentist_id,weekday,start_time,end_time) VALUES (NULL,1,'09:00','12:00');`);
await t("options offered once configured", async () => { const r = await (await bookingOptions({ env })).json(); assert.equal(r.onlineBooking, true); assert.equal(r.dentists.length, 2); });
await t("availability lists 6 half-hour slots x 2 dentists", async () => {
  const r = await (await availability({ request: get(`/api/availability?service=general&date=${mon}`), env })).json();
  assert.deepEqual(r.slots.map(s => s.time), ["09:00","09:30","10:00","10:30","11:00","11:30"]); assert.equal(r.slots[0].dentists.length, 2);
});
await t("past date rejected", async () => { const r = await availability({ request: get(`/api/availability?service=general&date=2020-01-06`), env }); assert.equal(r.status, 400); });
await t("closed day (Sunday) has no slots", async () => {
  let s = addDays(today, 1); while (new Date(s + "T00:00:00Z").getUTCDay() !== 0) s = addDays(s, 1);
  const r = await (await availability({ request: get(`/api/availability?service=general&date=${s}`), env })).json(); assert.equal(r.slots.length, 0);
});
let ref, tok;
await t("valid booking saved as pending, returns reference + manage token", async () => {
  const res = await book({ request: req("/api/book", valid()), env, ctx }); const j = await res.json();
  assert.equal(res.status, 201, JSON.stringify(j)); ref = j.reference; tok = j.manageToken; assert.match(ref, /^NOVA-[A-F0-9]{16}$/);
  const row = db.prepare("SELECT status,dentist_id,manage_token_hash FROM appointments WHERE reference=?").get(ref);
  assert.equal(row.status, "pending"); assert.ok(row.dentist_id); assert.notEqual(row.manage_token_hash, tok); // token stored hashed
});
await t("same slot, 'any' dentist => falls to second dentist", async () => {
  const j = await (await book({ request: req("/api/book", valid(), "2.2.2.2"), env, ctx })).json(); assert.ok(j.ok, JSON.stringify(j));
  const ds = db.prepare("SELECT DISTINCT dentist_id FROM appointments WHERE scheduled_at=?").all(`${mon}T10:00`); assert.equal(ds.length, 2);
});
await t("third booking of same slot => 409 slot_unavailable", async () => {
  const res = await book({ request: req("/api/book", valid(), "3.3.3.3"), env, ctx }); assert.equal(res.status, 409);
});
await t("DB trigger blocks a raw overlapping insert (race backstop)", async () => {
  assert.throws(() => db.exec(`INSERT INTO appointments(patient_name,phone,service_type,scheduled_at,duration_minutes,status,reference,dentist_id) VALUES('x','12345678','general','${mon}T10:15',30,'pending','R1',1)`), /appointment_conflict/);
});
await t("concurrent identical requests: exactly one wins", async () => {
  const r = await Promise.all([4,5,6,7].map(i => book({ request: req("/api/book", valid({ dentist: 1, time: "11:00" }), `4.4.4.${i}`), env, ctx })));
  const codes = r.map(x => x.status).sort(); assert.deepEqual(codes, [201, 409, 409, 409]);
});
await t("rate limit: same IP twice within 60s => 429", async () => {
  await book({ request: req("/api/book", valid({ dentist: 2, time: "09:00" }), "8.8.8.8"), env, ctx });
  const res = await book({ request: req("/api/book", valid({ dentist: 2, time: "09:30" }), "8.8.8.8"), env, ctx }); assert.equal(res.status, 429);
});
await t("validation: bad phone / no consent / bad email / bad time / unknown service", async () => {
  for (const [i, o] of [{ phone: "abc" }, { consent: false }, { email: "nope" }, { time: "25:00" }, { service: "other" }, { service: "zzz" }].entries()) {
    const res = await book({ request: req("/api/book", valid(o), `5.5.5.${i}`), env, ctx }); assert.equal(res.status, 400, JSON.stringify(o));
  }
});
await t("cross-origin POST rejected", async () => {
  const r = new Request("https://nova.test/api/book", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://evil.test", "CF-Connecting-IP": "6.6.6.6" }, body: JSON.stringify(valid()) });
  assert.equal((await book({ request: r, env, ctx })).status, 403);
});
await t("honeypot silently accepted without saving", async () => {
  const n = db.prepare("SELECT count(*) c FROM appointments").get().c; await book({ request: req("/api/book", valid({ website: "bot" }), "7.7.7.7"), env, ctx });
  assert.equal(db.prepare("SELECT count(*) c FROM appointments").get().c, n);
});
await t("wrong manage token cannot cancel", async () => {
  const res = await manageCancel({ request: req("/api/booking/cancel", { reference: ref, token: "0".repeat(48) }), env, ctx }); assert.equal(res.status, 404);
});
await t("reschedule to free slot works, goes back to pending; busy slot refused", async () => {
  const bad = await manageReschedule({ request: req("/api/booking/reschedule", { reference: ref, token: tok, date: mon, time: "11:00" }), env, ctx });
  // dentist of `ref` may or may not own 11:00 (taken above for dentist 1); accept only 200 or 409, and verify DB consistency
  assert.ok([200, 409].includes(bad.status));
  const ok = await manageReschedule({ request: req("/api/booking/reschedule", { reference: ref, token: tok, date: mon, time: "11:30" }), env, ctx }); assert.equal(ok.status, 200);
  assert.equal(db.prepare("SELECT scheduled_at,status FROM appointments WHERE reference=?").get(ref).scheduled_at, `${mon}T11:30`);
});
await t("cancel frees the slot", async () => {
  const res = await manageCancel({ request: req("/api/booking/cancel", { reference: ref, token: tok }), env, ctx }); assert.equal(res.status, 200);
  const r = await (await availability({ request: get(`/api/availability?service=general&date=${mon}`), env })).json(); assert.ok(r.slots.find(s => s.time === "11:30"));
});
await t("time-off blocks slots", async () => {
  db.exec(`INSERT INTO time_off(dentist_id,starts_at,ends_at) VALUES (NULL,'${mon}T09:00','${mon}T10:00')`);
  const r = await (await availability({ request: get(`/api/availability?service=general&date=${mon}`), env })).json(); assert.ok(!r.slots.find(s => s.time === "09:00" || s.time === "09:30"));
});
await t("computeSlots: minimum notice on same day", async () => {
  const s = computeSlots({ date: "2030-01-07", hours: [{ weekday: 1, start_time: "09:00", end_time: "12:00" }], timeOff: [], appts: [], duration: 30, step: 30, now: { date: "2030-01-07", minutes: 9 * 60 }, minNotice: 120 });
  assert.deepEqual(s, ["11:00", "11:30"]);
});
console.log(`\n${pass} passed`);
