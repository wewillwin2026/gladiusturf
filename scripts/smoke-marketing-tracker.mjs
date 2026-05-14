// One-off smoke test for the marketing tracker ingest endpoint.
// 1. Hits prod /api/marketing/track with a fake unknown tenant (expects 404)
// 2. Hits prod /api/marketing/track with the Bright Lights slug (expects 200)
// 3. Reads back web_sessions + web_events count for that tenant
// Delete this file after first successful run.

import { readFileSync } from "node:fs";
import { Client } from "pg";

const envText = readFileSync(".env.local", "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [
        l.slice(0, idx).trim(),
        l.slice(idx + 1).trim().replace(/^"|"$/g, ""),
      ];
    }),
);

const password = env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("SUPABASE_DB_PASSWORD missing from .env.local");
  process.exit(1);
}

const BASE = process.env.SMOKE_BASE || "https://gladiusturf.com";
const SLUG = process.env.SMOKE_TENANT || "bright-lights";

console.log(`\n=== Smoke test: ${BASE}/api/marketing/track ===\n`);

// 1. CORS preflight
console.log("1. OPTIONS preflight…");
const optsRes = await fetch(`${BASE}/api/marketing/track`, {
  method: "OPTIONS",
  headers: { Origin: "https://brightlightsfl.com" },
});
console.log(`   status=${optsRes.status} (expect 204)`);

// 2. Unknown tenant
console.log("\n2. POST with unknown tenant slug…");
const unknownRes = await fetch(`${BASE}/api/marketing/track`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tenantSlug: "this-tenant-does-not-exist",
    events: [{ kind: "page_view", path: "/" }],
  }),
});
const unknownBody = await unknownRes.json();
console.log(`   status=${unknownRes.status} body=${JSON.stringify(unknownBody)} (expect 404)`);

// 3. Real tenant
console.log(`\n3. POST with tenant slug "${SLUG}"…`);
const realRes = await fetch(`${BASE}/api/marketing/track`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tenantSlug: SLUG,
    fingerprint: "smoke-test",
    device: "desktop",
    referrer: "https://google.com/",
    utm: { utm_source: "smoke_test", utm_campaign: "ingest_check" },
    events: [
      { kind: "page_view", path: "/" },
      { kind: "scroll_depth", path: "/", meta: { percent: 50 } },
      { kind: "form_start", path: "/contact", target: "quote-form" },
    ],
  }),
});
const realBody = await realRes.json();
console.log(`   status=${realRes.status} body=${JSON.stringify(realBody)} (expect 200, ingested=3)`);

// 4. Read back via DB
console.log("\n4. Read back from DB…");
const client = new Client({
  connectionString: `postgresql://postgres.dkghawpyolcyarjyihkp:${encodeURIComponent(
    password,
  )}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const tenantRow = await client.query(
  "select id, marketing_tab_enabled from public.tenants where slug = $1",
  [SLUG],
);
if (tenantRow.rows.length === 0) {
  console.log(`   ✗ no tenant row for slug=${SLUG}`);
  await client.end();
  process.exit(1);
}
const tenantId = tenantRow.rows[0].id;
console.log(`   tenant_id=${tenantId} marketing_tab_enabled=${tenantRow.rows[0].marketing_tab_enabled}`);

const sessions = await client.query(
  "select count(*)::int from public.web_sessions where tenant_id = $1",
  [tenantId],
);
const events = await client.query(
  "select count(*)::int, array_agg(distinct kind) as kinds from public.web_events where tenant_id = $1",
  [tenantId],
);
console.log(`   web_sessions=${sessions.rows[0].count}`);
console.log(`   web_events=${events.rows[0].count} kinds=${JSON.stringify(events.rows[0].kinds)}`);

await client.end();
console.log("\n✓ Smoke test complete.\n");
