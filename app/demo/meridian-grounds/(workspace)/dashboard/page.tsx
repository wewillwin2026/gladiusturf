import Link from "next/link";
import { ArrowRight, Building2, ClipboardList, ShieldCheck } from "lucide-react";
import {
  ACTIVITY,
  BRAND,
  KPIS,
  PROPERTIES,
  WORK_ORDERS,
  customerById,
} from "@/lib/demo-data/meridian-grounds";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  if (cents >= 100_000_000) return `$${(cents / 100_000_000).toFixed(2)}M`;
  if (cents >= 100_000) return `$${Math.round(cents / 100_000).toLocaleString()}K`;
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

const KIND_COLOR: Record<(typeof ACTIVITY)[number]["kind"], string> = {
  wo: "var(--mg-info)",
  alert: "var(--mg-warning)",
  review: "var(--mg-accent)",
  payment: "var(--mg-success)",
  lead: "var(--mg-accent)",
};

export default function DashboardPage() {
  const woInFlight = WORK_ORDERS.filter((w) =>
    ["approved", "in_progress", "submitted"].includes(w.status),
  ).slice(0, 5);

  const coiExpiring = PROPERTIES.filter(
    (p) =>
      p.coiOnFile &&
      p.coiExpiry &&
      new Date(p.coiExpiry).getTime() < Date.now() + 60 * 24 * 60 * 60 * 1000,
  );
  const coiMissing = PROPERTIES.filter((p) => !p.coiOnFile);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <span className="mg-eyebrow-muted">Today · Tampa office</span>
        <h1
          className="mg-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--mg-text)" }}
        >
          Welcome back, {BRAND.founder.split(" ")[0]}.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--mg-text-muted)" }}>
          {BRAND.serviceArea} · {BRAND.reviewCount} property-manager reviews ·{" "}
          {BRAND.reviewStars} ★
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Active contracts" value={String(KPIS.activeContracts)} />
        <Kpi label="MRR" value={money(KPIS.monthlyRecurring)} />
        <Kpi
          label="Work orders in flight"
          value={String(KPIS.workOrdersInFlight)}
          accent={KPIS.woPendingApproval > 0 ? "var(--mg-warning)" : "var(--mg-text)"}
          sub={
            KPIS.woPendingApproval > 0
              ? `${KPIS.woPendingApproval} awaiting PM approval`
              : undefined
          }
        />
        <Kpi
          label="COI gaps"
          value={`${KPIS.coiExpiringSoon + KPIS.coiMissing}`}
          accent={
            KPIS.coiExpiringSoon + KPIS.coiMissing > 0
              ? "var(--mg-warning)"
              : "var(--mg-success)"
          }
          sub={`${KPIS.coiMissing} missing · ${KPIS.coiExpiringSoon} expiring`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="mg-card flex flex-col gap-3 p-5 lg:col-span-2">
          <header className="flex items-center justify-between">
            <span className="mg-eyebrow">Work orders in flight</span>
            <Link
              href="/demo/meridian-grounds/work-orders"
              className="text-[11px]"
              style={{ color: "var(--mg-accent)" }}
            >
              See all →
            </Link>
          </header>
          <ul className="flex flex-col gap-2">
            {woInFlight.map((w) => {
              const prop = customerById(w.propertyId);
              return (
                <li
                  key={w.id}
                  className="grid grid-cols-1 gap-2 rounded-md px-3 py-2 md:grid-cols-[1.5fr_auto_auto] md:items-center md:gap-3"
                  style={{ background: "rgba(0,0,0,0.18)" }}
                >
                  <div>
                    <div
                      className="text-[13px]"
                      style={{ color: "var(--mg-text)" }}
                    >
                      {prop?.propertyName ?? "—"}
                    </div>
                    <div
                      className="truncate text-[11px]"
                      style={{ color: "var(--mg-text-muted)" }}
                    >
                      {w.description}
                    </div>
                  </div>
                  <span
                    className="mg-pill"
                    style={{
                      color:
                        w.status === "submitted"
                          ? "var(--mg-warning)"
                          : "var(--mg-accent)",
                      background:
                        w.status === "submitted"
                          ? "rgba(244,184,96,0.08)"
                          : "rgba(107,148,214,0.08)",
                      borderColor:
                        w.status === "submitted"
                          ? "rgba(244,184,96,0.40)"
                          : "rgba(107,148,214,0.30)",
                    }}
                  >
                    {w.status.replace("_", " ")}
                  </span>
                  <span
                    className="mg-mono text-right"
                    style={{ color: "var(--mg-text)" }}
                  >
                    {money(w.estimateCents)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mg-card flex flex-col gap-3 p-5">
          <span className="mg-eyebrow">Activity</span>
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
                    style={{ color: "var(--mg-text-muted)" }}
                  >
                    {a.text}
                  </p>
                  <p
                    className="mt-0.5 text-[10px]"
                    style={{ color: "var(--mg-text-faint)" }}
                  >
                    {a.at}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {(coiExpiring.length > 0 || coiMissing.length > 0) && (
        <section className="mg-card flex flex-col gap-3 p-5">
          <header className="flex items-center gap-2">
            <ShieldCheck
              className="h-4 w-4"
              style={{ color: "var(--mg-warning)" }}
            />
            <span className="mg-eyebrow">
              Certificate-of-insurance attention
            </span>
          </header>
          <ul className="flex flex-col gap-2">
            {coiMissing.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2"
                style={{ background: "rgba(232,95,95,0.06)" }}
              >
                <span style={{ color: "var(--mg-text)" }}>{p.propertyName}</span>
                <span
                  className="mg-pill"
                  style={{
                    color: "var(--mg-alert)",
                    background: "rgba(232,95,95,0.10)",
                    borderColor: "rgba(232,95,95,0.40)",
                  }}
                >
                  COI missing
                </span>
              </li>
            ))}
            {coiExpiring.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2"
                style={{ background: "rgba(244,184,96,0.06)" }}
              >
                <span style={{ color: "var(--mg-text)" }}>{p.propertyName}</span>
                <span
                  className="mg-mono text-[12px]"
                  style={{ color: "var(--mg-warning)" }}
                >
                  expires {p.coiExpiry}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          href="/demo/meridian-grounds/properties"
          icon={Building2}
          label="Properties"
          sub={`${KPIS.activeContracts} active · NTE ceilings tracked`}
        />
        <QuickLink
          href="/demo/meridian-grounds/work-orders"
          icon={ClipboardList}
          label="Work orders"
          sub={`${KPIS.workOrdersInFlight} in flight · ${KPIS.woPendingApproval} pending`}
        />
        <QuickLink
          href="/demo/meridian-grounds/settings"
          icon={Building2}
          label="Yard setup"
          sub="Crew · trucks · billing"
        />
      </section>

      <p
        className="text-[11px] leading-relaxed"
        style={{ color: "var(--mg-text-faint)" }}
      >
        Sales demo. All contract + WO data is fictional. The real workspace
        ships within 48 hours of signing.
      </p>
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="mg-card flex flex-col gap-1 p-5">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--mg-text-faint)" }}
      >
        {label}
      </span>
      <span
        className="mg-serif text-[26px] leading-tight"
        style={{ color: accent ?? "var(--mg-text)" }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[11px]" style={{ color: "var(--mg-text-muted)" }}>
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
    <Link
      href={href}
      className="mg-card flex items-center gap-3 p-4 transition-colors"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          background: "rgba(107,148,214,0.14)",
          border: "1px solid rgba(107,148,214,0.45)",
        }}
      >
        <Icon className="h-4 w-4" style={{ color: "var(--mg-accent)" }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px]" style={{ color: "var(--mg-text)" }}>
          {label}
        </div>
        <div className="text-[11px]" style={{ color: "var(--mg-text-muted)" }}>
          {sub}
        </div>
      </div>
      <ArrowRight
        className="h-3.5 w-3.5"
        style={{ color: "var(--mg-text-faint)" }}
      />
    </Link>
  );
}
