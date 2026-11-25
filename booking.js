/* NOVA live booking widget. Shows only when the server reports online booking is configured.
   All data is rendered with textContent (no innerHTML) to avoid XSS. */
(() => {
  const root = document.getElementById("live-booking"); if (!root) return;
  const T = {
    ar: { title: "احجز موعداً مباشرة", intro: "اختر الخدمة والطبيب والوقت المتاح. يؤكد فريق العيادة طلبك بعد استلامه.", service: "الخدمة", dentist: "الطبيب", any: "أي طبيب متاح", date: "التاريخ", time: "الأوقات المتاحة", loadingSlots: "جارٍ تحميل الأوقات…", noSlots: "لا توجد أوقات متاحة في هذا اليوم. جرّب تاريخاً آخر.", pick: "اختر…", name: "الاسم الكامل", phone: "رقم الهاتف", email: "البريد الإلكتروني (اختياري، لإرسال التأكيد)", consent: "أوافق على حفظ بياناتي لإدارة هذا الموعد.", submit: "إرسال طلب الحجز", sending: "جارٍ الإرسال…", done: "تم استلام طلبك. المرجع: {ref}. سيؤكد الفريق الموعد قريباً.", manage: "رابط إدارة الموعد (احتفظ به لإلغاء الموعد أو تعديله)", errInput: "يرجى التحقق من البيانات المدخلة.", errTaken: "هذا الوقت لم يعد متاحاً. اختر وقتاً آخر.", errRate: "محاولات كثيرة. حاول بعد دقيقة.", errGeneric: "تعذّر إرسال الطلب. حاول لاحقاً أو اتصل بالعيادة.", select: "يرجى اختيار الخدمة والتاريخ والوقت." },
    fr: { title: "Réserver en ligne", intro: "Choisissez le soin, le praticien et un créneau disponible. La clinique confirme votre demande après réception.", service: "Soin", dentist: "Praticien", any: "Premier praticien disponible", date: "Date", time: "Créneaux disponibles", loadingSlots: "Chargement des créneaux…", noSlots: "Aucun créneau ce jour-là. Essayez une autre date.", pick: "Choisir…", name: "Nom complet", phone: "Téléphone", email: "E-mail (facultatif, pour la confirmation)", consent: "J’accepte l’enregistrement de mes données pour gérer ce rendez-vous.", submit: "Envoyer la demande", sending: "Envoi…", done: "Demande reçue. Référence : {ref}. L’équipe confirmera bientôt le rendez-vous.", manage: "Lien de gestion (conservez-le pour annuler ou modifier)", errInput: "Veuillez vérifier les informations saisies.", errTaken: "Ce créneau n’est plus disponible. Choisissez-en un autre.", errRate: "Trop de tentatives. Réessayez dans une minute.", errGeneric: "Envoi impossible. Réessayez plus tard ou appelez la clinique.", select: "Veuillez choisir un soin, une date et un créneau." },
    en: { title: "Book online", intro: "Choose a treatment, a dentist and an available time. The clinic confirms your request once received.", service: "Treatment", dentist: "Dentist", any: "First available dentist", date: "Date", time: "Available times", loadingSlots: "Loading times…", noSlots: "No times available that day. Try another date.", pick: "Select…", name: "Full name", phone: "Phone number", email: "Email (optional, for your confirmation)", consent: "I agree to my data being stored to manage this appointment.", submit: "Send booking request", sending: "Sending…", done: "Request received. Reference: {ref}. The team will confirm shortly.", manage: "Manage link (keep it to cancel or reschedule)", errInput: "Please check the details you entered.", errTaken: "That time was just taken. Please pick another.", errRate: "Too many attempts. Try again in a minute.", errGeneric: "Could not send. Try later or call the clinic.", select: "Please choose a treatment, date and time." }
  };
  const L = () => (T[document.documentElement.lang] ? document.documentElement.lang : "ar"), t = (k) => T[L()][k];
  let opts, state = { service: "", dentist: "any", date: "", time: "" };
  const el = (tag, attrs = {}, text) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
  const field = (label, control) => { const w = el("label", { class: "form-field" }); w.append(el("span", {}, label), control); return w; };
  const svcName = (s) => s["name_" + L()] || s.name_en;
  const iso = (d) => d.toISOString().slice(0, 10);

  function render() {
    if (!opts) return; const prevFocus = document.activeElement && document.activeElement.id;
    root.replaceChildren();
    const h = el("div", { class: "booking-heading" }); h.append(el("span", { class: "card-meta" }, "NOVA / LIVE BOOKING"), el("h2", {}, t("title")), el("p", {}, t("intro"))); root.append(h);
    const form = el("form", { novalidate: "", "aria-label": t("title") }); const grid = el("div", { class: "form-grid" });
    const sSel = el("select", { id: "lb-service", required: "" }); sSel.append(el("option", { value: "" }, t("pick")));
    for (const s of opts.services) { const o = el("option", { value: s.slug }, svcName(s)); if (s.slug === state.service) o.selected = true; sSel.append(o); }
    sSel.onchange = () => { state.service = sSel.value; state.time = ""; state.dentist = "any"; render(); loadSlots(); };
    const dSel = el("select", { id: "lb-dentist" }); dSel.append(el("option", { value: "any" }, t("any")));
    const svc = opts.services.find(s => s.slug === state.service);
    for (const d of opts.dentists.filter(d => !svc || d.service_ids.includes(svc.id))) { const o = el("option", { value: String(d.id) }, d.name); if (String(d.id) === state.dentist) o.selected = true; dSel.append(o); }
    dSel.onchange = () => { state.dentist = dSel.value; state.time = ""; loadSlots(); };
    const today = new Date(), max = new Date(Date.now() + opts.maxDaysAhead * 864e5);
    const dIn = el("input", { id: "lb-date", type: "date", min: iso(today), max: iso(max), required: "" }); dIn.value = state.date;
    dIn.onchange = () => { state.date = dIn.value; state.time = ""; loadSlots(); };
    grid.append(field(t("service"), sSel), field(t("dentist"), dSel), field(t("date"), dIn)); form.append(grid);
    const sl = el("fieldset", { class: "lb-slots", "aria-live": "polite" }); sl.append(el("legend", {}, t("time"))); sl.id = "lb-slots"; form.append(sl);
    const g2 = el("div", { class: "form-grid", style: "margin-top:18px" });
    g2.append(field(t("name"), el("input", { id: "lb-name", name: "name", type: "text", autocomplete: "name", maxlength: "100", required: "" })),
      field(t("phone"), el("input", { id: "lb-phone", name: "phone", type: "tel", inputmode: "tel", autocomplete: "tel", maxlength: "25", required: "" })));
    const em = field(t("email"), el("input", { id: "lb-email", name: "email", type: "email", autocomplete: "email", maxlength: "254" })); em.classList.add("form-field-wide"); g2.append(em); form.append(g2);
    form.append(el("div", { class: "form-honeypot", "aria-hidden": "true" }, "")); const hp = el("input", { name: "website", type: "text", tabindex: "-1", autocomplete: "off" }); form.lastChild.append(hp);
    const cl = el("label", { class: "form-consent" }); cl.append(el("input", { id: "lb-consent", type: "checkbox", required: "" }), el("span", {}, t("consent"))); form.append(cl);
    const btn = el("button", { class: "button button-accent form-submit", type: "submit" }); btn.append(el("span", { id: "lb-submit-label" }, t("submit")), el("span", { class: "button-arrow", "aria-hidden": "true" }, "↗")); form.append(btn);
    const fb = el("p", { class: "form-feedback", id: "lb-feedback", role: "status", "aria-live": "polite" }); form.append(fb);
    form.onsubmit = async (e) => {
      e.preventDefault(); const v = (id) => document.getElementById(id);
      const name = v("lb-name").value.trim(), phone = v("lb-phone").value.trim(), email = v("lb-email").value.trim();
      if (!state.service || !state.date || !state.time) { fb.textContent = t("select"); return; }
      if (name.length < 2 || phone.replace(/\D/g, "").length < 8 || !v("lb-consent").checked || (email && !v("lb-email").validity.valid)) { fb.textContent = t("errInput"); return; }
      btn.disabled = true; v("lb-submit-label").textContent = t("sending"); fb.textContent = "";
      try {
        const r = await fetch("/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, email, service: state.service, dentist: state.dentist, date: state.date, time: state.time, language: L(), consent: true, website: hp.value }) });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok) { showDone(j); return; }
        fb.textContent = j.error === "slot_unavailable" ? t("errTaken") : j.error === "rate_limited" ? t("errRate") : j.error === "invalid_input" ? t("errInput") : t("errGeneric");
        if (j.error === "slot_unavailable") { state.time = ""; loadSlots(); }
      } catch { fb.textContent = t("errGeneric"); }
      btn.disabled = false; v("lb-submit-label").textContent = t("submit");
    };
    root.append(form); if (state.service && state.date) loadSlots(); if (prevFocus) document.getElementById(prevFocus)?.focus?.();
  }
  async function loadSlots() {
    const box = document.getElementById("lb-slots"); if (!box) return; box.querySelectorAll("button,p").forEach(n => n.remove());
    if (!state.service || !state.date) return; box.append(el("p", {}, t("loadingSlots")));
    try {
      const r = await fetch(`/api/availability?service=${encodeURIComponent(state.service)}&date=${state.date}&dentist=${encodeURIComponent(state.dentist)}`); const j = await r.json();
      box.querySelectorAll("p").forEach(n => n.remove());
      if (!j.ok || !j.slots.length) { box.append(el("p", {}, t("noSlots"))); return; }
      const wrap = el("div", { class: "lb-slot-grid" });
      for (const s of j.slots) { const b = el("button", { type: "button", class: "lb-slot", "aria-pressed": String(state.time === s.time) }, s.time); b.onclick = () => { state.time = s.time; wrap.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); }; wrap.append(b); }
      box.append(wrap);
    } catch { box.querySelectorAll("p").forEach(n => n.remove()); box.append(el("p", {}, t("errGeneric"))); }
  }
  function showDone(j) {
    root.replaceChildren(); const box = el("div", { role: "status", class: "lb-done" });
    box.append(el("h2", {}, t("title")), el("p", {}, t("done").replace("{ref}", j.reference)));
    const link = `${location.origin}/manage.html?ref=${encodeURIComponent(j.reference)}&token=${encodeURIComponent(j.manageToken)}`;
    box.append(el("p", {}, t("manage")), el("a", { href: link, class: "lb-manage-link" }, link)); root.append(box); box.setAttribute("tabindex", "-1"); box.focus();
  }
  (async () => {
    try { const r = await fetch("/api/booking/options"); opts = await r.json(); if (!opts.ok || !opts.onlineBooking) return; root.hidden = false; render();
      new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch { /* keep the classic request form only */ }
  })();
})();
