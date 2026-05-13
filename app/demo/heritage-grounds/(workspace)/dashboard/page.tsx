import Link from "next/link";
import { ArrowRight, ClipboardList, Sparkles, Users } from "lucide-react";
import {
  ACTIVITY,
  BRAND,
  KPIS,
  PROJECTS,
  STAGE_LABEL,
} from "@/lib/demo-data/heritage-grounds";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  if (cents >= 1_000_000) return `$${(cents / 100_000_000).toFixed(2)}M`;
  if (cents >= 100_000) return `$${Math.round(cents / 100_000).toLocaleString()}K`;
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

const KIND_COLOR: Record<(typeof ACTIVITY)[number]["kind"], string> = {
  project: "var(--hg-info)",
  review: "var(--hg-accent)",
  lead: "var(--hg-accent)",
  payment: "var(--hg-success)",
  alert: "var(--hg-alert)",
};

export default function DashboardPage() {
  const inFlight = PROJECTS.filter((p) =>
    ["scheduled", "in_install", "walkthrough", "punch_list"].includes(p.stage),
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <span className="hg-eyebrow-muted">Today · Bradenton studio</span>
        <h1
          className="hg-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--hg-text)" }}
        >
          Welcome back, {BRAND.founder.split(" ")[0]}.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--hg-text-muted)" }}>
          {BRAND.serviceArea} · {BRAND.reviewCount} reviews · {BRAND.reviewStars} ★
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Active projects" value={String(KPIS.activeProjects)} />
        <Kpi label="In install" value={String(KPIS.inInstall)} />
        <Kpi label="Backlog value" value={money(KPIS.backlogValue)} />
        <Kpi
          label="Avg margin"
          value={`${KPIS.marginAvgPct}%`}
          accent="var(--hg-success)"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="hg-card flex flex-col gap-3 p-5 lg:col-span-2">
          <header className="flex items-center justify-between">
            <span className="hg-eyebrow">Projects in flight</span>
            <Link
              href="/demo/heritage-grounds/projects"
              className="text-[11px]"
              style={{ color: "var(--hg-accent)" }}
            >
              See all →
            </Link>
          </header>
          <ul className="flex flex-col gap-2">
            {inFlight.slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-1 gap-2 rounded-md px-3 py-2 md:grid-cols-[minmax(0,2fr)_auto_auto] md:items-center md:gap-3"
                style={{ background: "rgba(0,0,0,0.18)" }}
              >
                <div className="min-w-0">
                  <div className="text-[13px]" style={{ color: "var(--hg-text)" }}>
                    {p.customerName}
                  </div>
                  <div
                    className="truncate text-[11px]"
                    style={{ color: "var(--hg-text-muted)" }}
                  >
                    {p.scope}
                  </div>
                </div>
                <span
                  className="hg-pill shrink-0"
                  style={{
                    color: "var(--hg-accent)",
                    background: "rgba(217,131,106,0.08)",
                    borderColor: "rgba(217,131,106,0.30)",
                  }}
                >
                  {STAGE_LABEL[p.stage]}
                </span>
                <span
                  className="hg-mono text-right text-[12px]"
                  style={{ color: "var(--hg-text)" }}
                >
                  {money(p.contractedCents)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hg-card flex flex-col gap-3 p-5">
          <span className="hg-eyebrow">Activity</span>
          <ul className="flex flex-col gap-3">
            {ACTIVITY.map((a) => (
              <li key={a.id} className="flex items-start gap-2.5">
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: KIND_COLOR[a.kind] }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[12px] leading-[1.45]"
                    style={{ color: "var(--hg-text-muted)" }}
                  >
                    {a.text}
                  </p>
                  <p
                    className="mt-0.5 text-[10px]"
                    style={{ color: "var(--hg-text-faint)" }}
                  >
                    {a.at}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          href="/demo/heritage-grounds/projects"
          icon={ClipboardList}
          label="Project board"
          sub={`${KPIS.activeProjects} active · stages live`}
        />
        <QuickLink
          href="/demo/heritage-grounds/customers"
          icon={Users}
          label="Customers"
          sub="11 properties across 3 metros"
        />
        <QuickLink
          href="/demo/heritage-grounds/settings"
          icon={Sparkles}
          label="Studio setup"
          sub="Designers · billing · integrations"
        />
      </section>

      <p
        className="text-[11px] leading-relaxed"
        style={{ color: "var(--hg-text-faint)" }}
      >
        Sales demo. All project data is fictional. The real workspace ships
        within 48 hours of signing — your data migrated by founders.
      </p>
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="hg-card flex flex-col gap-1 p-5">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--hg-text-faint)" }}
      >
        {label}
      </span>
      <span
        className="hg-serif text-[26px] leading-tight"
        style={{ color: accent ?? "var(--hg-text)" }}
      >
        {value}
      </span>
    </div>
  );
}

type LucideLikeIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

function QuickLink({
  href,
  icon: Icon,
  label,
  sub,
}: {
  href: string;
  icon: LucideLikeIcon;
  label: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="hg-card flex items-center gap-3 p-4 transition-colors"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          background: "rgba(217,131,106,0.14)",
          border: "1px solid rgba(217,131,106,0.45)",
        }}
      >
        <Icon className="h-4 w-4" style={{ color: "var(--hg-accent)" }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px]" style={{ color: "var(--hg-text)" }}>
          {label}
        </div>
        <div
          className="text-[11px]"
          style={{ color: "var(--hg-text-muted)" }}
        >
          {sub}
        </div>
      </div>
      <ArrowRight className="h-3.5 w-3.5" style={{ color: "var(--hg-text-faint)" }} />
    </Link>
  );
}
