
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
  adminCreateAppointment,
  hasAdminSession
} from "../functions/api/admin.js";

import {
  adminListPatients,
  adminGetPatient,
  adminCreatePatient,
  adminCreateVisit,
  adminReports,
  adminExport
} from "../functions/api/records.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function methodNotAllowed(allowed) {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: {
      "Allow": allowed,
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // Public appointment requests
      if (path === "/api/appointments") {
        if (method === "POST") {
          return onRequestPost({ request, env, ctx });
        }

        if (method === "GET") {
          return onRequestGet({ request, env, ctx });
        }

        return methodNotAllowed("GET, POST");
      }

      // Admin authentication
      if (path === "/api/admin/login") {
        return method === "POST"
          ? adminLogin({ request, env })
          : methodNotAllowed("POST");
      }

      if (path === "/api/admin/session") {
        return method === "GET"
          ? adminSession({ request, env })
          : methodNotAllowed("GET");
      }

      if (path === "/api/admin/logout") {
        return method === "POST"
          ? adminLogout({ request, env })
          : methodNotAllowed("POST");
      }

      // Admin appointments
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

      // Admin patients
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

      if (path === "/api/admin/patients/create") {
        return method === "POST"
          ? adminCreatePatient({ request, env })
          : methodNotAllowed("POST");
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

      // Data export
      if (path === "/api/admin/export") {
        return method === "GET"
          ? adminExport({ request, env })
          : methodNotAllowed("GET");
      }

      // Admin dashboard
      if (path === "/admin" || path === "/admin/") {
        return env.ASSETS.fetch(
          new Request(new URL("/admin.html", request.url), request)
        );
      }

      // Unknown API route
      if (path.startsWith("/api/")) {
        return json({
          ok: false,
          error: "not_found"
        }, 404);
      }

      // Static website assets
      return env.ASSETS.fetch(request);

    } catch (error) {
      console.error("Worker error:", error);

      return json({
        ok: false,
        error: "internal_server_error"
      }, 500);
    }
  }
};
