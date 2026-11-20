
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

function generateReference() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);

  const token = Array.from(bytes, byte =>
    byte.toString(16).padStart(2, "0")
  ).join("").toUpperCase();

  return `NOVA-${token}`;
}

export async function onRequestPost({ request, env }) {
  // 1. Verify request origin
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

  // 2. Verify content type
  const contentType = request.headers.get("Content-Type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "json_required" }, 415);
  }

  // 3. Limit request size
  const contentLength = Number(
    request.headers.get("Content-Length") || 0
  );

  if (contentLength > 8192) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }

  // 4. Parse JSON
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

  // 5. Honeypot protection
  if (
    typeof body.website === "string" &&
    body.website.trim() !== ""
  ) {
    return json({ ok: true, reference: "" }, 202);
  }

  // 6. Normalize inputs
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

  // 7. Validate name
  if (
    name.length < 2 ||
    name.length > 100 ||
    /[\u0000-\u001F\u007F]/.test(name)
  ) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  // 8. Validate phone
  if (
    !/^[+()\d\s.-]{8,25}$/.test(phone) ||
    phoneDigits.length < 8 ||
    phoneDigits.length > 15
  ) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  // 9. Validate service and language
  if (
    !ALLOWED_SERVICES.has(service) ||
    !ALLOWED_LANGUAGES.has(language)
  ) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  // 10. Verify consent
  if (body.consent !== true) {
    return json({ ok: false, error: "consent_required" }, 400);
  }

  // 11. Verify database binding
  if (!env.DB) {
    return json({ ok: false, error: "database_not_bound" }, 503);
  }

  // 12. Generate and save unique reference
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const reference = generateReference();

      try {
        await env.DB.prepare(`
          INSERT INTO appointments (
            patient_name,
            phone,
            service_type,
            preferred_date,
            status,
            reference
          )
          VALUES (?, ?, ?, '', 'pending', ?)
        `).bind(
          name,
          phone,
          service,
          reference
        ).run();

        // Return reference only after successful insertion
        return json({
          ok: true,
          reference
        }, 201);

      } catch (error) {
        const message = String(error?.message || "");

        // Retry only if the reference collided with an existing one
        if (
          message.includes("UNIQUE constraint failed") &&
          message.includes("reference")
        ) {
          continue;
        }

        throw error;
      }
    }

    return json({
      ok: false,
      error: "reference_generation_failed"
    }, 503);

  } catch {
    return json({
      ok: false,
      error: "database_write_failed"
    }, 503);
  }
}

export async function onRequestGet() {
  return json({
    ok: false,
    error: "method_not_allowed"
  }, 405);
}
