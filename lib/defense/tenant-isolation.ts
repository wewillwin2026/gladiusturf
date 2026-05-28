// ---------------------------------------------------------------------------
// GladiusSentinel — Tenant-Isolation Invariant Scanner (gladiusturf.com)
// ---------------------------------------------------------------------------
// gladiusturf.com is one of the most multi-tenant verticals in the
// ecosystem. Every row in tenant tables (customers, schedule_items,
// invoices, leads, audit_log, etc.) is keyed by `tenant_id`. A route that
// reads or writes any of these tables WITHOUT a `tenant_id` filter is a P0
// data leak — that's exactly the regression class this scanner is built
// for.
//
// We audit every `route.ts` under `app/api/**` and report routes that
// reference a tenant-scoped table without referencing `tenant_id` (or its
// aliases) anywhere in the same file.
//
// Allowlist:
//   * /api/cron/**          — cross-tenant by design (system actor).
//   * /api/founders/**      — founder-only, cross-tenant scope.
//   * /api/stripe/webhook   — external webhook; resolves tenant from
//                              Stripe metadata after signature verify.
//   * /api/integrations/webhooks/** — same; resolves tenant from token.
//   * /api/marketing/track  — anonymous public ingest.
//   * /api/track            — same.
//   * /api/waitlist         — pre-tenant signup form.
//   * /api/demo             — pre-tenant demo request.
//   * /api/contract/**      — pre-tenant contract acceptance via signed token.
//   * /api/vertical/lead    — public vertical lead ingest.
//   * /api/close/[token]    — token-scoped, pre-auth.
//
// The auditor is static — it does not run the routes. Only false-negatives
// are dangerous; false-positives just mean a route legitimately uses some
// other scoping mechanism (e.g. a signed token). The founders page surfaces
// the findings; the founder triages.
// ---------------------------------------------------------------------------

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const API_ROOT = "app/api";

const TENANT_TABLES = [
  "customers",
  "schedule_items",
  "leads",
  "invoices",
  "deals",
  "messages",
  "audit_log",
  "automations",
  "campaigns",
  "tasks",
  "equipment",
  "chemicals",
  "crew_timesheets",
  "voltage_tests",
  "transparency_events",
  "tenant_user_secrets",
  "tenant_invitations",
  "owner_daily_briefings",
];

const ALLOWLIST_GLOBS = [
  "app/api/cron/**",
  "app/api/founders/**",
  "app/api/stripe/webhook/**",
  "app/api/integrations/webhooks/**",
  "app/api/marketing/track/**",
  "app/api/track/**",
  "app/api/waitlist/**",
  "app/api/demo/**",
  "app/api/contract/**",
  "app/api/vertical/lead/**",
  "app/api/close/**",
  "app/api/app/auth/**",
];

export interface IsolationFinding {
  file: string;
  tables: string[];
  expectedScopeKey: string;
  scopingDetected: boolean;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function globToRegExp(glob: string): RegExp {
  let i = 0;
  let out = "^";
  while (i < glob.length) {
    const c = glob[i]!;
    if (c === "*") {
      if (glob[i + 1] === "*") {
        if (glob[i + 2] === "/") {
          out += "(?:.*/)?";
          i += 3;
        } else {
          out += ".*";
          i += 2;
        }
      } else {
        out += "[^/]*";
        i++;
      }
    } else if (/[.+^$()|\\]/.test(c)) {
      out += "\\" + c;
      i++;
    } else {
      out += c;
      i++;
    }
  }
  out += "$";
  return new RegExp(out);
}

function isAllowlisted(file: string): boolean {
  const norm = file.replace(/\\/g, "/");
  for (const g of ALLOWLIST_GLOBS) {
    if (globToRegExp(g).test(norm)) return true;
  }
  return false;
}

async function listRouteFiles(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      const full = path.join(dir, name);
      let s;
      try {
        s = await stat(full);
      } catch {
        continue;
      }
      if (s.isDirectory()) {
        await walk(full);
      } else if (
        s.isFile() &&
        (name === "route.ts" || name === "route.tsx")
      ) {
        out.push(full);
      }
    }
  }
  await walk(root);
  return out;
}

