
import {
  onRequestPost,
  onRequestGet
} from "../functions/api/appointments.js";

import {
  adminLogin,
  adminSession,
  adminLogout,
  adminListAppointments,
  adminUpdateAppointment,
  adminCreateAppointment
} from "../functions/api/admin.js";

import {
  adminListPatients,
  adminGetPatient,
  adminCreateVisit,
  adminReports,
  adminExport
} from "../functions/api/records.js";

function methodNotAllowed(allow) {
  return new Response(
    JSON.stringify({ ok: false, error: "method_not_allowed" }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "Allow": allow
      }
    }
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Public booking API — unchanged
    if (path === "/api/appointments") {
      if (method === "POST") {
        return onRequestPost({ request, env });
      }

      if (method === "GET") {
        return onRequestGet();
      }

      return methodNotAllowed("GET, POST");
    }

    // Secretary login
    if (path === "/api/admin/login") {
      return method === "POST"
        ? adminLogin({ request, env })
        : methodNotAllowed("POST");
    }

    // Check secretary session
    if (path === "/api/admin/session") {
      return method === "GET"
        ? adminSession({ request, env })
        : methodNotAllowed("GET");
    }

    // Secretary logout
    if (path === "/api/admin/logout") {
      return method === "POST"
        ? adminLogout({ request, env })
        : methodNotAllowed("POST");
    }

    // Appointments
    if (path === "/api/admin/appointments") {
      return method === "GET"
        ? adminListAppointments({ request, env })
        : methodNotAllowed("GET");
    }

    if (path === "/api/admin/appointments/update") {
      return method === "POST"
        ? adminUpdateAppointment({ request, env })
        : methodNotAllowed("POST");
    }

    if (path === "/api/admin/appointments/create") {
      return method === "POST"
        ? adminCreateAppointment({ request, env })
        : methodNotAllowed("POST");
    }

    // Patients
    if (path === "/api/admin/patients") {
      return method === "GET"
        ? adminListPatients({ request, env })
        : methodNotAllowed("GET");
    }

    if (path === "/api/admin/patients/detail") {
      return method === "GET"
        ? adminGetPatient({ request, env })
        : methodNotAllowed("GET");
    }

    // Patient visits
    if (path === "/api/admin/visits") {
      return method === "POST"
        ? adminCreateVisit({ request, env })
        : methodNotAllowed("POST");
    }

    // Reports
    if (path === "/api/admin/reports") {
      return method === "GET"
        ? adminReports({ request, env })
        : methodNotAllowed("GET");
    }

    // Backup export
    if (path === "/api/admin/export") {
      return method === "GET"
        ? adminExport({ request, env })
        : methodNotAllowed("GET");
    }

    // Secretary dashboard page
    if (path === "/admin" || path === "/admin/") {
      if (method !== "GET") {
        return methodNotAllowed("GET");
      }

      const assetUrl = new URL("/admin.html", url);
      const assetResponse = await env.ASSETS.fetch(
        new Request(assetUrl, request)
      );

      const headers = new Headers(assetResponse.headers);
      headers.set("Cache-Control", "no-store");

      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers
      });
    }

    // Unknown API routes
    if (path.startsWith("/api/")) {
      return new Response(
        JSON.stringify({ ok: false, error: "not_found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
