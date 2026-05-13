import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldCheck, TreePine, Users } from "lucide-react";
import {
  ACTIVITY,
  BRAND,
  CUSTOMERS,
  JOBS,
  KPIS,
  STAGE_LABEL,
} from "@/lib/demo-data/timbercare";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  if (cents >= 100_000_000) return `$${(cents / 100_000_000).toFixed(2)}M`;
  if (cents >= 100_000) return `$${Math.round(cents / 100_000).toLocaleString()}K`;
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

const KIND_COLOR: Record<(typeof ACTIVITY)[number]["kind"], string> = {
  job: "var(--tc-info)",
  review: "var(--tc-accent)",
  lead: "var(--tc-accent)",
  payment: "var(--tc-success)",
  alert: "var(--tc-warning)",
};

export default function DashboardPage() {
  const activeJobs = JOBS.filter(
    (j) => j.stage !== "billed" && j.stage !== "complete",
  ).slice(0, 5);

  const coiExpiringSoon = CUSTOMERS.filter(
    (c) =>
      c.coiOnFile &&
      c.coiExpiry &&
      new Date(c.coiExpiry).getTime() < Date.now() + 60 * 24 * 60 * 60 * 1000,
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <span className="tc-eyebrow-muted">Today · Sarasota yard</span>
        <h1 className="tc-serif text-[28px] leading-[1.1]" style={{ color: "var(--tc-text)" }}>
          Welcome back, {BRAND.founder.split(" ")[0]}.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--tc-text-muted)" }}>
          {BRAND.serviceArea} · {BRAND.reviewCount} reviews · {BRAND.reviewStars} ★
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Active jobs" value={String(KPIS.activeJobs)} />
        <Kpi label="In progress" value={String(KPIS.inProgress)} />
        <Kpi
          label="Backlog value"
          value={money(KPIS.contractedThisQuarter)}
        />
        <Kpi
          label="COI expiring (60d)"
          value={String(KPIS.coiExpiringSoon)}
          accent={KPIS.coiExpiringSoon > 0 ? "var(--tc-warning)" : "var(--tc-success)"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="tc-card flex flex-col gap-3 p-5 lg:col-span-2">
          <header className="flex items-center justify-between">
            <span className="tc-eyebrow">Active jobs</span>
            <Link
              href="/demo/timbercare/jobs"
              className="text-[11px]"
              style={{ color: "var(--tc-accent)" }}
            >
              See all →
            </Link>
          </header>
          <ul className="flex flex-col gap-2">
            {activeJobs.map((j) => (
              <li
                key={j.id}
                className="grid grid-cols-1 gap-2 rounded-md px-3 py-2 md:grid-cols-[1.5fr_auto_auto] md:items-center md:gap-3"
                style={{ background: "rgba(0,0,0,0.18)" }}
              >
                <div>
                  <div className="text-[13px]" style={{ color: "var(--tc-text)" }}>
                    {j.customerName}
                  </div>
                  <div
                    className="truncate text-[11px]"
                    style={{ color: "var(--tc-text-muted)" }}
                  >
                    {j.scope}
                  </div>
                </div>
                <span
                  className="tc-pill"
                  style={{
                    color: "var(--tc-accent)",
                    background: "rgba(180,138,75,0.08)",
                    borderColor: "rgba(180,138,75,0.30)",
                  }}
                >
                  {STAGE_LABEL[j.stage]}
                </span>
                <span
                  className="tc-mono text-right"
                  style={{ color: "var(--tc-text)" }}
                >
                  {money(j.contractedCents)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="tc-card flex flex-col gap-3 p-5">
          <span className="tc-eyebrow">Activity</span>
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
                    style={{ color: "var(--tc-text-muted)" }}
                  >
                    {a.text}
                  </p>
                  <p
                    className="mt-0.5 text-[10px]"
                    style={{ color: "var(--tc-text-faint)" }}
                  >
                    {a.at}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {coiExpiringSoon.length > 0 && (
        <section className="tc-card flex flex-col gap-3 p-5">
          <header className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" style={{ color: "var(--tc-warning)" }} />
            <span className="tc-eyebrow">COI expiring within 60 days</span>
          </header>
          <ul className="flex flex-col gap-2">
            {coiExpiringSoon.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2"
                style={{ background: "rgba(244,184,96,0.06)" }}
              >
                <span style={{ color: "var(--tc-text)" }}>{c.name}</span>
                <span className="tc-mono text-[12px]" style={{ color: "var(--tc-warning)" }}>
                  expires {c.coiExpiry}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          href="/demo/timbercare/jobs"
          icon={ClipboardList}
          label="Job board"
          sub={`${JOBS.length} jobs · stages from lead → billed`}
        />
        <QuickLink
          href="/demo/timbercare/customers"
          icon={Users}
          label="Customers"
          sub={`${CUSTOMERS.length} on the book · COI tracked`}
        />
        <QuickLink
          href="/demo/timbercare/settings"
          icon={TreePine}
          label="Yard setup"
          sub="ISA arborists · trucks · billing"
        />
      </section>

      <p
        className="text-[11px] leading-relaxed"
        style={{ color: "var(--tc-text-faint)" }}
      >
        Sales demo. All job + customer data is fictional. The real workspace
        ships within 48 hours of signing.
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
    <div className="tc-card flex flex-col gap-1 p-5">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--tc-text-faint)" }}
      >
        {label}
      </span>
      <span
        className="tc-serif text-[26px] leading-tight"
        style={{ color: accent ?? "var(--tc-text)" }}
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
      className="tc-card flex items-center gap-3 p-4 transition-colors"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          background: "rgba(180,138,75,0.14)",
          border: "1px solid rgba(180,138,75,0.45)",
        }}
      >
        <Icon className="h-4 w-4" style={{ color: "var(--tc-accent)" }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px]" style={{ color: "var(--tc-text)" }}>
          {label}
        </div>
        <div className="text-[11px]" style={{ color: "var(--tc-text-muted)" }}>
          {sub}
        </div>
      </div>
      <ArrowRight
        className="h-3.5 w-3.5"
        style={{ color: "var(--tc-text-faint)" }}
      />
    </Link>
  );
}
