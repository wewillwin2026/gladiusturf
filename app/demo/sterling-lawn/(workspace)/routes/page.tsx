import Link from "next/link";
import { ArrowRight, Clock, Truck, Users } from "lucide-react";
import { CLUSTERS, CUSTOMERS, colorForCluster } from "@/lib/demo-data/sterling-lawn";

export const dynamic = "force-dynamic";

export default function RoutesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="sl-eyebrow-muted">Routes</span>
        <h1
          className="sl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--sl-text)" }}
        >
          Four weekly routes. One Tampa book.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--sl-text-muted)" }}>
          Routes are zip-clustered so a single truck runs the full day without
          backhaul. Drag a customer between routes from their detail page.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {CLUSTERS.map((c) => {
          const stops = CUSTOMERS.filter((x) => x.cluster === c.id);
          const monthly = stops.reduce(
            (sum, x) => sum + (x.status === "Active" ? x.monthlyValue : 0),
            0,
          );
          return (
            <article key={c.id} className="sl-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: colorForCluster(c.id) }}
                    />
                    <span
                      className="text-[11px] uppercase tracking-[0.14em]"
                      style={{ color: "var(--sl-text-faint)" }}
                    >
                      {c.weekday}
                    </span>
                  </div>
                  <h2
                    className="sl-serif mt-1 text-[20px] leading-tight"
                    style={{ color: "var(--sl-text)" }}
                  >
                    {c.name}
                  </h2>
                  <p
                    className="mt-1 text-[12px]"
                    style={{ color: "var(--sl-text-muted)" }}
                  >
                    Zips: {c.zips.join(" · ")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <RouteStat icon={Users} label="Stops" value={`${c.customers}`} />
                <RouteStat
                  icon={Clock}
                  label="Time"
                  value={`~${Math.round(c.weeklyMinutes / 60)}h`}
                />
                <RouteStat
                  icon={Truck}
                  label="Truck"
                  value={c.truck.split(" · ")[0]}
                />
              </div>

              <div
                className="rounded-md px-3 py-2 text-[12px]"
                style={{
                  background: "rgba(0,0,0,0.18)",
                  border: "1px solid var(--sl-border)",
                }}
              >
                <div style={{ color: "var(--sl-text)" }}>
                  Chief: <strong>{c.crewChief}</strong>
                </div>
                <div style={{ color: "var(--sl-text-muted)" }}>
                  ${monthly.toLocaleString()} monthly recurring on this route
                </div>
              </div>

              <Link
                href="/demo/sterling-lawn/customers"
                className="sl-btn-ghost self-start"
              >
                See {stops.length} customers <ArrowRight className="h-3 w-3" />
              </Link>
            </article>
          );
        })}
      </div>

      <section className="sl-card flex flex-col gap-2 p-5">
        <span className="sl-eyebrow">How routes work in Gladius</span>
        <p
          className="text-[13px] leading-[1.6]"
          style={{ color: "var(--sl-text-muted)" }}
        >
          Add a customer; Gladius proposes the best route + day based on
          zip-cluster density and the existing truck&rsquo;s free-time window. You
          confirm or pick a different one. Route order auto-optimizes nightly
          for travel-time minus stop-time. The map view (live tenant only)
          shows truck telemetry and ETA pings to customers waiting at home.
        </p>
      </section>
    </div>
  );
}

type LucideLikeIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

function RouteStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideLikeIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3" style={{ color: "var(--sl-text-faint)" }} />
        <span
          className="text-[10px] uppercase tracking-[0.14em]"
          style={{ color: "var(--sl-text-faint)" }}
        >
          {label}
        </span>
      </div>
      <div
        className="sl-serif text-[16px] leading-tight"
        style={{ color: "var(--sl-text)" }}
      >
        {value}
      </div>
    </div>
  );
}
