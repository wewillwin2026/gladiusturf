import Link from "next/link";
import {
  ArrowRight,
  Beaker,
  CircleAlert,
  CircleDollarSign,
  MapPin,
  Repeat,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  ACTIVITY_FEED,
  BRAND,
  CLUSTERS,
  CUSTOMERS,
  KPIS,
  colorForCluster,
} from "@/lib/demo-data/sterling-lawn";

export const dynamic = "force-dynamic";

const KIND_TO_ICON = {
  service: MapPin,
  payment: CircleDollarSign,
  review: Star,
  alert: CircleAlert,
  lead: Sparkles,
} as const;

const KIND_TO_TONE: Record<
  (typeof ACTIVITY_FEED)[number]["kind"],
  string
> = {
  service: "var(--sl-info)",
  payment: "var(--sl-success)",
  review: "var(--sl-accent)",
  alert: "var(--sl-alert)",
  lead: "var(--sl-accent)",
};

export default function DashboardPage() {
  const todaysRoute = CLUSTERS.find((c) => c.weekday === "Mon") ?? CLUSTERS[0];
  const todaysStops = CUSTOMERS.filter((c) => c.cluster === todaysRoute.id);
  const pastDue = CUSTOMERS.filter((c) => c.status === "Past due");

  const kpis = [
    {
      label: "Active customers",
      value: KPIS.activeCustomers.toString(),
      delta: `${KPIS.planSubscribers} on a recurring plan`,
      tone: "neutral" as const,
    },
    {
      label: "Monthly recurring",
      value: `$${KPIS.monthlyRecurring.toLocaleString()}`,
      delta: "92% of customer base on a plan",
      tone: "success" as const,
    },
    {
      label: "Past-due invoices",
      value: KPIS.pastDueInvoices.toString(),
      delta: `$${KPIS.pastDueAmount.toLocaleString()} outstanding`,
      tone: "amber" as const,
    },
    {
      label: "Reviews this month",
      value: KPIS.reviewsThisMonth.toString(),
      delta: `${KPIS.reviewLifetime} lifetime · ${KPIS.reviewStars} ★`,
      tone: "success" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <section className="flex flex-col gap-1">
        <span className="sl-eyebrow-muted">Monday · May 12</span>
        <h1
          className="sl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--sl-text)" }}
        >
          Welcome back, {BRAND.founder.split(" ")[0]}.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--sl-text-muted)" }}>
          {BRAND.serviceArea} · {BRAND.reviewCount} Google reviews ·{" "}
          {BRAND.reviewStars} ★
        </p>
      </section>

      {/* KPI strip */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </section>

      {/* Two-column: today's route + activity feed */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Today's route */}
        <div className="sl-card flex flex-col gap-3 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="sl-eyebrow">Today&rsquo;s route</span>
              <h2
                className="sl-serif mt-1 text-[20px] leading-tight"
                style={{ color: "var(--sl-text)" }}
              >
                {todaysRoute.name}
              </h2>
              <p
                className="mt-1 text-[12px]"
                style={{ color: "var(--sl-text-muted)" }}
              >
                {todaysRoute.crewChief} · {todaysRoute.truck} ·{" "}
                {todaysStops.length} stops · ~
                {Math.round(todaysRoute.weeklyMinutes / 60)} hrs
              </p>
            </div>
            <span
              className="sl-pill"
              style={{
                background: "rgba(127,226,122,0.10)",
                color: "var(--sl-accent)",
                borderColor: "rgba(127,226,122,0.40)",
              }}
            >
              <span
                className="sl-pulse h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--sl-accent)" }}
              />
              On schedule
            </span>
          </div>
          <ul className="mt-1 flex flex-col gap-2">
            {todaysStops.slice(0, 6).map((c, i) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2"
                style={{ background: "rgba(0,0,0,0.18)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="sl-mono text-[10px] tabular-nums"
                    style={{ color: "var(--sl-text-faint)" }}
                  >
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div
                      className="truncate text-[13px]"
                      style={{ color: "var(--sl-text)" }}
                    >
                      {c.name}
                    </div>
                    <div
                      className="truncate text-[11px]"
                      style={{ color: "var(--sl-text-muted)" }}
                    >
                      {c.address} · {c.zip}
                    </div>
                  </div>
                </div>
                <span
                  className="sl-pill shrink-0"
                  style={{
                    background: "rgba(127,226,122,0.08)",
                    borderColor: "rgba(127,226,122,0.30)",
                    color: "var(--sl-accent)",
                  }}
                >
                  {c.plan}
                </span>
              </li>
            ))}
            {todaysStops.length > 6 && (
              <li
                className="text-center text-[11px]"
                style={{ color: "var(--sl-text-faint)" }}
              >
                + {todaysStops.length - 6} more stops on this route
              </li>
            )}
          </ul>
          <Link
            href="/demo/sterling-lawn/routes"
            className="sl-btn-ghost mt-1 self-start"
          >
            Open routes <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Activity */}
        <div className="sl-card flex flex-col gap-3 p-5">
          <span className="sl-eyebrow">Activity</span>
          <ul className="flex flex-col gap-3">
            {ACTIVITY_FEED.map((a) => {
              const Icon = KIND_TO_ICON[a.kind];
              return (
                <li key={a.id} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.32)",
                      border: `1px solid ${KIND_TO_TONE[a.kind]}`,
                    }}
                  >
                    <Icon
                      className="h-2.5 w-2.5"
                      style={{ color: KIND_TO_TONE[a.kind] }}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[12px] leading-[1.45]"
                      style={{ color: "var(--sl-text-muted)" }}
                    >
                      {a.text}
                    </p>
                    <p
                      className="mt-0.5 text-[10px]"
                      style={{ color: "var(--sl-text-faint)" }}
                    >
                      {a.at}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Past-due strip */}
      {pastDue.length > 0 && (
        <section className="sl-card flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <CircleAlert
              className="h-4 w-4"
              style={{ color: "var(--sl-alert)" }}
            />
            <span className="sl-eyebrow">
              Past-due invoices · {pastDue.length} customers · $
              {KPIS.pastDueAmount.toLocaleString()}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {pastDue.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2"
                style={{ background: "rgba(232,95,95,0.06)" }}
              >
                <div>
                  <div className="text-[13px]" style={{ color: "var(--sl-text)" }}>
                    {c.name}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--sl-text-muted)" }}
                  >
                    {c.notes ?? "Past-due reminder queued."}
                  </div>
                </div>
                <Link
                  href={`/demo/sterling-lawn/customers/${c.id}`}
                  className="sl-btn-ghost shrink-0"
                >
                  Review <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Four route legend cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CLUSTERS.map((c) => (
          <div key={c.id} className="sl-card flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: colorForCluster(c.id) }}
              />
              <span
                className="text-[11px] uppercase tracking-[0.14em]"
                style={{ color: "var(--sl-text-faint)" }}
              >
                {c.weekday}
              </span>
            </div>
            <div
              className="sl-serif text-[15px] leading-tight"
              style={{ color: "var(--sl-text)" }}
            >
              {c.name}
            </div>
            <div className="text-[12px]" style={{ color: "var(--sl-text-muted)" }}>
              {c.customers} customers · {c.crewChief}
            </div>
          </div>
        ))}
      </section>

      {/* Helpful quicklinks */}
      <section className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          href="/demo/sterling-lawn/customers"
          icon={Users}
          label="All customers"
          sub={`${KPIS.activeCustomers} active`}
        />
        <QuickLink
          href="/demo/sterling-lawn/applications"
          icon={Beaker}
          label="Chemical applications log"
          sub={`${KPIS.applicationsThisMonth} this month · EPA-ready`}
        />
        <QuickLink
          href="/demo/sterling-lawn/plans"
          icon={Repeat}
          label="Maintenance plans"
          sub={`${KPIS.planSubscribers} subscribers`}
        />
      </section>

      <p
        className="text-[11px] leading-relaxed"
        style={{ color: "var(--sl-text-faint)" }}
      >
        Sales demo. All customer + revenue data is fictional. The real
        workspace for your shop ships within 48 hours of signing — your data
        is migrated by founders, not a junior CSM.
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "neutral" | "amber" | "success" | "alert";
}) {
  const toneColor =
    tone === "success"
      ? "var(--sl-success)"
      : tone === "amber"
        ? "#f4b860"
        : tone === "alert"
          ? "var(--sl-alert)"
          : "var(--sl-text-muted)";
  return (
    <div className="sl-card flex flex-col gap-1 p-5">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--sl-text-faint)" }}
      >
        {label}
      </span>
      <span
        className="sl-serif text-[28px] leading-tight"
        style={{ color: "var(--sl-text)" }}
      >
        {value}
      </span>
      <span
        className="flex items-center gap-1 text-[11px]"
        style={{ color: toneColor }}
      >
        <TrendingUp className="h-3 w-3" />
        {delta}
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
      className="sl-card flex items-center gap-3 p-4 transition-colors"
      style={{ background: "var(--sl-bg)" }}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          background: "rgba(127,226,122,0.14)",
          border: "1px solid rgba(127,226,122,0.45)",
        }}
      >
        <Icon className="h-4 w-4" style={{ color: "var(--sl-accent)" }} />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-[13px]"
          style={{ color: "var(--sl-text)" }}
        >
          {label}
        </div>
        <div
          className="truncate text-[11px]"
          style={{ color: "var(--sl-text-muted)" }}
        >
          {sub}
        </div>
      </div>
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0"
        style={{ color: "var(--sl-text-faint)" }}
      />
    </Link>
  );
}

