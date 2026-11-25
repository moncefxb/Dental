/* NOVA admin: clinic setup (services, dentists, hours, time off, settings, users, audit, password).
   Every control calls a real /api/admin/* endpoint. DOM is built with textContent only. */
(() => {
  const $ = (id) => document.getElementById(id);
  const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const E = { invalid_input: "بيانات غير صالحة.", duplicate_slug: "المعرّف مستخدم من قبل.", duplicate_username: "اسم المستخدم مستخدم.", forbidden: "هذا الإجراء للمدير فقط.", overlapping_rows: "فترات متداخلة." };
  let me = null, tab = "services", cache = {};
  const el = (t, a = {}, x) => { const e = document.createElement(t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (x != null) e.textContent = x; return e; };
  const call = async (path, body) => { const r = await fetch(path, { method: body ? "POST" : "GET", credentials: "same-origin", cache: "no-store", headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined }); let j = {}; try { j = await r.json(); } catch {} return { ok: r.ok && j.ok, j, status: r.status }; };
  const lab = (text, input) => { const l = el("label", { style: "display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:700" }); l.append(el("span", {}, text), input); return l; };
  const inp = (type, val = "", extra = {}) => { const i = el("input", { type, ...extra }); i.value = val ?? ""; return i; };
  const btn = (t, fn, cls = "btn-light") => { const b = el("button", { type: "button", class: "btn " + cls }, t); b.onclick = fn; return b; };
  const msg = el("p", { role: "status", "aria-live": "polite", style: "min-height:1.4em;font-weight:700" });
  const say = (r, okText = "تم الحفظ.") => { msg.style.color = r.ok ? "#1b6b45" : "#b3392b"; msg.textContent = r.ok ? okText : (E[r.j.error] || (r.j.field ? `حقل غير صالح: ${r.j.field}` : "تعذّر تنفيذ العملية.")); };
  const grid = () => el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;align-items:end" });
  const table = (heads, rows) => { const w = el("div", { style: "overflow-x:auto" }), t = el("table", { style: "width:100%;border-collapse:collapse;font-size:13px" }), tr = el("tr"); heads.forEach(h => tr.append(el("th", { style: "text-align:start;padding:8px;border-bottom:1px solid #d9e2e9" }, h))); t.append(tr); for (const r of rows) { const row = el("tr"); r.forEach(c => { const td = el("td", { style: "padding:8px;border-bottom:1px solid #eef2ee" }); c instanceof Node ? td.append(c) : (td.textContent = c ?? ""); row.append(td); }); t.append(row); } w.append(t); return w; };
  const isAdmin = () => me?.role === "admin";
  const ro = () => isAdmin() ? null : el("p", { style: "color:#8a6d1f" }, "وضع القراءة فقط: التعديل متاح للمدير.");

  const views = {
    async services(box) {
      const { j } = await call("/api/admin/services"); cache.services = j.services || [];
      const f = { id: inp("hidden"), slug: inp("text", "", { maxlength: 40 }), ar: inp("text"), fr: inp("text"), en: inp("text"), dur: inp("number", 30, { min: 5, max: 480 }), price: inp("number", "", { min: 0, placeholder: "عند الطلب" }), sort: inp("number", 0), bookable: inp("checkbox"), active: inp("checkbox") };
      f.bookable.checked = f.active.checked = true; f.bookable.style.width = f.active.style.width = "auto";
      const form = grid(); form.append(f.id, lab("المعرّف (slug)", f.slug), lab("الاسم بالعربية", f.ar), lab("Nom (FR)", f.fr), lab("Name (EN)", f.en), lab("المدة (دقيقة)", f.dur), lab("السعر ابتداءً من (اختياري)", f.price), lab("الترتيب", f.sort), lab("قابل للحجز عبر الموقع", f.bookable), lab("نشط", f.active));
      const save = btn("حفظ الخدمة", async () => { const r = await call("/api/admin/services", { id: f.id.value ? Number(f.id.value) : undefined, slug: f.slug.value.trim(), name_ar: f.ar.value, name_fr: f.fr.value, name_en: f.en.value, duration_minutes: Number(f.dur.value), price_from: f.price.value === "" ? null : Number(f.price.value), sort_order: Number(f.sort.value) || 0, bookable: f.bookable.checked ? 1 : 0, active: f.active.checked ? 1 : 0 }); say(r); if (r.ok) render(); }, "");
      const rows = cache.services.map(s => [s.slug, s.name_ar, s.duration_minutes + " د", s.price_from ?? "عند الطلب", s.bookable ? "نعم" : "لا", s.active ? "نشط" : "موقوف", isAdmin() ? btn("تعديل", () => { f.id.value = s.id; f.slug.value = s.slug; f.ar.value = s.name_ar; f.fr.value = s.name_fr; f.en.value = s.name_en; f.dur.value = s.duration_minutes; f.price.value = s.price_from ?? ""; f.sort.value = s.sort_order; f.bookable.checked = !!s.bookable; f.active.checked = !!s.active; f.slug.focus(); }) : ""]);
      box.append(table(["المعرّف", "الاسم", "المدة", "السعر من", "حجز مباشر", "الحالة", ""], rows)); if (isAdmin()) box.append(el("h3", {}, "إضافة / تعديل خدمة"), form, el("div", { style: "margin-top:12px" }, ""), save); else box.append(ro());
    },
    async dentists(box) {
      const [d, s] = await Promise.all([call("/api/admin/dentists"), call("/api/admin/services")]); const svcs = s.j.services || [], list = d.j.dentists || [];
      const f = { id: inp("hidden"), name: inp("text", "", { maxlength: 120 }), t: { ar: inp("text"), fr: inp("text"), en: inp("text") }, sort: inp("number", 0), active: inp("checkbox") }; f.active.checked = true; f.active.style.width = "auto";
      const checks = svcs.map(x => { const c = inp("checkbox"); c.style.width = "auto"; c.dataset.id = x.id; const l = el("label", { style: "display:flex;gap:6px;align-items:center;font-size:12px" }); l.append(c, el("span", {}, x.name_ar)); return [c, l]; });
      const form = grid(); form.append(f.id, lab("الاسم (كما سيظهر للمرضى)", f.name), lab("اللقب – عربي", f.t.ar), lab("Titre – FR", f.t.fr), lab("Title – EN", f.t.en), lab("الترتيب", f.sort), lab("نشط", f.active));
      const sw = el("div", { style: "display:flex;flex-wrap:wrap;gap:14px;margin:12px 0" }); checks.forEach(([, l]) => sw.append(l));
      const save = btn("حفظ الطبيب", async () => { const r = await call("/api/admin/dentists", { id: f.id.value ? Number(f.id.value) : undefined, name: f.name.value, title_ar: f.t.ar.value, title_fr: f.t.fr.value, title_en: f.t.en.value, sort_order: Number(f.sort.value) || 0, active: f.active.checked ? 1 : 0, service_ids: checks.filter(([c]) => c.checked).map(([c]) => Number(c.dataset.id)) }); say(r); if (r.ok) render(); }, "");
      box.append(table(["الاسم", "اللقب", "الخدمات", "الحالة", ""], list.map(x => [x.name, x.title_ar, x.service_ids.map(i => svcs.find(v => v.id === i)?.name_ar).filter(Boolean).join("، "), x.active ? "نشط" : "موقوف", isAdmin() ? btn("تعديل", () => { f.id.value = x.id; f.name.value = x.name; f.t.ar.value = x.title_ar; f.t.fr.value = x.title_fr; f.t.en.value = x.title_en; f.sort.value = x.sort_order; f.active.checked = !!x.active; checks.forEach(([c]) => c.checked = x.service_ids.includes(Number(c.dataset.id))); f.name.focus(); }) : ""])));
      if (isAdmin()) box.append(el("h3", {}, "إضافة / تعديل طبيب"), el("p", { style: "font-size:12px;color:#6b756f" }, "أدخل فقط بيانات حقيقية ومعتمدة من العيادة."), form, sw, save); else box.append(ro());
    },
    async hours(box) {
      const [d, h] = await Promise.all([call("/api/admin/dentists"), call("/api/admin/hours")]); const dentists = d.j.dentists || [], all = h.j.hours || [];
      const sel = el("select"); sel.append(Object.assign(el("option", { value: "" }, "ساعات العيادة الافتراضية (لكل الأطباء بلا جدول خاص)")), ...dentists.map(x => el("option", { value: x.id }, "الطبيب: " + x.name)));
      const holder = el("div"); const draw = () => {
        holder.replaceChildren(); const id = sel.value === "" ? null : Number(sel.value), mine = all.filter(r => r.dentist_id === id), inputs = [];
        for (let wd = 0; wd < 7; wd++) { const rs = mine.filter(r => r.weekday === wd).sort((a, b) => a.start_time.localeCompare(b.start_time)), row = el("div", { style: "display:flex;gap:8px;align-items:center;margin:6px 0;flex-wrap:wrap" }); row.append(el("b", { style: "min-width:80px" }, DAYS[wd]));
          for (let k = 0; k < 2; k++) { const a = inp("time", rs[k]?.start_time || "", { "aria-label": `${DAYS[wd]} بداية ${k + 1}` }), b = inp("time", rs[k]?.end_time || "", { "aria-label": `${DAYS[wd]} نهاية ${k + 1}` }); a.style.width = b.style.width = "130px"; inputs.push([wd, a, b]); row.append(a, el("span", {}, "→"), b, k === 0 ? el("span", { style: "margin-inline:8px;color:#8a938d" }, "|") : ""); } holder.append(row); }
        holder.append(el("p", { style: "font-size:12px;color:#6b756f" }, "اترك الحقول فارغة ليوم الإغلاق. يمكن إدخال فترتين في اليوم (مثلاً صباحية ومسائية)."), btn("حفظ الجدول", async () => { const rows = inputs.filter(([, a, b]) => a.value && b.value).map(([wd, a, b]) => ({ weekday: wd, start_time: a.value, end_time: b.value })); const r = await call("/api/admin/hours", { dentist_id: id, rows }); say(r); if (r.ok) { const n = await call("/api/admin/hours"); all.length = 0; all.push(...(n.j.hours || [])); } }, ""));
      };
      sel.onchange = draw; box.append(lab("الجدول", sel), holder); if (!isAdmin()) box.append(ro()); else draw(); if (!isAdmin()) draw();
      if (!isAdmin()) holder.querySelectorAll("input,button").forEach(x => x.disabled = true);
    },
    async timeoff(box) {
      const [d, t] = await Promise.all([call("/api/admin/dentists"), call("/api/admin/timeoff")]); const dentists = d.j.dentists || [];
      const sel = el("select"); sel.append(el("option", { value: "" }, "العيادة كلها"), ...dentists.map(x => el("option", { value: x.id }, x.name)));
      const a = inp("datetime-local"), b = inp("datetime-local"), why = inp("text", "", { maxlength: 200 }); const form = grid(); form.append(lab("الجهة", sel), lab("من", a), lab("إلى", b), lab("السبب (اختياري)", why));
      box.append(table(["الجهة", "من", "إلى", "السبب", ""], (t.j.timeoff || []).map(x => [x.dentist_id ? dentists.find(v => v.id === x.dentist_id)?.name || x.dentist_id : "العيادة كلها", x.starts_at.replace("T", " "), x.ends_at.replace("T", " "), x.reason, isAdmin() ? btn("حذف", async () => { if (!confirm("حذف هذه الفترة؟")) return; say(await call("/api/admin/timeoff", { action: "delete", id: x.id }), "تم الحذف."); render(); }) : ""])));
      if (isAdmin()) box.append(el("h3", {}, "إضافة إغلاق / إجازة"), form, el("div", { style: "height:12px" }), btn("إضافة", async () => { const r = await call("/api/admin/timeoff", { dentist_id: sel.value === "" ? null : Number(sel.value), starts_at: a.value, ends_at: b.value, reason: why.value }); say(r, "تمت الإضافة."); if (r.ok) render(); }, "")); else box.append(ro());
    },
    async settings(box) {
      const { j } = await call("/api/admin/settings"), s = j.settings || {};
      const f = { timezone: inp("text", s.timezone), slot_step_minutes: el("select"), min_notice_minutes: inp("number", s.min_notice_minutes, { min: 0 }), max_days_ahead: inp("number", s.max_days_ahead, { min: 1, max: 365 }), online_booking_enabled: inp("checkbox") };
      [10, 15, 20, 30, 45, 60].forEach(n => { const o = el("option", { value: n }, n + " دقيقة"); if (String(n) === s.slot_step_minutes) o.selected = true; f.slot_step_minutes.append(o); });
      f.online_booking_enabled.checked = s.online_booking_enabled === "1"; f.online_booking_enabled.style.width = "auto";
      const form = grid(); form.append(lab("المنطقة الزمنية (IANA)", f.timezone), lab("خطوة المواعيد", f.slot_step_minutes), lab("أقل مهلة قبل الموعد (دقيقة)", f.min_notice_minutes), lab("أقصى مدة للحجز المسبق (يوم)", f.max_days_ahead), lab("تفعيل الحجز المباشر عبر الموقع", f.online_booking_enabled));
      box.append(form, el("div", { style: "height:12px" }), isAdmin() ? btn("حفظ الإعدادات", async () => say(await call("/api/admin/settings", { settings: { timezone: f.timezone.value.trim(), slot_step_minutes: f.slot_step_minutes.value, min_notice_minutes: String(f.min_notice_minutes.value), max_days_ahead: String(f.max_days_ahead.value), online_booking_enabled: f.online_booking_enabled.checked ? "1" : "0" } })), "") : ro(), el("p", { style: "font-size:12px;color:#6b756f;margin-top:14px" }, "إشعارات البريد الإلكتروني تُضبط عبر متغيرات Cloudflare (EMAIL_API_KEY / EMAIL_FROM) وليس من هذه الصفحة، حفاظاً على سرية المفاتيح."));
    },
    async users(box) {
      const { j, status } = await call("/api/admin/users"); if (status === 403) { box.append(el("p", {}, "هذا القسم للمدير فقط.")); return; }
      const u = inp("text", "", { maxlength: 64, autocomplete: "off" }), p = inp("password", "", { autocomplete: "new-password" }), r = el("select"); r.append(el("option", { value: "staff" }, "موظف (استقبال)"), el("option", { value: "admin" }, "مدير"));
      const form = grid(); form.append(lab("اسم المستخدم", u), lab("كلمة المرور (12 حرفاً فأكثر، حروف وغير حروف)", p), lab("الصلاحية", r));
      box.append(table(["المستخدم", "الصلاحية", "الحالة", ""], (j.users || []).map(x => [x.username, x.role === "admin" ? "مدير" : "موظف", x.active ? "نشط" : "موقوف", x.username === me.username ? "" : btn(x.active ? "إيقاف" : "تفعيل", async () => { say(await call("/api/admin/users", { action: "set_active", id: x.id, active: x.active ? 0 : 1 }), "تم التحديث."); render(); })])),
        el("h3", {}, "إضافة مستخدم"), form, el("div", { style: "height:12px" }), btn("إنشاء", async () => { const x = await call("/api/admin/users", { action: "create", username: u.value, password: p.value, role: r.value }); say(x, "تم إنشاء المستخدم."); if (x.ok) render(); }, ""));
    },
    async audit(box) {
      const { j, status } = await call("/api/admin/audit"); if (status === 403) { box.append(el("p", {}, "سجل التدقيق للمدير فقط.")); return; }
      box.append(table(["الوقت (UTC)", "المنفّذ", "الإجراء", "الكيان", "تفاصيل"], (j.logs || []).map(x => [x.at, x.actor, x.action, `${x.entity} ${x.entity_id}`.trim(), x.detail])));
    },
    async password(box) {
      const c = inp("password", "", { autocomplete: "current-password" }), n = inp("password", "", { autocomplete: "new-password" }), form = grid(); form.append(lab("كلمة المرور الحالية", c), lab("الجديدة (12 حرفاً فأكثر)", n));
      box.append(form, el("div", { style: "height:12px" }), btn("تغيير كلمة المرور", async () => { const r = await call("/api/admin/password", { current: c.value, next: n.value }); say(r.status === 400 ? { ok: false, j: { error: "x" } } : r, "تم التغيير. سُجّل خروجك من الأجهزة الأخرى."); if (r.status === 400) msg.textContent = "كلمة المرور الجديدة ضعيفة (12 حرفاً على الأقل، حروف ورموز/أرقام)."; if (r.ok) { c.value = n.value = ""; } }, ""));
    }
  };
  const TABS = [["services", "الخدمات"], ["dentists", "الأطباء"], ["hours", "ساعات العمل"], ["timeoff", "الإجازات والإغلاق"], ["settings", "الإعدادات"], ["users", "المستخدمون"], ["audit", "سجل التدقيق"], ["password", "كلمة المرور"]];
  async function render() {
    const sec = $("setupSection"); sec.replaceChildren(); const nav = el("div", { role: "tablist", style: "display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px" });
    for (const [k, v] of TABS) { const b = el("button", { type: "button", role: "tab", class: "btn " + (k === tab ? "" : "btn-light"), "aria-selected": String(k === tab) }, v); b.onclick = () => { tab = k; msg.textContent = ""; render(); }; nav.append(b); }
    const box = el("div", { class: "panel", style: "padding:20px" }); sec.append(nav, msg, box);
    try { await views[tab](box); } catch (e) { box.append(el("p", {}, "تعذّر تحميل البيانات.")); }
  }
  window.loadSetup = async () => { const s = await call("/api/admin/session"); me = s.j.user; render(); };
  const sec = el("section", { id: "setupSection", hidden: "" }); $("reportsSection").after(sec);
  const b = el("button", { class: "view-btn", "data-section": "setupSection", type: "button" }, "إعداد العيادة"); document.querySelector(".views").append(b); b.addEventListener("click", () => window.showSection("setupSection"));
})();
