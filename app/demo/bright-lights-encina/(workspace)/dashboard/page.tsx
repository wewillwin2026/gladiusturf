import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, TrendingUp } from "lucide-react";
import {
  ACTIVITY_FEED,
  BRAND,
  CUSTOMERS,
  TODAYS_ROUTE,
  customerById,
  colorForCluster,
} from "@/lib/demo-data/bright-lights";
import { FloridaMap } from "../../FloridaMap";
import { ActivityRow } from "../../ActivityRow";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const activeCustomers = BRAND.estimatedCustomers;
  const subscribers = 0;
  const opportunityARR = subscribers === 0 ? 74_100 : 0;

  const kpis = [
    {
      label: "Active customers",
      value: activeCustomers.toString(),
      delta: "Estimated from review history",
      tone: "neutral" as const,
    },
    {
      label: "Maintenance plan subscribers",
      value: `${subscribers} / ${activeCustomers}`,
      delta: `Opportunity: $${opportunityARR.toLocaleString()}/yr`,
      tone: "amber" as const,
    },
    {
      label: "Open service calls",
      value: "3",
      delta: "Sarasota cluster — today",
      tone: "neutral" as const,
    },
    {
      label: "Reviews this month",
      value: "4",
      delta: "171 lifetime · 5.0 ★",
      tone: "success" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <section className="flex flex-col gap-1">
        <span className="bl-eyebrow-muted">Today, Friday May 1</span>
        <h1
          className="bl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          Welcome back, {BRAND.operator.split(" ")[0]}.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--bl-text-muted)" }}>
          {BRAND.serviceArea} · {BRAND.reviewCount} Google reviews · {BRAND.reviewStars}{" "}
          ★. Three Sarasota stops on the route today.
        </p>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="bl-card px-4 py-4">
            <div className="bl-eyebrow-muted">{k.label}</div>
            <div
              className="bl-mono mt-2 text-[28px] leading-none"
              style={{ color: "var(--bl-text)" }}
            >
              {k.value}
            </div>
            <div
              className="mt-2 text-[11px]"
              style={{
                color:
                  k.tone === "amber"
                    ? "var(--bl-accent)"
                    : k.tone === "success"
                      ? "var(--bl-success)"
                      : "var(--bl-text-faint)",
              }}
            >
              {k.delta}
            </div>
          </div>
        ))}
      </section>

      {/* Map + Today's route side by side on desktop */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="bl-card overflow-hidden">
          <header
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--bl-border)" }}
          >
            <div className="flex items-baseline gap-3">
              <span className="bl-eyebrow">Service Area · West Coast FL</span>
              <span
                className="text-[11px]"
                style={{ color: "var(--bl-text-faint)" }}
              >
                Naples → Tampa · {CUSTOMERS.length} pinned customers
              </span>
            </div>
            <div className="flex gap-3 text-[11px]">
              <ClusterLegend label="Sarasota" color="#F4B860" />
              <ClusterLegend label="Tampa / N." color="#9CD86E" />
              <ClusterLegend label="Naples / S." color="#E89B3C" />
            </div>
          </header>
          <FloridaMap
            customers={CUSTOMERS.map((c) => ({
              id: c.id,
              name: c.name,
              lat: c.lat,
              lng: c.lng,
              color: colorForCluster(c.cluster),
              cluster: c.cluster,
            }))}
            height={380}
          />
        </div>

        <div className="bl-card flex flex-col">
          <header
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--bl-border)" }}
          >
            <span className="bl-eyebrow">Today&rsquo;s route — Sarasota</span>
            <span
              className="bl-mono text-[11px]"
              style={{ color: "var(--bl-text-faint)" }}
            >
              3 stops · ~6 mi
            </span>
          </header>
          <ol className="flex flex-col">
            {TODAYS_ROUTE.map((stop, i) => {
              const c = customerById(stop.customerId);
              if (!c) return null;
              return (
                <li
                  key={stop.customerId}
                  className="flex items-start gap-3 px-4 py-3"
                  style={{
                    borderBottom:
                      i < TODAYS_ROUTE.length - 1
                        ? "1px solid var(--bl-border)"
                        : "none",
                  }}
                >
                  <div
                    className="bl-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px]"
                    style={{
                      background: "var(--bl-accent)",
                      color: "#1a1208",
                      fontWeight: 600,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className="truncate text-[13px]"
                        style={{ color: "var(--bl-text)" }}
                      >
                        {c.name}
                      </span>
                      <span
                        className="bl-mono shrink-0 text-[11px]"
                        style={{ color: "var(--bl-text-faint)" }}
                      >
                        {stop.time}
                      </span>
                    </div>
                    <div
                      className="mt-0.5 flex items-center gap-1.5 text-[11px]"
                      style={{ color: "var(--bl-text-muted)" }}
                    >
                      <MapPin className="h-3 w-3" />
                      {c.address}
                    </div>
                    <div
                      className="mt-1 text-[11px]"
                      style={{ color: "var(--bl-text-faint)" }}
                    >
                      {stop.reason}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <div
            className="mt-auto flex items-center justify-between px-4 py-3 text-[11px]"
            style={{
              borderTop: "1px solid var(--bl-border)",
              color: "var(--bl-text-faint)",
            }}
          >
            <span className="bl-mono">Auto-batched · saves 47 min today</span>
            <Link
              href="/demo/bright-lights-encina/routes"
              className="inline-flex items-center gap-1"
              style={{ color: "var(--bl-accent)" }}
            >
              See all routes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Activity + Maintenance opportunity */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="bl-card">
          <header
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--bl-border)" }}
          >
            <span className="bl-eyebrow">Recent activity</span>
            <span
              className="text-[11px]"
              style={{ color: "var(--bl-text-faint)" }}
            >
              Past 14 days
            </span>
          </header>
          <ul>
            {ACTIVITY_FEED.map((a, i) => (
              <ActivityRow
                key={a.id}
                activity={a}
                last={i === ACTIVITY_FEED.length - 1}
              />
            ))}
          </ul>
        </div>

        <div className="bl-card flex flex-col p-4">
          <div className="flex items-center gap-2">
            <Sparkles
              className="h-4 w-4"
              style={{ color: "var(--bl-accent)" }}
            />
            <span className="bl-eyebrow">Big opportunity</span>
          </div>
          <h3
            className="bl-serif mt-3 text-[20px] leading-[1.2]"
            style={{ color: "var(--bl-text)" }}
          >
            $74,100 a year, sitting in your book.
          </h3>
          <p
            className="mt-2 text-[13px] leading-[1.55]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            247 customers × $300/yr = $74,100. Even at 30% conversion that&rsquo;s
            $22K in recurring revenue you&rsquo;re not booking today.
            <br />
            <br />
            Beacon Outdoor charges $315/yr for what your customers already get
            from your dad for free.
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            <Stat label="Industry avg plan price" value="$315/yr" />
            <Stat label="Bright Care projected" value="$349/yr" />
            <Stat label="At 30% conversion" value="$25,873/yr ARR" highlight />
          </div>
          <Link
            href="/demo/bright-lights-encina/plans"
            className="bl-btn-primary mt-5"
          >
            <TrendingUp className="h-4 w-4" /> Build the launch campaign
          </Link>
        </div>
      </section>
    </div>
  );
}

function ClusterLegend({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      style={{ color: "var(--bl-text-faint)" }}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between text-[12px]">
      <span style={{ color: "var(--bl-text-faint)" }}>{label}</span>
      <span
        className="bl-mono"
        style={{
          color: highlight ? "var(--bl-accent)" : "var(--bl-text)",
          fontWeight: highlight ? 600 : 400,
        }}
      >
        {value}
      </span>
    </div>
  );
}
