import {
  onRequestPost,
  onRequestGet
} from "../functions/api/appointments.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/appointments") {
      if (request.method === "POST") {
        const ip = request.headers.get("CF-Connecting-IP");

        if (!ip) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "ip_unavailable"
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        const { success } = await env.APPOINTMENTS_LIMITER.limit({
          key: ip
        });

        if (!success) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "rate_limited"
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        return onRequestPost({ request, env });
      }

      if (request.method === "GET") {
        return onRequestGet();
      }

      return new Response(
        JSON.stringify({
          ok: false,
          error: "method_not_allowed"
        }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Allow": "GET, POST"
          }
        }
      );
    }

    if (url.pathname.startsWith("/api/")) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "not_found"
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
