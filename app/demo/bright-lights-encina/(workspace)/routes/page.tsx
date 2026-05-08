import { Compass, Fuel, Sparkles, TrendingDown } from "lucide-react";
import {
  ROUTE_COMPARISON,
  WEEKLY_ROUTES,
  colorForCluster,
  customerById,
} from "@/lib/demo-data/bright-lights";
import { FloridaMap } from "../../FloridaMap";
import { RoutesComparisonToggle } from "./RoutesComparisonToggle";

export const dynamic = "force-dynamic";

export default function RoutesPage() {
  const totalJobs = WEEKLY_ROUTES.reduce((s, r) => s + r.jobs.length, 0);
  const totalMiles = WEEKLY_ROUTES.reduce((s, r) => s + r.miles, 0);
  const totalHours = WEEKLY_ROUTES.reduce((s, r) => s + r.hours, 0);

  const allStops = WEEKLY_ROUTES.flatMap((r) =>
    r.jobs.map((j) => {
      const c = customerById(j.customerId);
      return c ? { ...c, color: r.color } : null;
    }),
  ).filter(Boolean) as ({ color: string } & ReturnType<typeof customerById>)[];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="bl-eyebrow-muted">This week · 9 jobs · 3 routes</span>
        <h1
          className="bl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          Routes — Naples to Clearwater, batched.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--bl-text-muted)" }}>
          The 4-hour round-trip across the western coast becomes one extra day
          per week when batching is automatic.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Jobs this week"
          value={String(totalJobs)}
          delta="up from 6 last week"
        />
        <Stat label="Routes" value={String(WEEKLY_ROUTES.length)} delta="auto-batched" />
        <Stat
          label="Total drive"
          value={`${totalMiles} mi`}
          delta={`vs ${ROUTE_COMPARISON.withoutBatching.miles} mi unbatched`}
          tone="success"
        />
        <Stat
          label="Total hours"
          value={`${totalHours} hr`}
          delta={`saves ${(ROUTE_COMPARISON.withoutBatching.hours - ROUTE_COMPARISON.withBatching.hours).toFixed(1)} hr`}
          tone="success"
        />
      </section>

      <section className="bl-card overflow-hidden">
        <header
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--bl-border)" }}
        >
          <div>
            <span className="bl-eyebrow">Florida coverage · this week</span>
            <p
              className="mt-1 text-[12px]"
              style={{ color: "var(--bl-text-faint)" }}
            >
              Pin colors match the route day. {allStops.length} stops across 3 days.
            </p>
          </div>
          <RoutesComparisonToggle
            without={ROUTE_COMPARISON.withoutBatching}
            withB={ROUTE_COMPARISON.withBatching}
          />
        </header>
        <FloridaMap
          customers={(allStops as Array<NonNullable<ReturnType<typeof customerById>> & { color: string }>).map((c) => ({
            id: c.id,
            name: c.name,
            lat: c.lat,
            lng: c.lng,
            color: c.color,
            cluster: c.cluster,
          }))}
          height={420}
        />
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {WEEKLY_ROUTES.map((route) => (
          <div key={route.day} className="bl-card flex flex-col">
            <header
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--bl-border)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: route.color }}
                />
                <span className="bl-eyebrow">{route.day}</span>
              </div>
              <span
                className="bl-mono text-[11px]"
                style={{ color: "var(--bl-text-faint)" }}
              >
                {route.miles} mi · {route.hours} hr
              </span>
            </header>
            <div className="px-5 py-3">
              <h3
                className="bl-serif text-[16px]"
                style={{ color: "var(--bl-text)" }}
              >
                {route.cluster}
              </h3>
              <ol className="mt-3 flex flex-col gap-2">
                {route.jobs.map((job, idx) => {
                  const c = customerById(job.customerId);
                  if (!c) return null;
                  return (
                    <li
                      key={job.customerId}
                      className="flex items-baseline gap-3 text-[12px]"
                    >
                      <span
                        className="bl-mono shrink-0 text-[10px] uppercase tracking-[0.14em]"
                        style={{ color: "var(--bl-text-faint)" }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="flex-1 truncate"
                        style={{ color: "var(--bl-text)" }}
                      >
                        {c.name}
                      </span>
                      <span
                        className="bl-mono shrink-0 text-[10px]"
                        style={{ color: "var(--bl-text-faint)" }}
                      >
                        {job.arrival}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div
              className="mt-auto flex items-center gap-2 px-5 py-3 text-[11px]"
              style={{
                borderTop: "1px solid var(--bl-border)",
                color: colorForCluster(route.cluster.split(" ")[0] as never) || "var(--bl-text-faint)",
              }}
            >
              <Compass className="h-3 w-3" />
              {route.jobs.length} jobs · auto-optimized
            </div>
          </div>
        ))}
      </section>

      <section
        className="bl-card flex items-start gap-4 p-5"
        style={{
          background: "rgba(156,216,110,0.06)",
          border: "1px solid rgba(156,216,110,0.32)",
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          style={{
            background: "rgba(156,216,110,0.16)",
            color: "var(--bl-success)",
          }}
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3
            className="bl-serif text-[18px]"
            style={{ color: "var(--bl-text)" }}
          >
            That extra day is two more installs a month.
          </h3>
          <p
            className="mt-2 text-[13px] leading-[1.6]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            Without batching: 9 separate trips, 487 mi, 14.5 driving hrs. With
            Gladius: 3 trips, 67 mi, 13 hrs total. That&rsquo;s <strong>420 mi
            saved</strong> and a full day freed up — repeated weekly.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Mini icon={<Fuel className="h-3 w-3" />} label="Fuel" value="−$112/wk" />
            <Mini
              icon={<TrendingDown className="h-3 w-3" />}
              label="Drive time"
              value={`−${(
                ROUTE_COMPARISON.withoutBatching.hours -
                ROUTE_COMPARISON.withBatching.hours
              ).toFixed(1)} hr/wk`}
            />
            <Mini
              icon={<Compass className="h-3 w-3" />}
              label="Miles saved"
              value={`−${
                ROUTE_COMPARISON.withoutBatching.miles -
                ROUTE_COMPARISON.withBatching.miles
              } mi/wk`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "success";
}) {
  return (
    <div className="bl-card px-4 py-4">
      <div className="bl-eyebrow-muted">{label}</div>
      <div
        className="bl-mono mt-2 text-[24px] leading-none"
        style={{ color: "var(--bl-text)" }}
      >
        {value}
      </div>
      {delta && (
        <div
          className="mt-2 text-[11px]"
          style={{
            color: tone === "success" ? "var(--bl-success)" : "var(--bl-text-faint)",
          }}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

function Mini({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-md px-3 py-2"
      style={{
        background: "rgba(0,0,0,0.18)",
        border: "1px solid var(--bl-border)",
      }}
    >
      <div
        className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]"
        style={{ color: "var(--bl-text-faint)" }}
      >
        {icon}
        {label}
      </div>
      <div
        className="bl-mono mt-1 text-[14px]"
        style={{ color: "var(--bl-success)" }}
      >
        {value}
      </div>
    </div>
  );
}
