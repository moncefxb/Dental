
import {
  onRequestPost,
  onRequestGet
} from "../functions/api/appointments.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/appointments") {
      if (request.method === "POST") {
        return onRequestPost({ request, env });
      }

      if (request.method === "GET") {
        return onRequestGet();
      }

      return new Response(
        JSON.stringify({ ok: false, error: "method_not_allowed" }),
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
        JSON.stringify({ ok: false, error: "not_found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
