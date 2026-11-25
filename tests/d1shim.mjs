// Minimal Cloudflare D1 emulation on node:sqlite, used only for tests.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
export function makeDB(migrationsDir) {
  const db = new DatabaseSync(":memory:");
  for (const f of fs.readdirSync(migrationsDir).filter(f=>f.endsWith(".sql")).sort()) db.exec(fs.readFileSync(`${migrationsDir}/${f}`,"utf8"));
  const stmt = (sql, args=[]) => ({
    sql, args,
    bind(...a){ return stmt(sql,a); },
    _all(){ const s=db.prepare(sql); const isRead=/^\s*(select|with)/i.test(sql)||/returning/i.test(sql); return isRead? s.all(...args) : (s.run(...args), []); },
    async all(){ return { results: this._all() }; },
    async first(){ return this._all()[0] ?? null; },
    async run(){ const r=this._all(); return { results:r, success:true }; },
  });
  return { db, prepare:(s)=>stmt(s),
    async batch(list){ db.exec("BEGIN"); try{ const out=[]; for(const s of list) out.push({results:s._all()}); db.exec("COMMIT"); return out; }catch(e){ db.exec("ROLLBACK"); throw e; } } };
}
