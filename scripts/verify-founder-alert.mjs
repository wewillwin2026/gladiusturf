// Fires ONE /leads call to confirm the FOUNDER_ALERT_EMAIL env wiring,
// then immediately re-runs the cleanup. Leaves the DB in the same
// zero-row state as before.
//
// Run: node scripts/verify-founder-alert.mjs

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

const BASE = "https://gladiusturf.com";
const SLUG = "bright-lights-encina";

const c = new Client({
  connectionString: `postgresql://postgres.dkghawpyolcyarjyihkp:${encodeURIComponent(
    env.SUPABASE_DB_PASSWORD,
  )}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const tenantRow = await c.query(
  "select id, api_key from public.tenants where slug = $1",
  [SLUG],
);
if (tenantRow.rows.length === 0) {
  console.error("tenant not found");
  await c.end();
  process.exit(1);
}
const { id: tenantId, api_key: apiKey } = tenantRow.rows[0];

console.log(`\n→ Firing alert verification lead against ${BASE}`);
const r = await fetch(`${BASE}/api/integrations/leads`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    name: "Smoke Test Lead",
    email: `alert-verify-${Date.now()}@example.com`,
    phone: "941-555-9991",
    service: "Founder alert wiring check",
    notes: "smoke — verify FOUNDER_ALERT_EMAIL after redeploy",
    source: "smoke_test",
    campaign: "alert_verify",
    medium: "smoke",
    page_url: "https://brightlightslandscapelighting.com/",
    referrer: "https://google.com",
    external_id: `alert-verify-${Date.now()}`,
  }),
});
console.log(`  status=${r.status} body=${await r.text()}`);

console.log("\n→ Sleeping 4s so the founder alert send has time to fire…");
await new Promise((res) => setTimeout(res, 4000));

console.log("\n→ Re-cleaning to leave DB at zero rows…");
const leads = await c.query(
  `delete from public.tenant_inbound_leads
     where tenant_id = $1
       and (
         source_endpoint = 'wp_leads' and name = 'Smoke Test Lead'
         or (notes is not null and notes ilike '%smoke%')
       )
     returning id`,
  [tenantId],
);
const customers = await c.query(
  `delete from public.customers
     where tenant_id = $1
       and display_name = 'Smoke Test Lead'
     returning id`,
  [tenantId],
);
const sessions = await c.query(
  `delete from public.web_sessions
     where tenant_id = $1
       and (
         utm_source in ('smoke_test', 'smoke')
         or visitor_hash like 'ext:smoke-%'
         or visitor_hash like 'ext:alert-verify-%'
         or visitor_hash like 'lead:%'
         or visitor_hash like '+1941555999%'
       )
     returning id`,
  [tenantId],
);
console.log(
  `  cleaned leads=${leads.rowCount} customers=${customers.rowCount} sessions=${sessions.rowCount}`,
);

const remaining = await c.query(
  `select
     (select count(*)::int from public.tenant_inbound_leads where tenant_id = $1) as leads,
     (select count(*)::int from public.web_events where tenant_id = $1) as events,
     (select count(*)::int from public.web_sessions where tenant_id = $1) as sessions,
     (select count(*)::int from public.customers where tenant_id = $1) as customers`,
  [tenantId],
);
console.log("\nRemaining (should be 0/0/0/0):");
console.table(remaining.rows);

await c.end();
console.log(
  "\n✓ Alert verification complete. Check ricardo.gamon99@icloud.com for the 'New lead · Bright Lights' email.\n",
);
