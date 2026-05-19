/**
 * RBAC gate covenant test (field-service preset model, 2026-05-19).
 *
 * Asserts the PURE decision functions that gate Felipe's CRM:
 *   Owner(owner)  Manager(admin)  Crew Lead(operator)  Field Tech(viewer)
 * + founder god-mode (api/integrations are FOUNDER-only, never any
 *   tenant role incl. owner). No server, no cookies, no production.
 * Run via:  npm run test:rbac   (also part of `npm test`).
 *
 * Zero-dep single-file script. Exits 1 on any failure for CI.
 */

import { enginesForTenant } from "../components/app/engines";
import { isAppPathAllowed } from "../lib/app/access";
import { isFounderEmail } from "../lib/founders/auth";
import type { TenantRole } from "../lib/app/tenant-auth";

let failures = 0;
function check(name: string, cond: boolean) {
  if (!cond) failures += 1;
  console.log(`  [${cond ? "PASS" : "FAIL"}] ${name}`);
}

const slugs = (role: TenantRole | null, isFounder = false) =>
  new Set(
    enginesForTenant("lighting", { marketing: true }, role, isFounder).map(
      (e) => e.slug,
    ),
  );

console.log("Owner (Felipe) — full shop, NEVER founder-only api/integrations");
const owner = slugs("owner");
for (const s of ["today", "customers", "leads", "quotes", "crew", "pricing", "invoices", "reports", "settings", "marketing"])
  check(`owner: has '${s}'`, owner.has(s));
check("owner: NO 'api' (founder-only)", !owner.has("api"));
check("owner: NO 'integrations' (founder-only)", !owner.has("integrations"));

console.log("Founder god-mode (owner role + isFounder) — sees everything");
const god = slugs("owner", true);
check("founder: HAS 'api'", god.has("api"));
check("founder: HAS 'integrations'", god.has("integrations"));
check("founder: HAS 'settings'", god.has("settings"));

console.log("Manager (admin) — money/reports yes, Settings/Team no");
const mgr = slugs("admin");
for (const s of ["customers", "quotes", "crew", "pricing", "invoices", "reports", "marketing"])
  check(`admin: has '${s}'`, mgr.has(s));
check("admin: NO 'settings' (owner-only)", !mgr.has("settings"));
check("admin: NO 'api'", !mgr.has("api"));
check("admin: NO 'integrations'", !mgr.has("integrations"));

console.log("Crew Lead (operator) — jobs/quotes yes, money/admin no");
const crew = slugs("operator");
for (const s of ["today", "customers", "leads", "quotes", "schedule", "jobs", "crew"])
  check(`operator: has '${s}'`, crew.has(s));
for (const s of ["pricing", "invoices", "reports", "analytics", "settings", "api", "integrations"])
  check(`operator: NO '${s}'`, !crew.has(s));

console.log("Field Tech (viewer) — their work, mostly read");
const tech = slugs("viewer");
for (const s of ["today", "customers", "leads", "schedule", "jobs", "routes", "inventory"])
  check(`viewer: has '${s}'`, tech.has(s));
for (const s of ["quotes", "crew", "pricing", "invoices", "reports", "settings", "api", "integrations"])
  check(`viewer: NO '${s}'`, !tech.has(s));

console.log("Server-side deep-link guard — isAppPathAllowed (the real fix)");
// A restricted worker typing the URL directly must be bounced.
check("viewer BLOCKED from /app/invoices", !isAppPathAllowed("/app/invoices", "viewer", false));
check("viewer BLOCKED from /app/reports", !isAppPathAllowed("/app/reports", "viewer", false));
check("viewer BLOCKED from /app/settings", !isAppPathAllowed("/app/settings", "viewer", false));
check("viewer BLOCKED from /app/inbox", !isAppPathAllowed("/app/inbox", "viewer", false));
check("operator BLOCKED from /app/invoices", !isAppPathAllowed("/app/invoices", "operator", false));
check("operator BLOCKED from /app/settings", !isAppPathAllowed("/app/settings", "operator", false));
check("admin BLOCKED from /app/settings (owner-only)", !isAppPathAllowed("/app/settings", "admin", false));
check("admin ALLOWED /app/invoices", isAppPathAllowed("/app/invoices", "admin", false));
check("owner(Felipe) ALLOWED /app/settings", isAppPathAllowed("/app/settings", "owner", false));
check("owner(Felipe) BLOCKED /app/api (founder-only)", !isAppPathAllowed("/app/api", "owner", false));
check("founder god-mode ALLOWED /app/api", isAppPathAllowed("/app/api", "owner", true));
check("viewer ALLOWED /app (dashboard) — no redirect loop", isAppPathAllowed("/app", "viewer", false));
check("viewer ALLOWED /app/customers/new (sub-path)", isAppPathAllowed("/app/customers/new", "viewer", false));
check("viewer ALLOWED /app/account/security (non-engine)", isAppPathAllowed("/app/account/security", "viewer", false));
check("demo(null) ALLOWED everything", isAppPathAllowed("/app/invoices", null, false));

console.log("Founder identity — isFounderEmail (door + god-mode)");
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
