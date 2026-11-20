
import {
  onRequestPost,
  onRequestGet
} from "../functions/api/appointments.js";

import {
  adminLogin,
  adminSession,
  adminLogout,
  adminListAppointments,
  adminUpdateAppointment
} from "../functions/api/admin.js";

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

    // List appointments — authenticated
    if (path === "/api/admin/appointments") {
      return method === "GET"
        ? adminListAppointments({ request, env })
        : methodNotAllowed("GET");
    }

    // Update appointment status — authenticated
    if (path === "/api/admin/appointments/update") {
      return method === "POST"
        ? adminUpdateAppointment({ request, env })
        : methodNotAllowed("POST");
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
