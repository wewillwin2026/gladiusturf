import { readFileSync } from "node:fs";
import { Client } from "pg";

const envText = readFileSync(".env.local", "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => {
    const idx = l.indexOf("=");
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, "")];
  }),
);

const c = new Client({
  connectionString: `postgresql://postgres.dkghawpyolcyarjyihkp:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const r = await c.query("select id, slug, display_name, vertical, marketing_tab_enabled, substring(api_key, 1, 12) as api_key_preview from public.tenants order by created_at");
console.table(r.rows);
await c.end();
