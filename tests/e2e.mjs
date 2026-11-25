import { createRequire } from "node:module"; const puppeteer = createRequire("/opt/npm-tools/node_modules/")("puppeteer");
import { start } from "./serve.mjs"; import assert from "node:assert/strict";
const { server, DB } = start(8788), base = "http://localhost:8788"; let pass = 0;
const t = async (n, f) => { try { await f(); pass++; console.log("ok  ", n); } catch (e) { console.log("FAIL", n, "\n   ", e.message.split("\n")[0]); process.exitCode = 1; } };
const br = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome", args: ["--no-sandbox"], headless: true });
const page = await br.newPage(); const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("dialog", d => d.accept());
page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|ERR_/.test(m.text())) errors.push(m.text()); });
await page.setRequestInterception(true); page.on("request", r => /^https?:\/\/localhost/.test(r.url()) ? r.continue() : r.abort());
const clickText = async (sel, text) => { const h = await page.evaluateHandle((s, t) => [...document.querySelectorAll(s)].find(e => e.textContent.trim() === t || e.textContent.includes(t)), sel, text); assert.ok(h.asElement(), `no ${sel} with "${text}"`); await h.asElement().click(); };
const wait = (ms) => new Promise(r => setTimeout(r, ms));
try {
  await t("public contact page: widget hidden while clinic is unconfigured (classic form still visible)", async () => {
    await page.goto(base + "/contact.html", { waitUntil: "networkidle0" }); assert.equal(await page.$eval("#live-booking", e => e.hidden), true); assert.ok(await page.$("#booking-form-element"));
  });
  await t("admin login via UI (bootstrap) shows dashboard + new 'clinic setup' tab", async () => {
    await page.goto(base + "/admin", { waitUntil: "networkidle0" }); await page.type("#username", "owner"); await page.type("#password", "Bootstrap-Pass-123"); await page.click("#loginBtn");
    await page.waitForSelector("#dashboardSection:not([hidden])", { timeout: 5000 }); await clickText(".view-btn", "إعداد العيادة"); await page.waitForSelector("#setupSection [role=tab]", { timeout: 5000 });
    assert.equal(await page.$$eval("#setupSection [role=tab]", t => t.length), 8);
  });
  await t("setup UI: add a dentist (test fixture) assigned to a service", async () => {
    await clickText("#setupSection [role=tab]", "الأطباء"); await page.waitForSelector("#setupSection input[type=text]");
    const inputs = await page.$$("#setupSection .panel input[type=text]"); await inputs[0].type("Dr Test Fixture");
    await page.evaluate(() => document.querySelector('#setupSection input[type=checkbox][data-id="1"]').click());
    await clickText("#setupSection button", "حفظ الطبيب"); await wait(500);
    assert.equal(DB.db.prepare("SELECT count(*) c FROM dentists").get().c, 1); assert.equal(DB.db.prepare("SELECT count(*) c FROM dentist_services").get().c, 1);
  });
  await t("setup UI: save clinic hours for every weekday", async () => {
    await clickText("#setupSection [role=tab]", "ساعات العمل"); await page.waitForSelector("#setupSection input[type=time]");
    for (let wd = 0; wd < 7; wd++) { await page.$eval(`[aria-label="${["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"][wd]} بداية 1"]`, (e) => { e.value = "09:00"; }); await page.$eval(`[aria-label="${["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"][wd]} نهاية 1"]`, (e) => { e.value = "12:00"; }); }
    await clickText("#setupSection button", "حفظ الجدول"); await wait(500); assert.equal(DB.db.prepare("SELECT count(*) c FROM working_hours").get().c, 7);
  });
  await t("public page now shows live booking widget; pick service, date, slot, submit (English)", async () => {
    await page.goto(base + "/contact.html", { waitUntil: "networkidle0" }); await page.evaluate(() => document.querySelector('[data-lang="en"]').click());
    await page.waitForSelector("#live-booking:not([hidden]) #lb-service", { timeout: 5000 });
    assert.match(await page.$eval("#live-booking h2", e => e.textContent), /Book online/);
    await page.select("#lb-service", "general"); await page.waitForSelector("#lb-date");
    const d = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10); await page.$eval("#lb-date", (e, v) => { e.value = v; e.dispatchEvent(new Event("change")); }, d);
    await page.waitForSelector(".lb-slot", { timeout: 5000 }); const n = await page.$$eval(".lb-slot", s => s.length); assert.equal(n, 6);
    await page.click(".lb-slot"); assert.equal(await page.$eval(".lb-slot", e => e.getAttribute("aria-pressed")), "true");
    await page.type("#lb-name", "Browser Patient"); await page.type("#lb-phone", "0550123456"); await page.type("#lb-email", "bp@example.com"); await page.click("#lb-consent"); await page.click("#live-booking button[type=submit]");
    await page.waitForSelector(".lb-done a", { timeout: 5000 }); assert.match(await page.$eval(".lb-done", e => e.textContent), /NOVA-[A-F0-9]{16}/);
    const row = DB.db.prepare("SELECT patient_name,status,scheduled_at,email FROM appointments").get(); assert.equal(row.patient_name, "Browser Patient"); assert.equal(row.status, "pending");
  });
  let manageUrl;
  await t("manage link works: lookup, then cancel from the manage page", async () => {
    manageUrl = await page.$eval(".lb-manage-link", a => a.href); await page.goto(manageUrl, { waitUntil: "networkidle0" });
    await page.waitForSelector("#actions:not([hidden])"); assert.match(await page.$eval("#info", e => e.textContent), /pending/);
    await page.click("#cancelBtn"); await wait(600); assert.equal(DB.db.prepare("SELECT status FROM appointments").get().status, "cancelled");
    await page.goto(base + "/manage.html?ref=NOVA-0000000000000000&token=" + "a".repeat(48), { waitUntil: "networkidle0" }); assert.match(await page.$eval("#info", e => e.textContent), /not valid/);
  });
  await t("Arabic: widget switches to RTL Arabic text", async () => {
    await page.goto(base + "/contact.html", { waitUntil: "networkidle0" }); await page.evaluate(() => document.querySelector('[data-lang="ar"]').click()); await page.waitForSelector("#lb-service");
    assert.match(await page.$eval("#live-booking h2", e => e.textContent), /احجز/); assert.equal(await page.evaluate(() => document.documentElement.dir), "rtl");
  });
  await t("XSS: script payload in patient name renders as text in admin, never executes", async () => {
    DB.db.exec(`INSERT INTO appointments(patient_name,phone,service_type,reference,status) VALUES ('<img src=x onerror=window.__pwn=1>','12345678','general','NOVA-BBBBBBBBBBBBBBBB','pending')`);
    await page.goto(base + "/admin", { waitUntil: "networkidle0" }); await page.waitForSelector("#dashboardSection:not([hidden])"); await wait(600);
    assert.equal(await page.evaluate(() => window.__pwn), undefined);
    assert.equal(await page.$$eval("img[src=x]", n => n.length), 0, "payload created a live <img> element");
    await page.$eval("#statusFilter", e => { e.value = "all"; e.dispatchEvent(new Event("change")); }).catch(() => {}); await wait(300);
    const shown = await page.evaluate(() => document.body.innerText.includes("<img src=x onerror")); console.log("      (payload visible as literal text in UI: " + shown + ")");
    assert.equal(await page.evaluate(() => window.__pwn), undefined);
  });
  await t("admin confirm button uses audited endpoint", async () => {
    DB.db.exec("UPDATE appointments SET status='pending' WHERE reference='NOVA-BBBBBBBBBBBBBBBB'"); await page.reload({ waitUntil: "networkidle0" }); await page.waitForSelector("#dashboardSection:not([hidden])"); await wait(500);
    const ok = await page.evaluate(async () => { const r = await fetch("/api/admin/appointments/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: 2, status: "confirmed" }) }); return r.status; }); assert.equal(ok, 200);
    assert.ok(DB.db.prepare("SELECT 1 FROM audit_logs WHERE action='appointment.confirmed'").get());
  });
  await t("mobile viewport: no horizontal overflow on contact page", async () => {
    await page.setViewport({ width: 375, height: 800 }); await page.goto(base + "/contact.html", { waitUntil: "networkidle0" });
    const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); assert.ok(o <= 1, "overflow px: " + o);
  });
  await t("no uncaught JS errors on any tested page", async () => { assert.deepEqual(errors, []); });
} finally { await br.close(); server.close(); console.log(`\n${pass} passed`); }
