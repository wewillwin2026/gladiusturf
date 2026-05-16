import Link from "next/link";
import {
  Globe,
  Lightbulb,
  Leaf,
  Car,
  PhoneCall,
  Hammer,
  Search,
  Eye,
  ExternalLink,
  Shield,
  Database,
  Server,
  GitBranch,
  Mail,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// ─── Data fetching ────────────────────────────────────────────────────────────

type CommandData = {
  demoTotal: number;
  demoToday: number;
  demoThisWeek: number;
  visitorsLast7: number;
  visitorsTotal: number;
  activeTenants: number;
};

async function loadCommandData(): Promise<CommandData> {
  const zero: CommandData = {
    demoTotal: 0,
    demoToday: 0,
    demoThisWeek: 0,
    visitorsLast7: 0,
    visitorsTotal: 0,
    activeTenants: 0,
  };

  try {
    const sb = supabaseAdmin();
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();
    const weekAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [demoAllRes, demoTodayRes, demoWeekRes, visitorAllRes, visitorWeekRes, tenantRes] =
      await Promise.all([
        sb.from("demo_requests").select("id", { count: "exact", head: true }),
        sb
          .from("demo_requests")
          .select("id", { count: "exact", head: true })
          .gte("created_at", todayStart),
        sb
          .from("demo_requests")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekAgo),
        sb.from("visitors").select("id", { count: "exact", head: true }),
        sb
          .from("visitors")
          .select("id", { count: "exact", head: true })
          .gte("last_seen_at", weekAgo),
        sb
          .from("tenants")
          .select("id", { count: "exact", head: true })
          .eq("active", true),
      ]);

    return {
      demoTotal: demoAllRes.count ?? 0,
      demoToday: demoTodayRes.count ?? 0,
      demoThisWeek: demoWeekRes.count ?? 0,
      visitorsTotal: visitorAllRes.count ?? 0,
      visitorsLast7: visitorWeekRes.count ?? 0,
      activeTenants: tenantRes.count ?? 0,
    };
  } catch {
    return zero;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductLink =
  | { kind: "external"; href: string; label: string; note?: string }
  | { kind: "internal"; href: string; label: string };

type Product = {
  name: string;
  icon: React.ReactNode;
  tone: Tone;
  statusLabel: string;
  description: string;
  links: ProductLink[];
};

// ─── Product definitions ──────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    name: "GladiusTurf",
    icon: <Globe className="h-4 w-4 text-g-accent" />,
    tone: "success",
    statusLabel: "Live",
    description:
      "Landscaping SaaS. Lawn, irrigation, outdoor services. Per-crew pricing. Bright Lights is first paying customer.",
    links: [
      { kind: "external", href: "https://gladiusturf.com", label: "gladiusturf.com" },
      { kind: "internal", href: "/founders/war-room", label: "War Room" },
      { kind: "internal", href: "/founders/war-room/demo-pipeline", label: "Pipeline" },
    ],
  },
  {
    name: "Gladius Lighting",
    icon: <Lightbulb className="h-4 w-4 text-g-warning" />,
    tone: "success",
    statusLabel: "Live",
    description:
      "Landscape lighting vertical. Per-fixture warranty, transformer math, bilingual flow, Storm Response Mode.",
    links: [
      {
        kind: "external",
        href: "https://gladiusturf.com/lighting",
        label: "gladiusturf.com/lighting",
      },
    ],
  },
  {
    name: "Gladius Landscaping",
    icon: <Leaf className="h-4 w-4 text-g-success" />,
    tone: "info",
    statusLabel: "Building",
    description:
      "Dedicated vertical landing for lawn maintenance and mowing companies. In progress.",
    links: [
      {
        kind: "external",
        href: "https://gladiusturf.com/landscaping",
        label: "gladiusturf.com/landscaping",
      },
    ],
  },
  {
    name: "Gladius CRM",
    icon: <Car className="h-4 w-4 text-g-accent" />,
    tone: "success",
    statusLabel: "Live",
    description:
      "Automotive dealership CRM. Intercept, Desking, Inventory, Marketplace, Rep Passport. Founders portal + tenant shell.",
    links: [
      {
        kind: "external",
        href: "https://gladiuscrm.com",
        label: "gladiuscrm.com",
        note: "Use Clerk login",
      },
    ],
  },
  {
    name: "GladiusBDC",
    icon: <PhoneCall className="h-4 w-4 text-g-info" />,
    tone: "success",
    statusLabel: "Live",
    description:
      "Standalone BDC product for automotive. Call tracking, cadences, AI response. gladiusbdc.com.",
    links: [
      { kind: "external", href: "https://gladiusbdc.com", label: "gladiusbdc.com" },
    ],
  },
  {
    name: "GladiusStone",
    icon: <Hammer className="h-4 w-4 text-g-text-muted" />,
    tone: "info",
    statusLabel: "Building",
    description:
      "Stone fabrication SaaS. Slab Intercept, Tier Whisperer, Referral Radar. AI nesting, accounting, field PWA. gladiusstone.com.",
    links: [
      {
        kind: "external",
        href: "https://gladiusstone.com",
        label: "gladiusstone.com",
      },
    ],
  },
  {
    name: "GoFetch / GladiusAuto",
    icon: <Search className="h-4 w-4 text-g-warning" />,
    tone: "warning",
    statusLabel: "Paused",
    description:
      "Consumer car-finding marketplace. Ad spend paused. Pivoting to GladiusEye seller flow + CRM marketplace.",
    links: [
      {
        kind: "external",
        href: "https://gofetchauto.com",
        label: "gofetchauto.com",
      },
    ],
  },
  {
    name: "GladiusEye",
    icon: <Eye className="h-4 w-4 text-g-text-faint" />,
    tone: "neutral",
    statusLabel: "Planned",
    description:
      "AI vision damage scan for seller-disclosed inspections. GladiusEye + marketplace bridge. Concept stage.",
    links: [],
  },
];

