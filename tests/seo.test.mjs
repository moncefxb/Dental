import { makeDB } from "./d1shim.mjs"; import worker from "../src/index.js"; import assert from "node:assert/strict";
const env = { DB: makeDB("../migrations"), ASSETS: { fetch: async () => new Response("a") } };
const get = async (p) => { const r = await worker.fetch(new Request("https://clinic.example" + p), env, {}); return [r, await r.text()]; };
let [r, t] = await get("/robots.txt"); assert.equal(r.status, 200); assert.match(t, /Disallow: \/admin/); assert.match(t, /Sitemap: https:\/\/clinic\.example\/sitemap\.xml/);
[r, t] = await get("/sitemap.xml"); assert.equal(r.status, 200); assert.match(t, /<loc>https:\/\/clinic\.example\/contact\.html<\/loc>/); assert.ok(!/admin|manage/.test(t));
console.log("ok   robots.txt + sitemap.xml generated from request origin, exclude admin/manage");
