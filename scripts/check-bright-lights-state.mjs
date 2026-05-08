// Verify Bright Lights tenant is in clean state for Day-1 onboarding.
import { readFileSync } from "node:fs";
import { Client } from "pg";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);

const TENANT_ID = "6f7c602a-42c3-4475-84de-410deb5a5679";

const client = new Client({
  connectionString: `postgresql://postgres.dkghawpyolcyarjyihkp:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const queries = [
  ["customers", `select count(*) from customers where tenant_id = $1`],
  ["lighting_fixtures", `select count(*) from lighting_fixtures where tenant_id = $1`],
  ["lighting_transformers", `select count(*) from lighting_transformers where tenant_id = $1`],
  ["lighting_warranty_claims", `select count(*) from lighting_warranty_claims where tenant_id = $1`],
  ["inventory_items (starter)", `select count(*) from inventory_items where tenant_id = $1 and is_starter = true`],
  ["inventory_units (starter)", `select count(*) from inventory_units where tenant_id = $1 and is_starter = true`],
  ["plans", `select tier, name, price_cents from plans where tenant_id = $1 order by sort_order`],
  ["tenant_invitations", `select email, role, status from tenant_invitations where tenant_id = $1 order by created_at`],
  ["tenants", `select slug, vertical, display_name from tenants where id = $1`],
];

for (const [label, q] of queries) {
  try {
    const r = await client.query(q, [TENANT_ID]);
    if (r.rows.length === 1 && "count" in r.rows[0]) {
      console.log(`${label.padEnd(28)} ${r.rows[0].count}`);
    } else {
      console.log(`${label}:`);
      for (const row of r.rows) console.log(`  `, row);
    }
  } catch (err) {
    console.log(`${label}: ERROR ${err.message}`);
  }
}

await client.end();