// ─── Infrastructure links ─────────────────────────────────────────────────────

type InfraLink = {
  label: string;
  sublabel: string;
  href: string;
  icon: React.ReactNode;
  external: boolean;
};

const INFRA_LINKS: InfraLink[] = [
  {
    label: "Supabase Dashboard",
    sublabel: "Database, auth, migrations",
    href: "https://supabase.com/dashboard/project/dkghawpyolcyarjyihkp",
    icon: <Database className="h-4 w-4 text-g-accent" />,
    external: true,
  },
  {
    label: "Vercel Dashboard",
    sublabel: "Deployments, env vars, logs",
    href: "https://vercel.com/gladius-xxx-wewillwin2026",
    icon: <Server className="h-4 w-4 text-g-text-muted" />,
    external: true,
  },
  {
    label: "GitHub",
    sublabel: "All repos",
    href: "https://github.com/wewillwin2026",
    icon: <GitBranch className="h-4 w-4 text-g-text-muted" />,
    external: true,
  },
  {
    label: "Resend",
    sublabel: "Email delivery, API keys",
    href: "https://resend.com",
    icon: <Mail className="h-4 w-4 text-g-text-muted" />,
    external: true,
  },
  {
    label: "Plausible",
    sublabel: "Marketing analytics",
    href: "https://plausible.io",
    icon: <BarChart3 className="h-4 w-4 text-g-text-muted" />,
    external: true,
  },
  {
    label: "War Room Pipeline",
    sublabel: "Demo bookings, status updates",
    href: "/founders/war-room/demo-pipeline",
    icon: <ArrowRight className="h-4 w-4 text-g-accent" />,
    external: false,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CommandCenterPage() {
  const data = await loadCommandData();
  const smsMode = !!(process.env.GLADIUS_FOUNDER_PHONES?.trim());

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <PageHeader
        eyebrow="Founders"
        title="Command Center"
        subtitle="Live status across all GladiusTurf products and external systems."
      />

      {/* Section 1 — GladiusTurf KPIs */}
      <section className="flex flex-col gap-3">
        <SectionLabel>GladiusTurf · Live Metrics</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            label="Demo requests · total"
            value={String(data.demoTotal)}
            delta={data.demoToday > 0 ? `+${data.demoToday} today` : "none today"}
            trend={data.demoToday > 0 ? "up" : "flat"}
          />
          <KPICard
            label="New this week"
            value={String(data.demoThisWeek)}
            delta={data.demoThisWeek > 0 ? "last 7 days" : "—"}
            trend={data.demoThisWeek > 0 ? "up" : "flat"}
          />
          <KPICard
            label="Visitors · 7 days"
            value={String(data.visitorsLast7)}
            delta={data.visitorsTotal > 0 ? `${data.visitorsTotal} all time` : "—"}
            trend={data.visitorsLast7 > 0 ? "up" : "flat"}
          />
          <KPICard
            label="Active tenants"
            value={String(data.activeTenants)}
            delta={data.activeTenants > 0 ? "live accounts" : "—"}
            trend={data.activeTenants > 0 ? "up" : "flat"}
          />
        </div>
      </section>

      {/* Section 2 — Product Network */}
      <section className="flex flex-col gap-3">
        <SectionLabel>Your product network</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </section>

      {/* Section 3 — Infrastructure */}
      <section className="flex flex-col gap-3">
        <SectionLabel>Infrastructure</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INFRA_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="g-card p-4 flex items-center gap-3 hover:border-g-accent/40 transition-colors"
              >
                {link.icon}
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-g-text">{link.label}</div>
                  <div className="text-[11px] text-g-text-muted">{link.sublabel}</div>
                </div>
                <ExternalLink className="ml-auto h-3.5 w-3.5 text-g-text-faint shrink-0" />
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="g-card p-4 flex items-center gap-3 hover:border-g-accent/40 transition-colors"
              >
                {link.icon}
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-g-text">{link.label}</div>
                  <div className="text-[11px] text-g-text-muted">{link.sublabel}</div>
                </div>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-g-text-faint shrink-0" />
              </Link>
            ),
          )}
        </div>
      </section>

      {/* Section 4 — Founders portal access */}
      <section>
        <div className="g-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-g-accent" />
            <span className="text-[14px] font-semibold text-g-text">
              Founders Portal Access
            </span>
            <StatusPill tone={smsMode ? "info" : "neutral"}>
              {smsMode ? "SMS MFA" : "TOTP MFA"}
            </StatusPill>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Row label="Ricardo" value="ricardo.gamon99@icloud.com" />
              <Row label="Joshua" value="joshuapyorke@gmail.com" />
              <Row
                label="Login URL"
                value={
                  <a
                    href="https://gladiusturf.com/founders/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-g-accent hover:underline inline-flex items-center gap-1"
                  >
                    gladiusturf.com/founders/login
                    <ExternalLink className="h-3 w-3" />
                  </a>
                }
              />
            </div>
            <div className="rounded-md border border-g-border-subtle bg-g-surface-2 p-3">
              <p className="text-[12px] leading-[1.6] text-g-text-muted">
                Magic link &rarr; MFA &rarr; 7-day session. Both emails are hardcoded as
                authorized founders. MFA mode is controlled by the{" "}
                <code className="text-[11px] text-g-text-faint bg-g-surface px-1 py-0.5 rounded">
                  GLADIUS_FOUNDER_PHONES
                </code>{" "}
                environment variable.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
      {children}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="g-card p-5 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {product.icon}
          <span className="text-[13px] font-semibold text-g-text truncate">
            {product.name}
          </span>
        </div>
        <StatusPill tone={product.tone}>{product.statusLabel}</StatusPill>
      </div>

      {/* Description */}
      <p className="text-[12px] leading-[1.55] text-g-text-muted">
        {product.description}
      </p>

      {/* Links */}
      <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-g-border-subtle">
        {product.links.length === 0 ? (
          <span className="text-[11px] text-g-text-faint italic">(in design)</span>
        ) : (
          product.links.map((link) =>
            link.kind === "external" ? (
              <span key={link.href} className="inline-flex items-center gap-1">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-g-accent hover:underline"
                >
                  {link.label}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
                {link.note && (
                  <span className="text-[10px] text-g-text-faint">({link.note})</span>
                )}
              </span>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1 text-[11px] text-g-text-muted hover:text-g-text transition-colors"
              >
                <ArrowRight className="h-2.5 w-2.5" />
                {link.label}
              </Link>
            ),
          )
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint w-16 shrink-0">
        {label}
      </span>
      <span className="text-[12px] text-g-text">{value}</span>
    </div>
  );
}
