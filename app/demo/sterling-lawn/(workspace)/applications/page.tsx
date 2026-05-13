import Link from "next/link";
import { ArrowRight, Beaker, Download, ShieldCheck } from "lucide-react";
import { CHEMICAL_APPS, customerById } from "@/lib/demo-data/sterling-lawn";

export const dynamic = "force-dynamic";

const CATEGORY_TONE: Record<
  (typeof CHEMICAL_APPS)[number]["category"],
  { bg: string; color: string; border: string }
> = {
  Herbicide: {
    bg: "rgba(244,184,96,0.14)",
    color: "#f4b860",
    border: "rgba(244,184,96,0.40)",
  },
  Insecticide: {
    bg: "rgba(232,95,95,0.12)",
    color: "var(--sl-alert)",
    border: "rgba(232,95,95,0.40)",
  },
  Fungicide: {
    bg: "rgba(124,200,232,0.12)",
    color: "var(--sl-info)",
    border: "rgba(124,200,232,0.40)",
  },
  Fertilizer: {
    bg: "rgba(127,226,122,0.10)",
    color: "var(--sl-accent)",
    border: "rgba(127,226,122,0.40)",
  },
  Adjuvant: {
    bg: "rgba(245,241,232,0.06)",
    color: "var(--sl-text-muted)",
    border: "var(--sl-border-strong)",
  },
};

export default function ApplicationsPage() {
  const monthlyOz = CHEMICAL_APPS.reduce((sum, a) => sum + a.totalAppliedOz, 0);
  const byCategory = CHEMICAL_APPS.reduce<Record<string, number>>(
    (acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="sl-eyebrow-muted">Applications · EPA 5B-9 ready</span>
        <h1
          className="sl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--sl-text)" }}
        >
          Every spray. Every property. Every drop.
        </h1>
        <p
          className="text-[13px]"
          style={{ color: "var(--sl-text-muted)" }}
        >
          {CHEMICAL_APPS.length} applications logged in the last 30 days ·{" "}
          {monthlyOz.toLocaleString()} oz applied total. Exports to your state
          board format in one click.
        </p>
      </header>

      {/* KPI strip */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total applications" value={`${CHEMICAL_APPS.length}`} />
        <Kpi
          label="Total volume"
          value={`${monthlyOz.toLocaleString()} oz`}
        />
        <Kpi
          label="Reentry on file"
          value="100%"
          accent="var(--sl-success)"
        />
        <Kpi
          label="Cert # on every row"
          value="Yes"
          accent="var(--sl-success)"
        />
      </section>

      {/* Category counts */}
      <section className="flex flex-wrap gap-2">
        {Object.entries(byCategory).map(([cat, count]) => {
          const tone = CATEGORY_TONE[cat as keyof typeof CATEGORY_TONE];
          return (
            <span
              key={cat}
              className="sl-pill"
              style={{
                background: tone.bg,
                color: tone.color,
                borderColor: tone.border,
              }}
            >
              {cat} · {count}
            </span>
          );
        })}
      </section>

      {/* Export CTA */}
      <div className="flex items-center gap-3">
        <button className="sl-btn-primary" type="button">
          <Download className="h-3.5 w-3.5" />
          Export EPA 5B-9 (PDF)
        </button>
        <button className="sl-btn-ghost" type="button">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
        <span
          className="sl-eyebrow-muted ml-2 inline-flex items-center gap-1"
        >
          <ShieldCheck
            className="h-3 w-3"
            style={{ color: "var(--sl-success)" }}
          />
          Audit-ready
        </span>
      </div>

      {/* Log */}
      <div
        className="sl-card overflow-hidden"
        style={{ background: "var(--sl-bg)" }}
      >
        <table className="w-full text-[13px]">
          <thead>
            <tr
              className="text-left text-[10px] uppercase tracking-[0.14em]"
              style={{
                color: "var(--sl-text-faint)",
                borderBottom: "1px solid var(--sl-border)",
              }}
            >
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Property</th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Applicator</th>
              <th className="px-4 py-3 font-semibold text-right">Volume</th>
              <th className="px-4 py-3 font-semibold text-right">REI</th>
            </tr>
          </thead>
          <tbody>
            {CHEMICAL_APPS.map((a) => {
              const cust = customerById(a.customerId);
              const tone = CATEGORY_TONE[a.category];
              return (
                <tr
                  key={a.id}
                  style={{ borderBottom: "1px solid var(--sl-border)" }}
                >
                  <td
                    className="sl-mono px-4 py-3 tabular-nums"
                    style={{ color: "var(--sl-text-faint)" }}
                  >
                    {a.date}
                  </td>
                  <td className="px-4 py-3">
                    {cust ? (
                      <Link
                        href={`/demo/sterling-lawn/customers/${cust.id}`}
                        style={{ color: "var(--sl-text)" }}
                        className="hover:underline"
                      >
                        {cust.name}
                      </Link>
                    ) : (
                      <span style={{ color: "var(--sl-text-muted)" }}>
                        {a.customerId}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div style={{ color: "var(--sl-text)" }}>
                      {a.productName}
                    </div>
                    <div
                      className="sl-mono text-[11px]"
                      style={{ color: "var(--sl-text-faint)" }}
                    >
                      EPA #{a.productEpaNo} · {a.rate}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="sl-pill"
                      style={{
                        background: tone.bg,
                        color: tone.color,
                        borderColor: tone.border,
                      }}
                    >
                      {a.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div style={{ color: "var(--sl-text)" }}>{a.applicator}</div>
                    <div
                      className="sl-mono text-[11px]"
                      style={{ color: "var(--sl-text-faint)" }}
                    >
                      Cert #{a.applicatorCertNo}
                    </div>
                  </td>
                  <td
                    className="sl-mono px-4 py-3 text-right tabular-nums"
                    style={{ color: "var(--sl-text)" }}
                  >
                    {a.totalAppliedOz} oz
                  </td>
                  <td
                    className="sl-mono px-4 py-3 text-right tabular-nums"
                    style={{
                      color:
                        a.reentryHours >= 12
                          ? "var(--sl-alert)"
                          : "var(--sl-text-muted)",
                    }}
                  >
                    {a.reentryHours}h
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="sl-card flex flex-col gap-2 p-5">
        <div className="flex items-center gap-2">
          <Beaker className="h-4 w-4" style={{ color: "var(--sl-accent)" }} />
          <span className="sl-eyebrow">Why the log matters</span>
        </div>
        <p
          className="text-[13px] leading-[1.6]"
          style={{ color: "var(--sl-text-muted)" }}
        >
          Florida requires a 2-year application record per property + per
          chemical, with cert number, rate, reentry interval, and notification
          to the customer. State board audits are random and unannounced. Gladius
          generates the export they expect in one click — no scrolling through
          truck-side photos of paper forms.
        </p>
        <Link
          href="/demo/sterling-lawn/customers"
          className="sl-btn-ghost mt-2 self-start"
        >
          See by-property history <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
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
    <div className="sl-card flex flex-col gap-1 p-4">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--sl-text-faint)" }}
      >
        {label}
      </span>
      <span
        className="sl-serif text-[22px] leading-tight"
        style={{ color: accent ?? "var(--sl-text)" }}
      >
        {value}
      </span>
    </div>
  );
}
