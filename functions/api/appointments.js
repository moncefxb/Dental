
const ALLOWED_SERVICES = new Set([
  "general",
  "cosmetic",
  "orthodontics",
  "restorative",
  "implants",
  "pediatric",
  "other"
]);

const ALLOWED_LANGUAGES = new Set(["ar", "fr", "en"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function algeriaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Algiers",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function isRealDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  const requestUrl = new URL(request.url);

  if (origin) {
    try {
      if (new URL(origin).origin !== requestUrl.origin) {
        return json({ ok: false, error: "origin_not_allowed" }, 403);
      }
    } catch {
      return json({ ok: false, error: "origin_not_allowed" }, 403);
    }
  }

  const contentType = request.headers.get("Content-Type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "json_required" }, 415);
  }

  const contentLength = Number(request.headers.get("Content-Length") || 0);

  if (contentLength > 8192) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }

  let body;

  try {
    const rawBody = await request.text();

    if (rawBody.length > 8192) {
      return json({ ok: false, error: "payload_too_large" }, 413);
    }

    body = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true, reference: "" }, 202);
  }

  const name = typeof body.name === "string"
    ? body.name.trim().replace(/\s+/g, " ")
    : "";

  const phone = typeof body.phone === "string"
    ? body.phone.trim().replace(/\s+/g, " ")
    : "";

  const phoneDigits = phone.replace(/\D/g, "");
  const service = typeof body.service === "string" ? body.service : "";
  const language = typeof body.language === "string" ? body.language : "";

  const preferredDate =
    body.preferredDate === null || body.preferredDate === ""
      ? null
      : body.preferredDate;

  if (
    name.length < 2 ||
    name.length > 100 ||
    /[\u0000-\u001F\u007F]/.test(name)
  ) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  if (
    !/^[+()\d\s.-]{8,25}$/.test(phone) ||
    phoneDigits.length < 8 ||
    phoneDigits.length > 15
  ) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  if (
    !ALLOWED_SERVICES.has(service) ||
    !ALLOWED_LANGUAGES.has(language)
  ) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  if (body.consent !== true) {
    return json({ ok: false, error: "consent_required" }, 400);
  }

  if (
    preferredDate !== null &&
    (!isRealDate(preferredDate) || preferredDate < algeriaToday())
  ) {
    return json({ ok: false, error: "invalid_date" }, 400);
  }

  if (!env.DB) {
    return json({ ok: false, error: "database_not_bound" }, 503);
  }

  const id = crypto.randomUUID();

  try {
    await env.DB.prepare(`
      INSERT INTO appointments
        (patient_name, phone, service_type, preferred_date, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).bind(
      name,
      phone,
      service,
      preferredDate
    ).run();
  } catch {
    return json({ ok: false, error: "database_write_failed" }, 503);
  }

  return json({
    ok: true,
    reference: `NOVA-${id.slice(0, 8).toUpperCase()}`
  }, 201);
}

export async function onRequestGet() {
  return json({ ok: false, error: "method_not_allowed" }, 405);
}
