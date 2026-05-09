// The sidebar engines, regrouped 2026-05-08 per the 7-director board's
// merge consensus (Strategy + Product + Engineering + AI + Trust + Buffett +
// Jobs).
//
// Old IA: Overview / Customers & Sales / Ops / Money / Intelligence / Platform.
// New IA: Today / Customers / Sell / Field / Money / Loop / Pulse / Platform.
//
// Engines kept their `slug` (URLs unchanged) — only their `group` field
// shifted. Three merges the board converged on:
//   * Sell  = Quotes + AI Quote Drafter + Plans + Pricing tables (one
//             "build the number" mental model, was Strategy/Product/
//             Engineering/AI/Buffett unanimous)
//   * Field = Schedule + Jobs + Routes + Territory + Crew + Equipment +
//             Inventory (one "operator's day" canvas)
//   * Loop  = Inbox + Reviews + Referrals + Campaigns + Automations +
//             Ask Gladius (one "voice of customer" room — every word a
//             customer says, plus AI guidance)
//
// Pulse (Reports + Analytics) stays separate from Loop — Reports/Analytics
// is metrics, not conversation. Trust Director also flagged that mixing
// audit/metrics with messaging blurs the audit chain.
//
// Chemicals + payroll remain hidden 2026-05-06 per board vote.

import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  Building2,
  Calendar,
  ClipboardList,
  Cog,
  Database,
  DollarSign,
  Eye,
  FileText,
  Gauge,
  GitFork,
  Globe2,
  Inbox,
  Key,
  LayoutDashboard,
  Lightbulb,
  Map,
  MessageSquare,
  Newspaper,
  PenSquare,
  Plug,
  Receipt,
  Repeat,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Timer,
  TrendingUp,
  Truck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type EngineGroup =
  | "overview"
  | "customers"
  | "sell"
  | "field"
  | "money"
  | "loop"
  | "pulse"
  | "platform";

export type Engine = {
  slug: string;
  name: string;
  group: EngineGroup;
  icon: LucideIcon;
  /** Roman ordinal for the build watermark / changelog references. */
  ordinal?: number;
  /**
   * Verticals where this engine is shown to tenants. Omit (or set to
   * undefined) to mean "all verticals." Use specific vertical slugs
   * (matching tenants.vertical) to gate. The demo workspace is
   * unaffected — it always shows everything for sales calls.
   *
   * Product Director's Day-1 ask: a lighting tenant should not see
   * 'Chemicals' in their sidebar; an irrigation tenant doesn't want
   * the Holiday Install surface; etc.
   */
  verticals?: string[];
};

export const ENGINE_GROUPS: { id: EngineGroup; label: string }[] = [
  { id: "overview", label: "Today" },
  { id: "customers", label: "Customers" },
  { id: "sell", label: "Sell" },
  { id: "field", label: "Field" },
  { id: "money", label: "Money" },
  { id: "loop", label: "Loop" },
  { id: "pulse", label: "Pulse" },
  { id: "platform", label: "Platform" },
];

