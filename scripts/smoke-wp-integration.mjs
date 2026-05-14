// Smoke test the three WP-plugin integration endpoints in prod.
// Run: node scripts/smoke-wp-integration.mjs
// Deletes itself idea: keep for now until WP plugin is verified live.

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
const BASE = process.env.SMOKE_BASE || "https://gladiusturf.com";
const SLUG = process.env.SMOKE_TENANT || "bright-lights-encina";

const sb = new Client({
  connectionString: `postgresql://postgres.dkghawpyolcyarjyihkp:${encodeURIComponent(
    password,
  )}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});
await sb.connect();

const tenantRow = await sb.query(
  "select id, api_key from public.tenants where slug = $1",
  [SLUG],
);
if (tenantRow.rows.length === 0) {
  console.error(`tenant ${SLUG} not found`);
  await sb.end();
  process.exit(1);
}
const { id: tenantId, api_key: apiKey } = tenantRow.rows[0];

console.log(`\n=== WP Integration smoke ${BASE} · tenant=${SLUG} ===\n`);

// ---- 1. /health without key (expect 401) ----
console.log("1. GET /health (no key) → expect 401");
{
  const r = await fetch(`${BASE}/api/integrations/health`);
  console.log(`   status=${r.status} body=${await r.text()}`);
}

// ---- 2. /health with bad key (expect 401) ----
console.log("\n2. GET /health (bad key) → expect 401");
{
  const r = await fetch(`${BASE}/api/integrations/health`, {
    headers: { Authorization: "Bearer glx_garbage_does_not_exist_yo" },
  });
  console.log(`   status=${r.status} body=${await r.text()}`);
}

// ---- 3. /health with valid key (expect 200) ----
console.log("\n3. GET /health (valid key) → expect 200");
{
  const r = await fetch(`${BASE}/api/integrations/health`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  console.log(`   status=${r.status} body=${await r.text()}`);
}

// ---- 4. /leads with valid key (expect 200 + id) ----
console.log("\n4. POST /leads (valid key, full payload) → expect 200");
const leadEmail = `smoke-${Date.now()}@example.com`;
const leadPhone = `941-555-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
{
  const r = await fetch(`${BASE}/api/integrations/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: "Smoke Test Lead",
      email: leadEmail,
      phone: leadPhone,
      address: "123 Test Way, Sarasota FL",
      service: "Full Yard Lighting Design",
      notes: "Smoke test from scripts/smoke-wp-integration.mjs",
      source: "google",
      campaign: "smoke_test",
      medium: "cpc",
      page_url: "https://brightlightslandscapelighting.com/",
      referrer: "https://google.com",
      external_id: `smoke-${Date.now()}`,
    }),
  });
  console.log(`   status=${r.status} body=${await r.text()}`);
}

// ---- 5. /leads idempotency (same phone+email → existing customer) ----
console.log("\n5. POST /leads (same identity again) → expect customer_existed:true");
{
  const r = await fetch(`${BASE}/api/integrations/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: "Smoke Test Lead",
      email: leadEmail,
      phone: leadPhone,
      service: "Repair quote",
    }),
  });
  console.log(`   status=${r.status} body=${await r.text()}`);
}

// ---- 6. /webhooks (phone_click) ----
console.log("\n6. POST /webhooks (phone_click) → expect 200");
{
  const r = await fetch(`${BASE}/api/integrations/webhooks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      event_type: "phone_click",
      timestamp: new Date().toISOString(),
      data: { phone: "941-555-0000", page_url: "https://brightlightslandscapelighting.com/" },
    }),
  });
  console.log(`   status=${r.status} body=${await r.text()}`);
}

// ---- 7. /webhooks invalid event type ----
console.log("\n7. POST /webhooks (invalid event_type) → expect 400");
{
  const r = await fetch(`${BASE}/api/integrations/webhooks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      event_type: "nuke_the_database",
      timestamp: new Date().toISOString(),
      data: {},
    }),
  });
  console.log(`   status=${r.status} body=${await r.text()}`);
}

// ---- 8. DB read-back ----
console.log("\n8. DB read-back");
const counts = await sb.query(
  `select
     (select count(*)::int from public.tenant_inbound_leads where tenant_id = $1) as inbound_leads,
     (select count(*)::int from public.web_events where tenant_id = $1) as web_events,
     (select count(*)::int from public.web_sessions where tenant_id = $1) as web_sessions,
     (select count(*)::int from public.customers where tenant_id = $1) as customers`,
  [tenantId],
);
console.table(counts.rows);

const recentLeads = await sb.query(
  `select id, name, email, phone, service, source, customer_id, created_at
     from public.tenant_inbound_leads
     where tenant_id = $1
     order by created_at desc
     limit 3`,
  [tenantId],
);
console.log("Recent inbound leads:");
console.table(recentLeads.rows);

await sb.end();
console.log("\n✓ Smoke test complete.\n");
