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

function randomToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, b =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

function generateReference() {
  return `NOVA-${randomToken().slice(0, 16).toUpperCase()}`;
}

async function hashIP(ip, secret) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(ip)
  );

  return Array.from(new Uint8Array(signature), b =>
    b.toString(16).padStart(2, "0")
  ).join("");
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

  const contentLength = Number(
    request.headers.get("Content-Length") || 0
  );

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

  const service = typeof body.service === "string"
    ? body.service
    : "";

  const language = typeof body.language === "string"
    ? body.language
    : "";

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

  if (!env.DB || !env.RATE_LIMIT_SECRET) {
    return json({ ok: false, error: "server_configuration_error" }, 503);
  }

  const ip = request.headers.get("CF-Connecting-IP");

  if (!ip) {
    return json({ ok: false, error: "ip_unavailable" }, 400);
  }

  try {
    const ipHash = await hashIP(ip, env.RATE_LIMIT_SECRET);
    const now = Math.floor(Date.now() / 1000);

    for (let attempt = 0; attempt < 3; attempt++) {
      const token = randomToken();
      const reference = generateReference();

      const rateLimitStatement = env.DB.prepare(`
        INSERT INTO appointment_rate_limits (
          ip_hash,
          last_request_at,
          token
        )
        VALUES (?, ?, ?)
        ON CONFLICT(ip_hash) DO UPDATE SET
          last_request_at = excluded.last_request_at,
          token = excluded.token
        WHERE appointment_rate_limits.last_request_at
          <= excluded.last_request_at - 60
        RETURNING token
      `).bind(ipHash, now, token);

      const appointmentStatement = env.DB.prepare(`
        INSERT INTO appointments (
          patient_name,
          phone,
          service_type,
          preferred_date,
          status,
          reference
        )
        SELECT ?, ?, ?, '', 'pending', ?
        WHERE EXISTS (
          SELECT 1
          FROM appointment_rate_limits
          WHERE ip_hash = ? AND token = ?
        )
        RETURNING reference
      `).bind(
        name,
        phone,
        service,
        reference,
        ipHash,
        token
      );

      const results = await env.DB.batch([
        rateLimitStatement,
        appointmentStatement
      ]);

      if (!results[0]?.results?.length) {
        return json({ ok: false, error: "rate_limited" }, 429);
      }

      const saved = results[1]?.results?.[0];

      if (saved?.reference) {
        return json({
          ok: true,
          reference: saved.reference
        }, 201);
      }

      return json({ ok: false, error: "database_write_failed" }, 503);
    }

    return json({ ok: false, error: "reference_generation_failed" }, 503);

  } catch {
    return json({ ok: false, error: "database_write_failed" }, 503);
  }
}

export async function onRequestGet() {
  return json({
    ok: false,
    error: "method_not_allowed"
  }, 405);
}
