// Email notifications via an HTTPS email API (Resend-compatible). Disabled unless configured.
// Env: EMAIL_API_KEY, EMAIL_FROM (verified sender), optional EMAIL_API_URL (default Resend), CLINIC_NOTIFY_EMAIL.
// Failures never block booking. Messages deliberately contain no medical details.
const SUBJECT = {
  created:     { ar: "استلمنا طلب موعدك", fr: "Nous avons reçu votre demande de rendez-vous", en: "We received your appointment request" },
  confirmed:   { ar: "تم تأكيد موعدك", fr: "Votre rendez-vous est confirmé", en: "Your appointment is confirmed" },
  cancelled:   { ar: "تم إلغاء موعدك", fr: "Votre rendez-vous est annulé", en: "Your appointment was cancelled" },
  rescheduled: { ar: "تم تعديل موعدك (بانتظار التأكيد)", fr: "Rendez-vous modifié (en attente de confirmation)", en: "Appointment rescheduled (awaiting confirmation)" }
};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export async function notifyAppointment(env, event, d) {
  if (!env.EMAIL_API_KEY || !env.EMAIL_FROM) return { skipped: "not_configured" };
  const lang = SUBJECT[event][d.lang] ? d.lang : "en", subject = SUBJECT[event][lang];
  const link = d.manageToken ? `${d.origin}/manage.html?ref=${encodeURIComponent(d.reference)}&token=${d.manageToken}` : "";
  const html = `<div dir="${lang === "ar" ? "rtl" : "ltr"}" style="font-family:sans-serif"><h2>${esc(subject)}</h2>
    <p>${esc(d.name)} — <b>${esc(d.startsAt || "")}</b></p><p>Ref: ${esc(d.reference)}</p>${link ? `<p><a href="${esc(link)}">Manage / cancel</a></p>` : ""}</div>`;
  const to = [d.email, event === "created" ? env.CLINIC_NOTIFY_EMAIL : ""].filter(Boolean);
  if (!to.length) return { skipped: "no_recipient" };
  try {
    const r = await fetch(env.EMAIL_API_URL || "https://api.resend.com/emails", { method: "POST",
      headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }) });
    return { sent: r.ok, status: r.status };
  } catch (e) { console.error("notify failed"); return { sent: false }; }
}
