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

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ ok: false, database: "not_bound" }, 503);
  try {
    await env.DB.prepare("SELECT 1 AS connected").first();
    return json({ ok: true, database: "connected" });
  } catch {
    return json({ ok: false, database: "query_failed" }, 503);
  }
}