export const ENGINES: Engine[] = [
  // Today (1)
  { slug: "today", name: "Today", group: "overview", icon: LayoutDashboard, ordinal: 1 },

  // Customers (1)
  { slug: "customers", name: "Customers", group: "customers", icon: Users, ordinal: 2 },

  // Sell (4) — was sales group; merged 2026-05-08
  { slug: "quotes", name: "Quotes", group: "sell", icon: PenSquare, ordinal: 4 },
  { slug: "quotes/new", name: "AI Quote Drafter", group: "sell", icon: Sparkles, ordinal: 5 },
  { slug: "plans", name: "Plans", group: "sell", icon: Repeat, ordinal: 8.5 },
  { slug: "pricing", name: "Pricing tables", group: "sell", icon: Tag, ordinal: 9 },

  // Field (7) — was ops; the operator's day canvas
  { slug: "schedule", name: "Schedule", group: "field", icon: Calendar, ordinal: 10 },
  { slug: "jobs", name: "Jobs", group: "field", icon: ClipboardList, ordinal: 11 },
  { slug: "routes", name: "Routes", group: "field", icon: Route, ordinal: 13 },
  { slug: "territory", name: "Territory", group: "field", icon: Map, ordinal: 14 },
  { slug: "crew", name: "Crew", group: "field", icon: Building2, ordinal: 15 },
  { slug: "equipment", name: "Equipment", group: "field", icon: Truck, ordinal: 16 },
  // Chemicals (ordinal 17) hidden 2026-05-06.
  { slug: "inventory", name: "Inventory", group: "field", icon: Boxes, ordinal: 17.5 },

  // Money (2)
  { slug: "invoices", name: "Invoices", group: "money", icon: Receipt, ordinal: 18 },
  { slug: "timesheets", name: "Timesheets", group: "money", icon: Timer, ordinal: 20 },
  // Payroll (ordinal 21) hidden 2026-05-06.

  // Loop (6) — voice-of-customer cluster, was intel; merged 2026-05-08
  { slug: "inbox", name: "Inbox", group: "loop", icon: Inbox, ordinal: 22 },
  { slug: "reviews", name: "Reviews", group: "loop", icon: Star, ordinal: 6 },
  { slug: "referrals", name: "Referrals", group: "loop", icon: GitFork, ordinal: 7 },
  { slug: "campaigns", name: "Campaigns", group: "loop", icon: Newspaper, ordinal: 8 },
  { slug: "automations", name: "Automations", group: "loop", icon: Repeat, ordinal: 25 },
  { slug: "ask-gladius", name: "Ask Gladius", group: "loop", icon: Bot, ordinal: 26 },

  // Pulse (3) — metrics + audit, kept separate from Loop conversations
  { slug: "reports", name: "Reports", group: "pulse", icon: BarChart3, ordinal: 23 },
  { slug: "analytics", name: "Analytics", group: "pulse", icon: TrendingUp, ordinal: 24 },
  // Trust Console — Trust Director's #1 board recommendation 2026-05-08.
  // Tenant-visible audit chain: AI runs, consent ledger, founder reads,
  // sub-processors. The "moat no incumbent will copy" engine.
  { slug: "trust", name: "Trust Console", group: "pulse", icon: ShieldCheck, ordinal: 23.5 },

  // Platform (4)
  { slug: "integrations", name: "Integrations", group: "platform", icon: Plug, ordinal: 27 },
  { slug: "api", name: "API", group: "platform", icon: Key, ordinal: 28 },
  { slug: "changelog", name: "Changelog", group: "platform", icon: FileText, ordinal: 29 },
  { slug: "settings", name: "Settings", group: "platform", icon: Cog, ordinal: 30 },
];

export const SECRET_TABS = [
  { slug: "secret", name: "Overview", icon: Eye },
  { slug: "secret/visits", name: "Visits", icon: Globe2 },
  { slug: "secret/funnel", name: "Funnel", icon: Activity },
  { slug: "secret/falloff", name: "Falloff", icon: Zap },
  { slug: "secret/attribution", name: "Attribution", icon: DollarSign },
  { slug: "secret/replays", name: "Replays", icon: MessageSquare },
  { slug: "secret/compare", name: "Compare", icon: Gauge },
  { slug: "demo-pipeline", name: "Demo Pipeline", icon: Database },
  { slug: "tenants", name: "Tenants", icon: Building2 },
  { slug: "vertical-leads", name: "Vertical Leads", icon: Lightbulb },
] as const;

export type ProductKind = "demo" | "tenant" | "founders";

export function basePathFor(product: ProductKind): string {
  if (product === "founders") return "/founders/war-room";
  // Both "demo" and "tenant" share /app — they differ only in data
  // source (seeded fictional vs real tenant tables) and badge label.
  return "/app";
}

export function hrefForEngine(product: ProductKind, slug: string): string {
  // "today" is the index page of each product, not a sub-route.
  if (slug === "today") return basePathFor(product);
  return `${basePathFor(product)}/${slug}`;
}

/**
 * Filter the engine list to those visible for a given tenant vertical.
 * Engines without a `verticals` array are visible everywhere. The demo
 * + founder shells should pass `null` (or skip this helper) to render
 * the full list; only the tenant-authed shell narrows the surface.
 */
export function enginesForVertical(vertical: string | null): Engine[] {
  if (!vertical) return ENGINES;
  return ENGINES.filter(
    (e) => !e.verticals || e.verticals.includes(vertical),
  );
}
