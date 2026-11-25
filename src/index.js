import { onRequestGet as healthGet } from "../health.js";

import {
  onRequestPost,
  onRequestGet
} from "../functions/api/appointments.js";

import {
  bookingOptions, availability, book, manageLookup, manageCancel, manageReschedule
} from "../functions/api/booking.js";

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

import { adminManage, adminSetStatus } from "../functions/api/manage.js";
import { adminChangePassword } from "../functions/api/auth.js";

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
      // Operational health check
      if (path === "/api/health") {
        return method === "GET"
          ? healthGet({ request, env, ctx })
          : methodNotAllowed("GET");
      }

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

      // SEO: generated from the request origin so it is correct on any domain
      if (path === "/robots.txt" && method === "GET") {
        return new Response(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /manage.html\n\nSitemap: ${url.origin}/sitemap.xml\n`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      }
      if (path === "/sitemap.xml" && method === "GET") {
        const pages = ["/", "/services.html", "/team.html", "/studio.html", "/contact.html"];
        return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${url.origin}${p}</loc></url>`).join("\n")}\n</urlset>\n`, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      }

      // Real booking system
      if (path === "/api/booking/options") return method === "GET" ? bookingOptions({ request, env, ctx }) : methodNotAllowed("GET");
      if (path === "/api/availability") return method === "GET" ? availability({ request, env, ctx }) : methodNotAllowed("GET");
      if (path === "/api/book") return method === "POST" ? book({ request, env, ctx }) : methodNotAllowed("POST");
      if (path === "/api/booking/manage") return method === "GET" ? manageLookup({ request, env, ctx }) : methodNotAllowed("GET");
      if (path === "/api/booking/cancel") return method === "POST" ? manageCancel({ request, env, ctx }) : methodNotAllowed("POST");
      if (path === "/api/booking/reschedule") return method === "POST" ? manageReschedule({ request, env, ctx }) : methodNotAllowed("POST");

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

      // Platform management (services, dentists, hours, time off, settings, audit, users)
      const m = path.match(/^\/api\/admin\/(services|dentists|hours|timeoff|settings|audit|users)$/);
      if (m) return method === "GET" || method === "POST" ? adminManage({ request, env, ctx }, m[1]) : methodNotAllowed("GET, POST");
      if (path === "/api/admin/appointments/status") return method === "POST" ? adminSetStatus({ request, env, ctx }) : methodNotAllowed("POST");
      if (path === "/api/admin/password") return method === "POST" ? adminChangePassword({ request, env }) : methodNotAllowed("POST");

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