/**
 * Audit every route under `app/api/**` and report which ones touch a
 * tenant-scoped table without referencing `tenant_id` (or an alias).
 *
 * Accepted scoping signals (any one is enough to clear the route):
 *   - `tenant_id` / `tenantId`
 *   - `.eq("tenant_id", ...)`
 *   - destructured `tenant.id` / `t.id` from a tenant lookup
 *   - call to a known auth helper that injects tenant (`authTenant`,
 *     `getTenant`, `requireTenant`, `tenantSession`).
 */
export async function auditTenantIsolation(opts?: {
  apiRoot?: string;
}): Promise<IsolationFinding[]> {
  const routes = await listRouteFiles(opts?.apiRoot ?? API_ROOT);
  const findings: IsolationFinding[] = [];

  for (const file of routes) {
    if (isAllowlisted(file)) continue;
    let src: string;
    try {
      src = await readFile(file, "utf8");
    } catch {
      continue;
    }

    const hits: string[] = [];
    for (const t of TENANT_TABLES) {
      const re = new RegExp(
        `\\.from\\(\\s*["'\`]${escapeRegex(t)}["'\`]\\s*\\)`,
      );
      if (re.test(src)) hits.push(t);
    }
    if (hits.length === 0) continue;

    const hasTenantId =
      /\btenant_id\b/.test(src) ||
      /\btenantId\b/.test(src) ||
      /\btenant\.id\b/.test(src) ||
      /authTenant|getTenant|requireTenant|tenantSession/.test(src);

    findings.push({
      file: file.replace(/\\/g, "/"),
      tables: hits,
      expectedScopeKey: "tenant_id",
      scopingDetected: hasTenantId,
    });
  }

  // Only surface routes where scoping is MISSING. (Findings where
  // scopingDetected=true are returned by callers that want the full
  // audit trail; the cron filters to scopingDetected=false.)
  return findings.filter((f) => !f.scopingDetected);
}

/** Full audit including allowlisted + clean routes — for the founders page. */
export async function auditTenantIsolationFull(opts?: {
  apiRoot?: string;
}): Promise<{
  totalRoutes: number;
  allowlisted: number;
  tenantRoutes: number;
  clean: number;
  findings: IsolationFinding[];
}> {
  const routes = await listRouteFiles(opts?.apiRoot ?? API_ROOT);
  let allowlisted = 0;
  let tenantRoutes = 0;
  let clean = 0;
  const findings: IsolationFinding[] = [];

  for (const file of routes) {
    if (isAllowlisted(file)) {
      allowlisted++;
      continue;
    }
    let src: string;
    try {
      src = await readFile(file, "utf8");
    } catch {
      continue;
    }
    const hits: string[] = [];
    for (const t of TENANT_TABLES) {
      const re = new RegExp(
        `\\.from\\(\\s*["'\`]${escapeRegex(t)}["'\`]\\s*\\)`,
      );
      if (re.test(src)) hits.push(t);
    }
    if (hits.length === 0) continue;
    tenantRoutes++;

    const hasTenantId =
      /\btenant_id\b/.test(src) ||
      /\btenantId\b/.test(src) ||
      /\btenant\.id\b/.test(src) ||
      /authTenant|getTenant|requireTenant|tenantSession/.test(src);

    if (hasTenantId) clean++;
    else
      findings.push({
        file: file.replace(/\\/g, "/"),
        tables: hits,
        expectedScopeKey: "tenant_id",
        scopingDetected: false,
      });
  }
  return {
    totalRoutes: routes.length,
    allowlisted,
    tenantRoutes,
    clean,
    findings,
  };
}
