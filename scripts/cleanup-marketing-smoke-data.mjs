// Cleanup the smoke-test data I created against Bright Lights' tenant
// during the marketing tracker + WP integration verification on
// 2026-05-14. Idempotent — safe to run more than once.
//
// What gets deleted (tenant-scoped to bright-lights-encina):
//   1. tenant_inbound_leads rows where notes mentions the smoke script
//      OR source_endpoint=wp_leads AND name='Smoke Test Lead'
//   2. customers row with display_name='Smoke Test Lead' (if any rows
//      remain pointing at it after step 1, customer_id is FK-nulled
//      by ON DELETE SET NULL — safe)
//   3. web_sessions rows tagged with smoke-test attribution
//      (utm_source IN ('smoke_test','smoke') OR visitor_hash LIKE 'ext:smoke-%')
//      — web_events for those sessions cascade-delete via FK.
//   4. Standalone /webhooks test events (web_session_id IS NULL +
//      meta->>'phone' = '941-555-0000' + kind='phone_click').

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

const SLUG = "bright-lights-encina";

const c = new Client({
  connectionString: `postgresql://postgres.dkghawpyolcyarjyihkp:${encodeURIComponent(
    env.SUPABASE_DB_PASSWORD,
  )}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const tenantRow = await c.query(
  "select id, display_name from public.tenants where slug = $1",
  [SLUG],
);
if (tenantRow.rows.length === 0) {
  console.error(`tenant ${SLUG} not found`);
  await c.end();
  process.exit(1);
}
const tenantId = tenantRow.rows[0].id;
console.log(`\nCleaning smoke-test rows from ${tenantRow.rows[0].display_name} (${tenantId})\n`);

// ---- 1. Inbound leads from smoke runs ----
const leads = await c.query(
  `delete from public.tenant_inbound_leads
     where tenant_id = $1
       and (
         source_endpoint = 'wp_leads' and name = 'Smoke Test Lead'
         or (notes is not null and notes ilike '%smoke%')
       )
     returning id, name, created_at`,
  [tenantId],
);
console.log(`tenant_inbound_leads: deleted ${leads.rowCount} row(s)`);

// ---- 2. The Smoke Test Lead customer ----
const customers = await c.query(
  `delete from public.customers
     where tenant_id = $1
       and display_name = 'Smoke Test Lead'
     returning id, display_name, primary_email, primary_phone`,
  [tenantId],
);
console.log(`customers: deleted ${customers.rowCount} row(s)`);

// ---- 3. Smoke web_sessions (cascades to web_events) ----
const sessions = await c.query(
  `delete from public.web_sessions
     where tenant_id = $1
       and (
         utm_source in ('smoke_test', 'smoke')
         or visitor_hash like 'ext:smoke-%'
         or visitor_hash like 'lead:%'
       )
     returning id, utm_source, visitor_hash, created_at`,
  [tenantId],
);
console.log(`web_sessions: deleted ${sessions.rowCount} row(s) (web_events cascaded)`);

// ---- 4. Standalone /webhooks test events ----
const orphanEvents = await c.query(
  `delete from public.web_events
     where tenant_id = $1
       and web_session_id is null
       and kind = 'phone_click'
       and meta ->> 'phone' = '941-555-0000'
     returning id`,
  [tenantId],
);
console.log(`web_events (orphan phone_click): deleted ${orphanEvents.rowCount} row(s)`);

// ---- Read-back ----
const remaining = await c.query(
  `select
     (select count(*)::int from public.tenant_inbound_leads where tenant_id = $1) as inbound_leads,
     (select count(*)::int from public.web_events where tenant_id = $1) as web_events,
     (select count(*)::int from public.web_sessions where tenant_id = $1) as web_sessions,
     (select count(*)::int from public.customers where tenant_id = $1) as customers`,
  [tenantId],
);
console.log("\nRemaining rows (Bright Lights tenant):");
console.table(remaining.rows);

await c.end();
console.log("\n✓ Cleanup complete.\n");
