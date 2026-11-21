
const SESSION_COOKIE = "nova_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const MAX_LOGIN_ATTEMPTS = 5;

function json(data, status = 200, extraHeaders = {}) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders
  });

  return new Response(JSON.stringify(data), { status, headers });
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(String(a));
  const right = new TextEncoder().encode(String(b));
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;

  for (let i = 0; i < length; i++) {
    difference |= (left[i] || 0) ^ (right[i] || 0);
  }

  return difference === 0;
}

async function hmacHex(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(signature), byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function getCookie(request, name) {
  const cookies = request.headers.get("Cookie") || "";

  for (const part of cookies.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;

    if (part.slice(0, index).trim() === name) {
      return part.slice(index + 1).trim();
    }
  }

  return "";
}

function sessionCookie(value, maxAge) {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

async function createSession(env) {
  const issuedAt = String(Math.floor(Date.now() / 1000));
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  const nonce = Array.from(bytes, byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");

  const payload = `${issuedAt}.${nonce}`;
  const signature = await hmacHex(payload, env.ADMIN_SESSION_SECRET);

  return `${payload}.${signature}`;
}

async function hasAdminSession(request, env) {
  if (!env.ADMIN_SESSION_SECRET) return false;

  const token = getCookie(request, SESSION_COOKIE);
  const parts = token.split(".");

  if (parts.length !== 3) return false;

  const [issuedAt, nonce, signature] = parts;

  if (
    !/^\d{10}$/.test(issuedAt) ||
    !/^[a-f0-9]{32}$/.test(nonce) ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const issued = Number(issuedAt);
  const now = Math.floor(Date.now() / 1000);

  if (
    issued > now + 30 ||
    now - issued > SESSION_SECONDS
  ) {
    return false;
  }

  const expected = await hmacHex(
    `${issuedAt}.${nonce}`,
    env.ADMIN_SESSION_SECRET
  );

  return constantTimeEqual(signature, expected);
}

async function readJson(request, maxLength = 2048) {
  const contentType = request.headers.get("Content-Type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  const raw = await request.text();

  if (raw.length > maxLength) return null;

  try {
    const body = JSON.parse(raw);
    return body && typeof body === "object" && !Array.isArray(body)
      ? body
      : null;
  } catch {
    return null;
  }
}

async function loginRateLimit(ipHash, env, now) {
  const previous = await env.DB.prepare(`
    SELECT blocked_until
    FROM admin_login_attempts
    WHERE ip_hash = ?
  `).bind(ipHash).first();

  if (previous?.blocked_until > now) {
    return { blocked: true };
  }

  const state = await env.DB.prepare(`
    INSERT INTO admin_login_attempts (
      ip_hash,
      attempts,
      window_started_at,
      blocked_until
    )
    VALUES (?, 1, ?, 0)
    ON CONFLICT(ip_hash) DO UPDATE SET
      attempts = CASE
        WHEN admin_login_attempts.window_started_at <= ?
        THEN 1
        ELSE admin_login_attempts.attempts + 1
      END,
      window_started_at = CASE
        WHEN admin_login_attempts.window_started_at <= ?
        THEN excluded.window_started_at
        ELSE admin_login_attempts.window_started_at
      END,
      blocked_until = CASE
        WHEN admin_login_attempts.window_started_at <= ?
        THEN 0
        WHEN admin_login_attempts.attempts + 1 >= ?
        THEN excluded.window_started_at + ?
        ELSE admin_login_attempts.blocked_until
      END
    RETURNING attempts, blocked_until
  `).bind(
    ipHash,
    now,
    now - LOGIN_WINDOW_SECONDS,
    now - LOGIN_WINDOW_SECONDS,
    now - LOGIN_WINDOW_SECONDS,
    MAX_LOGIN_ATTEMPTS,
    LOGIN_WINDOW_SECONDS
  ).first();

  return {
    blocked: state?.blocked_until > now
  };
}

export async function adminLogin({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  if (
    !env.DB ||
    !env.RATE_LIMIT_SECRET ||
    !env.ADMIN_USERNAME ||
    !env.ADMIN_PASSWORD ||
    !env.ADMIN_SESSION_SECRET ||
    env.ADMIN_SESSION_SECRET.length < 32
  ) {
    return json({ ok: false, error: "server_configuration_error" }, 503);
  }

  const body = await readJson(request);

  if (
    !body ||
    typeof body.username !== "string" ||
    typeof body.password !== "string" ||
    body.username.length > 128 ||
    body.password.length > 256
  ) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) {
    return json({ ok: false, error: "login_unavailable" }, 503);
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const ipHash = await hmacHex(
      `admin-login:${ip}`,
      env.RATE_LIMIT_SECRET
    );

    const usernameValid = constantTimeEqual(
      body.username,
      env.ADMIN_USERNAME
    );

    const passwordValid = constantTimeEqual(
      body.password,
      env.ADMIN_PASSWORD
    );

    if (usernameValid && passwordValid) {
      const previous = await env.DB.prepare(`
        SELECT blocked_until
        FROM admin_login_attempts
        WHERE ip_hash = ?
      `).bind(ipHash).first();

      if (previous?.blocked_until > now) {
        return json({ ok: false, error: "rate_limited" }, 429);
      }

      await env.DB.prepare(`
        DELETE FROM admin_login_attempts WHERE ip_hash = ?
      `).bind(ipHash).run();

      const token = await createSession(env);

      return json(
        { ok: true },
        200,
        { "Set-Cookie": sessionCookie(token, SESSION_SECONDS) }
      );
    }

    const limit = await loginRateLimit(ipHash, env, now);

    if (limit.blocked) {
      return json({ ok: false, error: "rate_limited" }, 429);
    }

    return json({ ok: false, error: "invalid_credentials" }, 401);
  } catch {
    return json({ ok: false, error: "login_failed" }, 503);
  }
}

export async function adminSession({ request, env }) {
  const authenticated = await hasAdminSession(request, env);
  return json({ ok: true, authenticated });
}

export async function adminLogout({ request }) {
  if (!sameOrigin(request)) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  return json(
    { ok: true },
    200,
    { "Set-Cookie": sessionCookie("", 0) }
  );
}

export async function adminListAppointments({ request, env }) {
  if (!(await hasAdminSession(request, env))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  try {
    const result = await env.DB.prepare(`
      SELECT
        id,
        patient_name,
        phone,
        service_type,
        preferred_date,
        notes,
        status,
        reference,
        created_at
      FROM appointments
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT 200
    `).all();

    return json({
      ok: true,
      appointments: result.results || []
    });
  } catch {
    return json({ ok: false, error: "database_error" }, 503);
  }
}

export async function adminUpdateAppointment({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  if (!(await hasAdminSession(request, env))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const body = await readJson(request);

  const id = Number(body?.id);
  const allowedStatuses = new Set([
    "confirmed",
    "rejected",
    "cancelled"
  ]);

  if (
    !Number.isSafeInteger(id) ||
    id < 1 ||
    !allowedStatuses.has(body?.status)
  ) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  try {
    const result = await env.DB.prepare(`
      UPDATE appointments
      SET status = ?
      WHERE id = ?
      RETURNING id, status
    `).bind(body.status, id).first();

    if (!result) {
      return json({ ok: false, error: "not_found" }, 404);
    }

    return json({ ok: true, appointment: result });
  } catch {
    return json({ ok: false, error: "database_error" }, 503);
  }
}

export async function adminCreateAppointment({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  if (!(await hasAdminSession(request, env))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const body = await readJson(request);

  const services = new Set([
    "general",
    "cosmetic",
    "orthodontics",
    "restorative",
    "implants",
    "pediatric",
    "other"
  ]);

  const sources = new Set([
    "phone",
    "whatsapp",
    "walk_in"
  ]);

  const name = typeof body?.patient_name === "string"
    ? body.patient_name.trim().replace(/\s+/g, " ")
    : "";

  const phone = typeof body?.phone === "string"
    ? body.phone.trim()
    : "";

  const phoneDigits = phone.replace(/\D/g, "");

  if (
    name.length < 2 ||
    name.length > 100 ||
    /[\u0000-\u001F\u007F]/.test(name) ||
    !/^[+()\d\s.-]{8,25}$/.test(phone) ||
    phoneDigits.length < 8 ||
    phoneDigits.length > 15 ||
    !services.has(body?.service_type) ||
    !sources.has(body?.source)
  ) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  try {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    const reference = "NOVA-" + Array.from(
      bytes,
      byte => byte.toString(16).padStart(2, "0")
    ).join("").slice(0, 16).toUpperCase();

    const result = await env.DB.prepare(`
      INSERT INTO appointments (
        patient_name,
        phone,
        service_type,
        preferred_date,
        status,
        reference,
        source
      )
      VALUES (?, ?, ?, '', 'pending', ?, ?)
      RETURNING id, patient_name, phone, service_type,
                preferred_date, status, reference, source, created_at
    `).bind(
      name,
      phone,
      body.service_type,
      reference,
      body.source
    ).first();

    if (!result) {
      return json({ ok: false, error: "database_write_failed" }, 503);
    }

    return json({ ok: true, appointment: result }, 201);
  } catch {
    return json({ ok: false, error: "database_write_failed" }, 503);
  }
}
