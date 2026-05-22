/**
 * Tenant RBAC — the single source of truth for "what can this role see".
 *
 * Field-service preset model (confirmed with the founder 2026-05-19),
 * mapped onto the existing 4-value TenantRole enum so nothing else has
 * to change:
 *
 *   Preset        TenantRole   Persona
 *   ───────────────────────────────────────────────────────────────
 *   Owner         owner        Felipe — runs the shop, full access
 *   Manager       admin        Office/ops — everything except Team/Settings
 *   Crew Lead     operator     Leads a crew — jobs/customers/quotes, no $/admin
 *   Field Tech    viewer       On a truck — sees their work, mostly read
 *
 * Two independent gates:
 *   1. FOUNDER_ONLY engines (api, integrations) — visible ONLY to a
 *      founder (Ricardo/Josh), regardless of tenant role. A tenant
 *      "owner" (Felipe) is NOT a founder and never sees these.
 *   2. ENGINE_MIN_ROLE — the minimum tenant role rank to see an engine.
 *
 * The demo/founders shells pass role = null and bypass both (they show
 * the full list for sales walkthroughs / are gated elsewhere).
 */

import type { TenantRole } from "@/lib/app/tenant-auth";

/** Higher rank = more access. */
export const ROLE_RANK: Record<TenantRole, number> = {
  viewer: 1,
  operator: 2,
  admin: 3,
  owner: 4,
};

/**
 * Engines only a founder may see/reach. Combines:
 *   1. Hidden from the /app sidebar entirely (TENANT_HIDDEN_SLUGS filter
 *      in enginesForTenant — even founders impersonating don't see them
 *      in the tenant nav, since they live on /founders/war-room).
 *   2. Blocked at the layout level for non-founders via isAppPathAllowed
 *      → canAccessEngine → FOUNDER_ONLY_ENGINES check. A tenant typing
 *      /app/analytics in the URL bar gets redirected to /app.
 * Founders themselves can still reach these URLs directly when needed.
 *
 * Founder ask 2026-05-22: "Bright Lights doesn't need to see any of
 * that — just us in the founders page."
 */
export const FOUNDER_ONLY_ENGINES = new Set<string>([
  "api",
  "integrations",
  "analytics",
  "trust",
  "changelog",
]);

/** Sidebar-only filter — same set today, kept as a separate name for
 *  forward flexibility (if we ever want something HIDDEN-but-tenant-
 *  reachable or FOUNDER-only-but-shown-in-sidebar). */
export const TENANT_HIDDEN_SLUGS = FOUNDER_ONLY_ENGINES;

/**
 * Minimum tenant role to SEE an engine in the sidebar / reach its page.
 * Slugs match components/app/engines.ts. Anything not listed defaults
 * to "operator" (a sane middle — never silently expose money/admin).
 */
export const ENGINE_MIN_ROLE: Record<string, TenantRole> = {
  // Everyone (Field Tech +)
  today: "viewer",
  leads: "viewer",
  customers: "viewer",
  schedule: "viewer",
  jobs: "viewer",
  routes: "viewer",
  territory: "viewer",
  inventory: "viewer",
  changelog: "viewer",

  // Crew Lead + (operator)
  quotes: "operator",
  "quotes/new": "operator",
  crew: "operator",
  equipment: "operator",

  // Manager + (admin) — money, comms, intelligence
  plans: "admin",
  pricing: "admin",
  invoices: "admin",
  timesheets: "admin",
  inbox: "admin",
  reviews: "admin",
  referrals: "admin",
  campaigns: "admin",
  automations: "admin",
  "ask-gladius": "admin",
  reports: "admin",
  analytics: "admin",
  marketing: "admin",
  trust: "admin",

  // Owner only (Felipe) — shop config + team management
  settings: "owner",
};

/**
 * Can a user with `role` (+ founder flag) see/reach `slug`?
 * `role === null` means the demo/founders shell → full access.
 */
export function canAccessEngine(
  role: TenantRole | null,
  isFounder: boolean,
  slug: string,
): boolean {
  if (FOUNDER_ONLY_ENGINES.has(slug)) return isFounder;
  if (role === null) return true; // demo / founders-full shell
  const min = ENGINE_MIN_ROLE[slug] ?? "operator";
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

/**
 * Every slug that is a GUARDED engine surface (role- or founder-gated).
 * A path whose first segment isn't here (e.g. /app/account/security,
 * /app/onboarding) is NOT an engine and is left alone — it has its own
 * logic and must stay reachable by every role.
 */
export const GUARDED_SLUGS: ReadonlySet<string> = new Set<string>([
  ...Object.keys(ENGINE_MIN_ROLE),
  ...FOUNDER_ONLY_ENGINES,
]);

/**
 * Map an /app pathname to its engine slug.
 *   "/app"               → "today"
 *   "/app/invoices"      → "invoices"
 *   "/app/customers/new" → "customers"
 * Returns null if the path isn't under /app.
 */
export function engineSlugFromAppPath(pathname: string): string | null {
  const m = pathname.replace(/[/]+$/, "").match(/^\/app(?:\/([^/?#]+))?/);
  if (!m) return null;
  return m[1] ?? "today";
}

/**
 * Server-side gate used by the (authed) layout so a restricted worker
 * cannot DEEP-LINK past a hidden sidebar item (e.g. typing
 * /app/invoices). Unknown/non-engine segments are allowed (they aren't
 * gated surfaces). role === null (demo) is always allowed.
 */
export function isAppPathAllowed(
  pathname: string,
  role: TenantRole | null,
  isFounder: boolean,
): boolean {
  const slug = engineSlugFromAppPath(pathname);
  if (!slug) return true;
  if (!GUARDED_SLUGS.has(slug)) return true;
  return canAccessEngine(role, isFounder, slug);
}

/** UI metadata for the Team management presets (owner picks one). */
export type RolePreset = {
  role: TenantRole;
  label: string;
  persona: string;
  blurb: string;
};

export const ROLE_PRESETS: RolePreset[] = [
  {
    role: "owner",
    label: "Owner",
    persona: "Runs the shop",
    blurb:
      "Full access — customers, quotes, money, reports, marketing, and team management.",
  },
  {
    role: "admin",
    label: "Manager",
    persona: "Office / operations",
    blurb:
      "Everything except Settings & Team. Sees money, reports, and the Loop.",
  },
  {
    role: "operator",
    label: "Crew Lead",
    persona: "Leads a crew",
    blurb:
      "Customers, quotes, schedule, jobs, crew & equipment. No invoices, pricing, reports, or settings.",
  },
  {
    role: "viewer",
    label: "Field Tech",
    persona: "On a truck",
    blurb:
      "Their schedule, jobs, routes, customer & inventory lookups. Mostly read-only.",
  },
];

export const ROLE_LABEL: Record<TenantRole, string> = {
  owner: "Owner",
  admin: "Manager",
  operator: "Crew Lead",
  viewer: "Field Tech",
};
