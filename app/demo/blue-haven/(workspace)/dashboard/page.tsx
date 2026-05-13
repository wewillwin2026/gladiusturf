import Link from "next/link";
import { ArrowRight, Beaker, Users, Waves } from "lucide-react";
import {
  ACTIVITY,
  BRAND,
  CHEMISTRY,
  CUSTOMERS,
  KPIS,
  ROUTES,
  colorForRoute,
  customerById,
} from "@/lib/demo-data/blue-haven";

export const dynamic = "force-dynamic";

const KIND_COLOR: Record<(typeof ACTIVITY)[number]["kind"], string> = {
  service: "var(--bh-info)",
  alert: "var(--bh-alert)",
  review: "var(--bh-accent)",
  payment: "var(--bh-success)",
  lead: "var(--bh-accent)",
};

function money(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

export default function DashboardPage() {
  // Today's route — Monday default for this demo.
  const todays = ROUTES[0];
  const todaysStops = CUSTOMERS.filter((c) => c.route === todays.id);
  const offBalance = CHEMISTRY.filter((c) => c.result !== "balanced").slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <span className="bh-eyebrow-muted">Today · Tampa</span>
        <h1
          className="bh-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--bh-text)" }}
        >
          Welcome back, {BRAND.founder.split(" ")[0]}.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--bh-text-muted)" }}>
          {BRAND.serviceArea} · {BRAND.reviewCount} reviews · {BRAND.reviewStars} ★
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Pools on route" value={String(KPIS.activePools)} />
        <Kpi
          label="Routes"
          value={`${KPIS.routes} weekly`}
          sub={`${todays.weekday} today: ${todaysStops.length} stops`}
        />
        <Kpi label="MRR" value={money(KPIS.monthlyRecurring)} />
        <Kpi
          label="Chemistry off-balance"
          value={`${KPIS.chemistryOff} / ${KPIS.chemistryLogged}`}
          accent={KPIS.chemistryOff > 0 ? "#f4b860" : "var(--bh-success)"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="bh-card flex flex-col gap-3 p-5 lg:col-span-2">
          <header className="flex items-center justify-between">
            <div>
              <span className="bh-eyebrow">Today&rsquo;s route</span>
              <h2
                className="bh-serif mt-1 text-[20px] leading-tight"
                style={{ color: "var(--bh-text)" }}
              >
                {todays.weekday} · {todays.techName}
              </h2>
              <p
                className="text-[12px]"
                style={{ color: "var(--bh-text-muted)" }}
              >
                {todays.truck} · {todaysStops.length} stops
              </p>
            </div>
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: colorForRoute(todays.id) }}
            />
          </header>
          <ul className="flex flex-col gap-2">
            {todaysStops.slice(0, 5).map((c, i) => (
              <li
                key={c.id}
                className="grid grid-cols-1 gap-2 rounded-md px-3 py-2 md:grid-cols-[40px_minmax(0,1fr)_auto] md:items-center"
                style={{ background: "rgba(0,0,0,0.18)" }}
              >
                <span
                  className="bh-mono text-[11px]"
                  style={{ color: "var(--bh-text-faint)" }}
                >
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="text-[13px]" style={{ color: "var(--bh-text)" }}>
                    {c.name}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--bh-text-muted)" }}
                  >
                    {c.address} · {c.zip} · {c.gallons.toLocaleString()} gal
                  </div>
                </div>
                <span
                  className="bh-pill"
                  style={{
                    background: "rgba(124,200,232,0.10)",
                    color: "var(--bh-accent)",
                    borderColor: "rgba(124,200,232,0.40)",
                  }}
                >
                  {c.pool}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bh-card flex flex-col gap-3 p-5">
          <span className="bh-eyebrow">Activity</span>
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
                    style={{ color: "var(--bh-text-muted)" }}
                  >
                    {a.text}
                  </p>
                  <p
                    className="mt-0.5 text-[10px]"
                    style={{ color: "var(--bh-text-faint)" }}
                  >
                    {a.at}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {offBalance.length > 0 && (
        <section className="bh-card flex flex-col gap-3 p-5">
          <header className="flex items-center gap-2">
            <Beaker className="h-4 w-4" style={{ color: "var(--bh-accent)" }} />
            <span className="bh-eyebrow">Recent off-balance chemistry</span>
          </header>
          <ul className="flex flex-col gap-2">
            {offBalance.map((r) => {
              const cust = customerById(r.customerId);
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-1 gap-2 rounded-md px-3 py-2 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-3"
                  style={{ background: "rgba(232,95,95,0.06)" }}
                >
                  <div>
                    <div
                      className="text-[13px]"
                      style={{ color: "var(--bh-text)" }}
                    >
                      {cust?.name ?? "—"}
                    </div>
                    <div
                      className="text-[11px]"
                      style={{ color: "var(--bh-text-muted)" }}
                    >
                      FC {r.free_cl_ppm} ppm · pH {r.ph} · TA{" "}
                      {r.total_alkalinity_ppm}
                    </div>
                  </div>
                  <span
                    className="bh-pill"
                    style={{
                      background: "rgba(244,184,96,0.10)",
                      color: "#f4b860",
                      borderColor: "rgba(244,184,96,0.40)",
                    }}
                  >
                    {r.result.replace("_", " ")}
                  </span>
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--bh-text-faint)" }}
                  >
                    {r.techName}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          href="/demo/blue-haven/customers"
          icon={Users}
          label="All customers"
          sub={`${KPIS.activePools} pools on route`}
        />
        <QuickLink
          href="/demo/blue-haven/chemistry"
          icon={Beaker}
          label="Chemistry log"
          sub={`${KPIS.chemistryLogged} recent readings · audit-ready`}
        />
        <QuickLink
          href="/demo/blue-haven/settings"
          icon={Waves}
          label="Service profile"
          sub="Techs · trucks · billing"
        />
      </section>

      <p
        className="text-[11px] leading-relaxed"
        style={{ color: "var(--bh-text-faint)" }}
      >
        Sales demo. All pool + chemistry data is fictional. The real workspace
        ships within 48 hours of signing — your data migrated by founders.
      </p>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bh-card flex flex-col gap-1 p-5">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--bh-text-faint)" }}
      >
        {label}
      </span>
      <span
        className="bh-serif text-[26px] leading-tight"
        style={{ color: accent ?? "var(--bh-text)" }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[11px]" style={{ color: "var(--bh-text-muted)" }}>
          {sub}
        </span>
      )}
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
    <Link href={href} className="bh-card flex items-center gap-3 p-4 transition-colors">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          background: "rgba(124,200,232,0.14)",
          border: "1px solid rgba(124,200,232,0.45)",
        }}
      >
        <Icon className="h-4 w-4" style={{ color: "var(--bh-accent)" }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px]" style={{ color: "var(--bh-text)" }}>
          {label}
        </div>
        <div className="text-[11px]" style={{ color: "var(--bh-text-muted)" }}>
          {sub}
        </div>
      </div>
      <ArrowRight className="h-3.5 w-3.5" style={{ color: "var(--bh-text-faint)" }} />
    </Link>
  );
}
