/**
 * RBAC gate covenant test (2026-05-19).
 *
 * Felipe (Bright Lights, role=admin) must NEVER see founders-only
 * surfaces (API / Integrations tabs) and must NOT be treated as a
 * founder (no Founders Portal door). Founders + the demo/founders
 * shell must still see everything. This asserts the PURE decision
 * functions that actually gate the UI — no server, no cookies, no
 * production. Run via:  npm run test:rbac
 *
 * Zero-dep single-file script. Exits 1 on any failure for CI.
 */

import { enginesForTenant } from "../components/app/engines";
import { isFounderEmail } from "../lib/founders/auth";

let failures = 0;
function check(name: string, cond: boolean) {
  const tag = cond ? "PASS" : "FAIL";
  if (!cond) failures += 1;
  console.log(`  [${tag}] ${name}`);
}

const slugs = (role: Parameters<typeof enginesForTenant>[2]) =>
  new Set(enginesForTenant("lighting", { marketing: true }, role).map((e) => e.slug));

console.log("RBAC gate — enginesForTenant ownerOnly filter");

// Felipe = admin → NO api / integrations, but KEEPS normal CRM tools.
const admin = slugs("admin");
check("admin: NO 'api' tab", !admin.has("api"));
check("admin: NO 'integrations' tab", !admin.has("integrations"));
check("admin: keeps 'customers'", admin.has("customers"));
check("admin: keeps 'leads'", admin.has("leads"));
check("admin: keeps 'quotes'", admin.has("quotes"));
check("admin: keeps 'crew'", admin.has("crew"));

// Founder impersonating (role resolves to owner) → sees everything.
const owner = slugs("owner");
check("owner: HAS 'api' tab", owner.has("api"));
check("owner: HAS 'integrations' tab", owner.has("integrations"));

// Demo / founders shell (role=null) → full list, nothing gated.
const nul = slugs(null);
check("null(role): HAS 'api' tab", nul.has("api"));
check("null(role): HAS 'integrations' tab", nul.has("integrations"));

// Other non-owner roles also blocked.
for (const r of ["viewer", "operator"] as const) {
  const s = slugs(r);
  check(`${r}: NO 'api' tab`, !s.has("api"));
  check(`${r}: NO 'integrations' tab`, !s.has("integrations"));
}

console.log("Founder identity — isFounderEmail (Founders Portal door + god-mode)");
check("Ricardo IS founder", isFounderEmail("ricardo.gamon99@icloud.com"));
check("Josh IS founder", isFounderEmail("joshuapyorke@gmail.com"));
check("Ricardo IS founder (case-insensitive)", isFounderEmail("Ricardo.Gamon99@iCloud.com"));
check("Felipe is NOT a founder", !isFounderEmail("fe.brightlights@gmail.com"));
check("random tenant owner is NOT a founder", !isFounderEmail("owner@somecrew.com"));

console.log(
  failures === 0
    ? "\nALL RBAC GATE CHECKS PASSED"
    : `\n${failures} RBAC GATE CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
