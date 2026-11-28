import { json, sameOrigin, readJson, hasAdminSession, requireAdmin, audit, adminLogin, adminSession, adminLogout } from "./auth.js";
export { hasAdminSession, adminLogin, adminSession, adminLogout };

export async function adminListAppointments({ request, env }) {
  if (!(await hasAdminSession(request, env))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  try {
    const result = await env.DB.prepare(`
      SELECT
        a.id, a.patient_name, a.phone, a.email, a.service_type, a.preferred_date,
        a.scheduled_at, a.duration_minutes, a.notes, a.status, a.source,
        a.created_at, a.dentist_id, d.name AS dentist_name
      FROM appointments a
      LEFT JOIN dentists d ON d.id = a.dentist_id
      ORDER BY datetime(a.created_at) DESC, a.id DESC
      LIMIT 200
    `).all();

    return json({
      ok: true,
      appointments: result.results || []
    });
  } catch (error) {
    console.error("adminListAppointments error:", error);
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

  if (!Number.isSafeInteger(id) || id < 1) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  try {
    if (typeof body.scheduled_at === "string") {
      const value = body.scheduled_at.trim();

      if (value !== "") {
        const match = value.match(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
        );

        if (!match) {
          return json({ ok: false, error: "invalid_date" }, 400);
        }

        const [, year, month, day, hour, minute] = match;

        const date = new Date(Date.UTC(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute)
        ));

        if (
          date.getUTCFullYear() !== Number(year) ||
          date.getUTCMonth() !== Number(month) - 1 ||
          date.getUTCDate() !== Number(day) ||
          Number(hour) > 23 ||
          Number(minute) > 59
        ) {
          return json({ ok: false, error: "invalid_date" }, 400);
        }
      }

      const result = await env.DB.prepare(`
        UPDATE appointments
        SET scheduled_at = ?
        WHERE id = ?
        RETURNING id, scheduled_at
      `).bind(value || null, id).first();

      if (!result) {
        return json({ ok: false, error: "not_found" }, 404);
      }

      return json({ ok: true, appointment: result });
    }

    const allowedStatuses = new Set([
      "confirmed",
      "rejected",
      "cancelled"
    ]);

    if (!allowedStatuses.has(body?.status)) {
      return json({ ok: false, error: "invalid_input" }, 400);
    }

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
  } catch (error) {
    console.error("adminUpdateAppointment error:", error);

    if (String(error?.message || "").includes("appointment_conflict")) {
      return json({ ok: false, error: "appointment_conflict" }, 409);
    }

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

    const legacyUniqueValue = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");

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
                preferred_date, scheduled_at, status,
                source, created_at
    `).bind(
      name,
      phone,
      body.service_type,
      legacyUniqueValue,
      body.source
    ).first();

    if (!result) {
      return json({ ok: false, error: "database_write_failed" }, 503);
    }

    return json({ ok: true, appointment: result }, 201);
  } catch (error) {
    console.error("adminCreateAppointment error:", error);
    return json({ ok: false, error: "database_write_failed" }, 503);
  }
}
