import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { makeDB } from "./d1shim.mjs"; import worker from "../src/index.js";
const root = path.resolve(".."), types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };
export function start(port = 8788) {
  const DB = makeDB(path.join(root, "migrations"));
  const env = { DB, RATE_LIMIT_SECRET: "r".repeat(40), ADMIN_USERNAME: "owner", ADMIN_PASSWORD: "Bootstrap-Pass-123",
    ASSETS: { fetch: async (req) => { let p = new URL(req.url).pathname; if (p === "/") p = "/index.html"; const f = path.join(root, p); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return new Response("nf", { status: 404 }); return new Response(fs.readFileSync(f), { headers: { "Content-Type": types[path.extname(f)] || "application/octet-stream" } }); } } };
  let n = 0;
  const server = http.createServer(async (rq, rs) => {
    const chunks = []; for await (const c of rq) chunks.push(c); const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const h = new Headers(); for (const [k, v] of Object.entries(rq.headers)) h.set(k, v); h.set("CF-Connecting-IP", "10.1.1." + (++n % 250));
    const res = await worker.fetch(new Request(`http://localhost:${port}${rq.url}`, { method: rq.method, headers: h, body: ["GET", "HEAD"].includes(rq.method) ? undefined : body }), env, { waitUntil() {} });
    const out = {}; res.headers.forEach((v, k) => { out[k] = v; }); const sc = res.headers.get("Set-Cookie"); if (sc) out["set-cookie"] = sc.replace("; Secure", "");
    rs.writeHead(res.status, out); rs.end(Buffer.from(await res.arrayBuffer()));
  }); server.listen(port); return { server, DB };
}
