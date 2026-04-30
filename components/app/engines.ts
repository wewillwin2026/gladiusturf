// The 33 sidebar engines, grouped per the master spec.
// Both /app and /founders/war-room render this same structure.

import {
  Activity,
  BarChart3,
  Bot,
  Building2,
  Calendar,
  ClipboardList,
  Cog,
  Database,
  DollarSign,
  Eye,
  FileText,
  FlaskConical,
  Gauge,
  GitFork,
  Globe2,
  Inbox,
  Key,
  LayoutDashboard,
  Map,
  MessageSquare,
  Newspaper,
  PenSquare,
  Plug,
  Receipt,
  Repeat,
  Route,
  Sparkles,
  Star,
  Tag,
  Timer,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type EngineGroup =
  | "overview"
  | "sales"
  | "ops"
  | "money"
  | "intel"
  | "platform";

export type Engine = {
  slug: string;
  name: string;
  group: EngineGroup;
  icon: LucideIcon;
  /** Roman ordinal for the build watermark / changelog references. */
  ordinal?: number;
};

export const ENGINE_GROUPS: { id: EngineGroup; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "sales", label: "Customers & Sales" },
  { id: "ops", label: "Ops" },
  { id: "money", label: "Money" },
  { id: "intel", label: "Intelligence" },
  { id: "platform", label: "Platform" },
];

export const ENGINES: Engine[] = [
  // Overview (1)
  { slug: "today", name: "Today", group: "overview", icon: LayoutDashboard, ordinal: 1 },

  // Customers & Sales (8)
  { slug: "customers", name: "Customers", group: "sales", icon: Users, ordinal: 2 },
  { slug: "quotes", name: "Quotes", group: "sales", icon: PenSquare, ordinal: 4 },
  { slug: "quotes/new", name: "AI Quote Drafter", group: "sales", icon: Sparkles, ordinal: 5 },
  { slug: "reviews", name: "Reviews", group: "sales", icon: Star, ordinal: 6 },
  { slug: "referrals", name: "Referrals", group: "sales", icon: GitFork, ordinal: 7 },
  { slug: "campaigns", name: "Campaigns", group: "sales", icon: Newspaper, ordinal: 8 },
  { slug: "pricing", name: "Pricing tables", group: "sales", icon: Tag, ordinal: 9 },

  // Ops (8)
  { slug: "schedule", name: "Schedule", group: "ops", icon: Calendar, ordinal: 10 },
  { slug: "jobs", name: "Jobs", group: "ops", icon: ClipboardList, ordinal: 11 },
  { slug: "routes", name: "Routes", group: "ops", icon: Route, ordinal: 13 },
  { slug: "territory", name: "Territory", group: "ops", icon: Map, ordinal: 14 },
  { slug: "crew", name: "Crew", group: "ops", icon: Building2, ordinal: 15 },
  { slug: "equipment", name: "Equipment", group: "ops", icon: Truck, ordinal: 16 },
  { slug: "chemicals", name: "Chemicals", group: "ops", icon: FlaskConical, ordinal: 17 },

  // Money (4)
  { slug: "invoices", name: "Invoices", group: "money", icon: Receipt, ordinal: 18 },
  { slug: "timesheets", name: "Timesheets", group: "money", icon: Timer, ordinal: 20 },
  { slug: "payroll", name: "Payroll", group: "money", icon: Wallet, ordinal: 21 },

  // Intelligence (5)
  { slug: "inbox", name: "Inbox", group: "intel", icon: Inbox, ordinal: 22 },
  { slug: "reports", name: "Reports", group: "intel", icon: BarChart3, ordinal: 23 },
  { slug: "analytics", name: "Analytics", group: "intel", icon: TrendingUp, ordinal: 24 },
  { slug: "automations", name: "Automations", group: "intel", icon: Repeat, ordinal: 25 },
  { slug: "ask-gladius", name: "Ask Gladius", group: "intel", icon: Bot, ordinal: 26 },

  // Platform (7)
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
] as const;

export type ProductKind = "demo" | "founders";

export function basePathFor(product: ProductKind): string {
  return product === "demo" ? "/app" : "/founders/war-room";
}

export function hrefForEngine(product: ProductKind, slug: string): string {
  // "today" is the index page of each product, not a sub-route.
  if (slug === "today") return basePathFor(product);
  return `${basePathFor(product)}/${slug}`;
}
