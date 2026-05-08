// One-off migration applier (Bright Lights Friday push, 2026-05-08).
// Reads SUPABASE_DB_PASSWORD from .env.local, applies a SQL file via the
// Supabase pooler, prints rowcounts. Not committed to git history; delete
// after the live tenant is bootstrapped.

import { readFileSync } from "node:fs";
import { Client } from "pg";

const envText = readFileSync(".env.local", "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, "")];
    }),
);

const password = env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("SUPABASE_DB_PASSWORD missing from .env.local");
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-migration.mjs <path-to-sql>");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");
console.log(`\n→ Applying ${file} (${sql.length} bytes)`);

const client = new Client({
  connectionString: `postgresql://postgres.dkghawpyolcyarjyihkp:${encodeURIComponent(
    password,
  )}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query("begin");
  const result = await client.query(sql);
  await client.query("commit");
  const rowCounts = Array.isArray(result)
    ? result.map((r) => `${r.command} ${r.rowCount ?? 0}`).join(" · ")
    : `${result.command ?? "OK"} ${result.rowCount ?? 0}`;
  console.log(`✓ Applied — ${rowCounts}`);
} catch (err) {
  await client.query("rollback").catch(() => {});
  console.error(`✗ Failed: ${err.message}`);
  process.exit(2);
} finally {
  await client.end();
}
