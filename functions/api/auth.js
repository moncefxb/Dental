// Admin authentication: PBKDF2 password hashes, server-side revocable sessions, audit log.
const COOKIE = "nova_admin_session", SESSION_SECONDS = 8 * 60 * 60, WINDOW = 15 * 60, MAX_ATTEMPTS = 5, ITER = 100000; // 100k = Workers WebCrypto PBKDF2 ceiling
const hex = (b) => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join("");
const unhex = (s) => Uint8Array.from(s.match(/../g) || [], h => parseInt(h, 16));
const rand = (n) => { const b = new Uint8Array(n); crypto.getRandomValues(b); return hex(b); };
const enc = new TextEncoder();
const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
async function hmacHex(v, secret) { const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); return hex(await crypto.subtle.sign("HMAC", k, enc.encode(v))); }
export const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff", ...extra } });
export function sameOrigin(req) { const o = req.headers.get("Origin"); if (!o) return false; try { return new URL(o).origin === new URL(req.url).origin; } catch { return false; } }
function ctEqual(a, b) { const l = enc.encode(String(a)), r = enc.encode(String(b)); let d = l.length ^ r.length; for (let i = 0; i < Math.max(l.length, r.length); i++) d |= (l[i] || 0) ^ (r[i] || 0); return d === 0; }
export async function readJson(req, max = 4096) {
  if (!(req.headers.get("Content-Type") || "").toLowerCase().includes("application/json")) return null;
  const raw = await req.text(); if (raw.length > max) return null;
  try { const b = JSON.parse(raw); return b && typeof b === "object" && !Array.isArray(b) ? b : null; } catch { return null; }
}
const getCookie = (req, name) => { for (const p of (req.headers.get("Cookie") || "").split(";")) { const i = p.indexOf("="); if (i > 0 && p.slice(0, i).trim() === name) return p.slice(i + 1).trim(); } return ""; };
const cookie = (v, age) => `${COOKIE}=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;

// ----- passwords -----
export async function hashPassword(password, iterations = ITER) {
  const salt = rand(16), key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unhex(salt), iterations }, key, 256);
  return `pbkdf2$sha256$${iterations}$${salt}$${hex(bits)}`;
}
export async function verifyPassword(password, stored) {
  const [alg, h, it, salt, want] = String(stored).split("$"); if (alg !== "pbkdf2" || h !== "sha256" || !salt || !want) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unhex(salt), iterations: Number(it) || ITER }, key, 256);
  return ctEqual(hex(bits), want);
}
export const passwordOk = (p) => typeof p === "string" && p.length >= 12 && p.length <= 200 && /[a-zA-Z]/.test(p) && /[^a-zA-Z]/.test(p);

// ----- sessions -----
export async function getAdminUser(request, env) {
  const token = getCookie(request, COOKIE); if (!/^[a-f0-9]{64}$/.test(token) || !env.DB) return null;
  const now = Math.floor(Date.now() / 1000);
  return await env.DB.prepare(`SELECT u.id,u.username,u.role FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.expires_at>? AND u.active=1`).bind(await sha256(token), now).first() || null;
}
export async function hasAdminSession(request, env) { return !!(await getAdminUser(request, env)); }
/** Returns {user} or {response}. Enforces same-origin on writes and optional role. */
export async function requireAdmin(request, env, { write = false, role = null } = {}) {
  if (write && !sameOrigin(request)) return { response: json({ ok: false, error: "forbidden" }, 403) };
  const user = await getAdminUser(request, env);
  if (!user) return { response: json({ ok: false, error: "unauthorized" }, 401) };
  if (role && user.role !== role) return { response: json({ ok: false, error: "forbidden" }, 403) };
  return { user };
}
export async function audit(env, request, actor, action, entity = "", entityId = "", detail = "") {
  try {
    const ip = request.headers.get("CF-Connecting-IP") || "", h = ip && env.RATE_LIMIT_SECRET ? (await hmacHex(`audit:${ip}`, env.RATE_LIMIT_SECRET)).slice(0, 16) : "";
    await env.DB.prepare("INSERT INTO audit_logs (actor,action,entity,entity_id,detail,ip_hash) VALUES (?,?,?,?,?,?)").bind(actor, action, entity, String(entityId), String(detail).slice(0, 300), h).run();
  } catch (e) { console.error("audit failed"); }
}

// ----- login -----
async function throttle(env, ipHash, now) {
  const prev = await env.DB.prepare("SELECT blocked_until FROM admin_login_attempts WHERE ip_hash=?").bind(ipHash).first();
  if (prev?.blocked_until > now) return true;
  const s = await env.DB.prepare(`INSERT INTO admin_login_attempts (ip_hash,attempts,window_started_at,blocked_until) VALUES (?,1,?,0)
    ON CONFLICT(ip_hash) DO UPDATE SET
     attempts=CASE WHEN admin_login_attempts.window_started_at<=? THEN 1 ELSE admin_login_attempts.attempts+1 END,
     window_started_at=CASE WHEN admin_login_attempts.window_started_at<=? THEN excluded.window_started_at ELSE admin_login_attempts.window_started_at END,
     blocked_until=CASE WHEN admin_login_attempts.window_started_at<=? THEN 0 WHEN admin_login_attempts.attempts+1>=? THEN excluded.window_started_at+? ELSE admin_login_attempts.blocked_until END
    RETURNING blocked_until`).bind(ipHash, now, now - WINDOW, now - WINDOW, now - WINDOW, MAX_ATTEMPTS, WINDOW).first();
  return s?.blocked_until > now;
}
const DUMMY = "pbkdf2$sha256$100000$" + "00".repeat(16) + "$" + "00".repeat(32);

export async function adminLogin({ request, env }) {
  if (!sameOrigin(request)) return json({ ok: false, error: "forbidden" }, 403);
  if (!env.DB || !env.RATE_LIMIT_SECRET) return json({ ok: false, error: "server_configuration_error" }, 503);
  const b = await readJson(request);
  if (!b || typeof b.username !== "string" || typeof b.password !== "string" || b.username.length > 128 || b.password.length > 256) return json({ ok: false, error: "invalid_input" }, 400);
  const ip = request.headers.get("CF-Connecting-IP"); if (!ip) return json({ ok: false, error: "login_unavailable" }, 503);
  try {
    const now = Math.floor(Date.now() / 1000), ipHash = await hmacHex(`admin-login:${ip}`, env.RATE_LIMIT_SECRET);
    const blocked = await env.DB.prepare("SELECT blocked_until FROM admin_login_attempts WHERE ip_hash=?").bind(ipHash).first();
    if (blocked?.blocked_until > now) return json({ ok: false, error: "rate_limited" }, 429);
    const username = b.username.trim().toLowerCase();
    let user = await env.DB.prepare("SELECT id,username,role,password_hash,active FROM admin_users WHERE username=?").bind(username).first();
    let ok = await verifyPassword(b.password, user?.password_hash || DUMMY) && !!user && user.active === 1;
    // One-time bootstrap: with an empty user table, the legacy ADMIN_USERNAME/ADMIN_PASSWORD secrets create the first (hashed) admin.
    if (!ok && !user && env.ADMIN_USERNAME && env.ADMIN_PASSWORD && ctEqual(username, String(env.ADMIN_USERNAME).toLowerCase()) && ctEqual(b.password, env.ADMIN_PASSWORD)) {
      const n = await env.DB.prepare("SELECT count(*) AS c FROM admin_users").first();
      if (n.c === 0) {
        const r = await env.DB.prepare("INSERT INTO admin_users (username,password_hash,role) VALUES (?,?,'admin') RETURNING id,username,role,active").bind(username, await hashPassword(b.password)).first();
        user = r; ok = true; await audit(env, request, username, "admin.bootstrap", "admin_user", r.id);
      }
    }
    if (!ok) { await audit(env, request, username.slice(0, 40), "login.failed"); return (await throttle(env, ipHash, now)) ? json({ ok: false, error: "rate_limited" }, 429) : json({ ok: false, error: "invalid_credentials" }, 401); }
    await env.DB.prepare("DELETE FROM admin_login_attempts WHERE ip_hash=?").bind(ipHash).run();
    await env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at<?").bind(now).run();
    const token = rand(32);
    await env.DB.prepare("INSERT INTO admin_sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)").bind(await sha256(token), user.id, now + SESSION_SECONDS, now).run();
    await audit(env, request, user.username, "login.success");
    return json({ ok: true, user: { username: user.username, role: user.role } }, 200, { "Set-Cookie": cookie(token, SESSION_SECONDS) });
  } catch (e) { console.error("login error", e?.message); return json({ ok: false, error: "login_failed" }, 503); }
}
export async function adminSession({ request, env }) {
  const u = await getAdminUser(request, env); return json({ ok: true, authenticated: !!u, user: u ? { username: u.username, role: u.role } : null });
}
export async function adminLogout({ request, env }) {
  if (!sameOrigin(request)) return json({ ok: false, error: "forbidden" }, 403);
  const t = getCookie(request, COOKIE);
  if (/^[a-f0-9]{64}$/.test(t)) await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash=?").bind(await sha256(t)).run(); // real server-side revocation
  return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
}
export async function adminChangePassword({ request, env }) {
  const a = await requireAdmin(request, env, { write: true }); if (a.response) return a.response;
  const b = await readJson(request);
  if (!b || typeof b.current !== "string" || !passwordOk(b.next)) return json({ ok: false, error: "weak_password" }, 400);
  const row = await env.DB.prepare("SELECT password_hash FROM admin_users WHERE id=?").bind(a.user.id).first();
  if (!(await verifyPassword(b.current, row.password_hash))) return json({ ok: false, error: "invalid_credentials" }, 401);
  await env.DB.prepare("UPDATE admin_users SET password_hash=? WHERE id=?").bind(await hashPassword(b.next), a.user.id).run();
  const t = getCookie(request, COOKIE);
  await env.DB.prepare("DELETE FROM admin_sessions WHERE user_id=? AND token_hash!=?").bind(a.user.id, await sha256(t)).run(); // sign out other devices
  await audit(env, request, a.user.username, "password.changed", "admin_user", a.user.id);
  return json({ ok: true });
}
