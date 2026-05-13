import Link from "next/link";
import { ArrowRight, Droplets, ShieldCheck, Users } from "lucide-react";
import {
  ACTIVITY,
  BACKFLOWS,
  BRAND,
  CUSTOMERS,
  KPIS,
  ROUTES,
  customerById,
} from "@/lib/demo-data/aquaflow";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

const KIND_COLOR: Record<(typeof ACTIVITY)[number]["kind"], string> = {
  service: "var(--af-info)",
  alert: "var(--af-alert)",
  review: "var(--af-accent)",
  payment: "var(--af-success)",
  lead: "var(--af-accent)",
};

export default function DashboardPage() {
  const todays = ROUTES[0];
  const todaysStops = CUSTOMERS.filter((c) => c.route === todays.id);
  const urgentBackflows = BACKFLOWS.filter(
    (b) => b.status === "overdue" || b.status === "due_soon",
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <span className="af-eyebrow-muted">Today · St. Petersburg</span>
        <h1 className="af-serif text-[28px] leading-[1.1]" style={{ color: "var(--af-text)" }}>
          Welcome back, {BRAND.founder.split(" ")[0]}.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--af-text-muted)" }}>
          {BRAND.serviceArea} · {BRAND.reviewCount} reviews · {BRAND.reviewStars} ★
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Properties" value={String(KPIS.activeProperties)} />
        <Kpi label="MRR" value={money(KPIS.monthlyRecurring)} />
        <Kpi
          label="Backflows overdue"
          value={String(KPIS.backflowsOverdue)}
          accent={KPIS.backflowsOverdue > 0 ? "var(--af-alert)" : "var(--af-success)"}
        />
        <Kpi
          label="Backflows due soon"
          value={String(KPIS.backflowsDueSoon)}
          accent={KPIS.backflowsDueSoon > 0 ? "var(--af-warning)" : "var(--af-success)"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="af-card flex flex-col gap-3 p-5 lg:col-span-2">
          <header className="flex items-center justify-between">
            <div>
              <span className="af-eyebrow">Today&rsquo;s route</span>
              <h2
                className="af-serif mt-1 text-[20px] leading-tight"
                style={{ color: "var(--af-text)" }}
              >
                {todays.weekday} · {todays.techName}
              </h2>
              <p
                className="text-[12px]"
                style={{ color: "var(--af-text-muted)" }}
              >
                {todays.truck} · {todaysStops.length} stops · zips {todays.zips.join(", ")}
              </p>
            </div>
          </header>
          <ul className="flex flex-col gap-2">
            {todaysStops.slice(0, 5).map((c, i) => (
              <li
                key={c.id}
                className="grid grid-cols-1 gap-2 rounded-md px-3 py-2 md:grid-cols-[40px_minmax(0,1fr)_auto] md:items-center"
                style={{ background: "rgba(0,0,0,0.18)" }}
              >
                <span
                  className="af-mono text-[11px]"
                  style={{ color: "var(--af-text-faint)" }}
                >
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div
                    className="text-[13px]"
                    style={{ color: "var(--af-text)" }}
                  >
                    {c.name}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--af-text-muted)" }}
                  >
                    {c.address} · {c.zones} zones · {c.controller}
                  </div>
                </div>
                <span
                  className="af-pill"
                  style={{
                    background: "rgba(77,196,178,0.10)",
                    color: "var(--af-accent)",
                    borderColor: "rgba(77,196,178,0.40)",
                  }}
                >
                  ${c.monthlyValue}/mo
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="af-card flex flex-col gap-3 p-5">
          <span className="af-eyebrow">Activity</span>
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
                    style={{ color: "var(--af-text-muted)" }}
                  >
                    {a.text}
                  </p>
                  <p
                    className="mt-0.5 text-[10px]"
                    style={{ color: "var(--af-text-faint)" }}
                  >
                    {a.at}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {urgentBackflows.length > 0 && (
        <section className="af-card flex flex-col gap-3 p-5">
          <header className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" style={{ color: "var(--af-warning)" }} />
            <span className="af-eyebrow">Backflow attention</span>
          </header>
          <ul className="flex flex-col gap-2">
            {urgentBackflows.map((b) => {
              const cust = customerById(b.customerId);
              return (
                <li
                  key={b.id}
                  className="grid grid-cols-1 gap-2 rounded-md px-3 py-2 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-3"
                  style={{
                    background:
                      b.status === "overdue"
                        ? "rgba(232,95,95,0.06)"
                        : "rgba(244,184,96,0.06)",
                  }}
                >
                  <div>
                    <div className="text-[13px]" style={{ color: "var(--af-text)" }}>
                      {cust?.name ?? "—"}
                    </div>
                    <div
                      className="text-[11px]"
                      style={{ color: "var(--af-text-muted)" }}
                    >
                      {b.assemblyType} · SN {b.serialNo} · files to {b.utilityPortal}
                    </div>
                  </div>
                  <span
                    className="af-pill"
                    style={{
                      background:
                        b.status === "overdue"
                          ? "rgba(232,95,95,0.10)"
                          : "rgba(244,184,96,0.10)",
                      color:
                        b.status === "overdue"
                          ? "var(--af-alert)"
                          : "var(--af-warning)",
                      borderColor:
                        b.status === "overdue"
                          ? "rgba(232,95,95,0.40)"
                          : "rgba(244,184,96,0.40)",
                    }}
                  >
                    {b.status.replace("_", " ")}
                  </span>
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--af-text-faint)" }}
                  >
                    due {b.nextDueDate}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          href="/demo/aquaflow/customers"
          icon={Users}
          label="All customers"
          sub={`${KPIS.activeProperties} properties on route`}
        />
        <QuickLink
          href="/demo/aquaflow/backflow"
          icon={ShieldCheck}
          label="Backflow filings"
          sub={`${KPIS.backflowsTotal} on file · ${KPIS.backflowsOverdue} overdue`}
        />
        <QuickLink
          href="/demo/aquaflow/settings"
          icon={Droplets}
          label="Service profile"
          sub="Techs · trucks · billing"
        />
      </section>

      <p
        className="text-[11px] leading-relaxed"
        style={{ color: "var(--af-text-faint)" }}
      >
        Sales demo. All customer + backflow data is fictional. The real
        workspace ships within 48 hours of signing.
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
    <div className="af-card flex flex-col gap-1 p-5">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--af-text-faint)" }}
      >
        {label}
      </span>
      <span
        className="af-serif text-[26px] leading-tight"
        style={{ color: accent ?? "var(--af-text)" }}
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
      className="af-card flex items-center gap-3 p-4 transition-colors"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          background: "rgba(77,196,178,0.14)",
          border: "1px solid rgba(77,196,178,0.45)",
        }}
      >
        <Icon className="h-4 w-4" style={{ color: "var(--af-accent)" }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px]" style={{ color: "var(--af-text)" }}>
          {label}
        </div>
        <div className="text-[11px]" style={{ color: "var(--af-text-muted)" }}>
          {sub}
        </div>
      </div>
      <ArrowRight
        className="h-3.5 w-3.5"
        style={{ color: "var(--af-text-faint)" }}
      />
    </Link>
  );
}
