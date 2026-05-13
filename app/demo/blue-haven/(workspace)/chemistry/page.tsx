import Link from "next/link";
import { ArrowRight, Beaker, Download, ShieldCheck } from "lucide-react";
import { CHEMISTRY, customerById } from "@/lib/demo-data/blue-haven";

export const dynamic = "force-dynamic";

const RESULT_TONE: Record<
  (typeof CHEMISTRY)[number]["result"],
  { bg: string; color: string; border: string }
> = {
  balanced: {
    bg: "rgba(157,255,138,0.10)",
    color: "var(--bh-success)",
    border: "rgba(157,255,138,0.40)",
  },
  high_cl: {
    bg: "rgba(244,184,96,0.10)",
    color: "#f4b860",
    border: "rgba(244,184,96,0.40)",
  },
  low_cl: {
    bg: "rgba(232,95,95,0.10)",
    color: "var(--bh-alert)",
    border: "rgba(232,95,95,0.40)",
  },
  high_ph: {
    bg: "rgba(244,184,96,0.10)",
    color: "#f4b860",
    border: "rgba(244,184,96,0.40)",
  },
  low_ph: {
    bg: "rgba(232,95,95,0.10)",
    color: "var(--bh-alert)",
    border: "rgba(232,95,95,0.40)",
  },
  off: {
    bg: "rgba(232,95,95,0.10)",
    color: "var(--bh-alert)",
    border: "rgba(232,95,95,0.40)",
  },
};

export default function ChemistryPage() {
  const balanced = CHEMISTRY.filter((c) => c.result === "balanced").length;
  const flagged = CHEMISTRY.length - balanced;
  const dosed = CHEMISTRY.filter((c) => c.dosed != null).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="bh-eyebrow-muted">Chemistry log · audit-ready</span>
        <h1
          className="bh-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--bh-text)" }}
        >
          Every reading. Every pool. Every drop.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--bh-text-muted)" }}>
          {CHEMISTRY.length} readings logged · {balanced} balanced · {flagged}{" "}
          flagged · {dosed} dosed at visit. State-board exports in one click.
        </p>
      </header>

      <section className="flex flex-wrap gap-2">
        <button type="button" className="bh-btn-primary">
          <Download className="h-3.5 w-3.5" />
          Export DPD log (PDF)
        </button>
        <button type="button" className="bh-btn-ghost">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
        <span
          className="bh-eyebrow-muted ml-2 inline-flex items-center gap-1"
        >
          <ShieldCheck className="h-3 w-3" style={{ color: "var(--bh-success)" }} />
          County audit-ready
        </span>
      </section>

      <div className="bh-card overflow-hidden" style={{ background: "var(--bh-bg)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr
              className="text-left text-[10px] uppercase tracking-[0.14em]"
              style={{
                color: "var(--bh-text-faint)",
                borderBottom: "1px solid var(--bh-border)",
              }}
            >
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Pool</th>
              <th className="px-4 py-3 font-semibold">Tech</th>
              <th className="px-4 py-3 font-semibold text-right">FC ppm</th>
              <th className="px-4 py-3 font-semibold text-right">pH</th>
              <th className="px-4 py-3 font-semibold text-right">TA</th>
              <th className="px-4 py-3 font-semibold">Result</th>
              <th className="px-4 py-3 font-semibold">Dosed</th>
            </tr>
          </thead>
          <tbody>
            {CHEMISTRY.map((r) => {
              const cust = customerById(r.customerId);
              const tone = RESULT_TONE[r.result];
              return (
                <tr
                  key={r.id}
                  style={{ borderBottom: "1px solid var(--bh-border)" }}
                >
                  <td
                    className="bh-mono px-4 py-3"
                    style={{ color: "var(--bh-text-faint)" }}
                  >
                    {r.date}
                  </td>
                  <td className="px-4 py-3">
                    {cust ? (
                      <Link
                        href={`/demo/blue-haven/customers/${cust.id}`}
                        style={{ color: "var(--bh-text)" }}
                        className="hover:underline"
                      >
                        {cust.name}
                      </Link>
                    ) : (
                      <span style={{ color: "var(--bh-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--bh-text-muted)" }}
                  >
                    {r.techName}
                  </td>
                  <td
                    className="bh-mono px-4 py-3 text-right"
                    style={{ color: "var(--bh-text)" }}
                  >
                    {r.free_cl_ppm.toFixed(1)}
                  </td>
                  <td
                    className="bh-mono px-4 py-3 text-right"
                    style={{ color: "var(--bh-text)" }}
                  >
                    {r.ph.toFixed(1)}
                  </td>
                  <td
                    className="bh-mono px-4 py-3 text-right"
                    style={{ color: "var(--bh-text)" }}
                  >
                    {r.total_alkalinity_ppm}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="bh-pill"
                      style={{
                        background: tone.bg,
                        color: tone.color,
                        borderColor: tone.border,
                      }}
                    >
                      {r.result.replace("_", " ")}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-[11px]"
                    style={{ color: "var(--bh-text-muted)" }}
                  >
                    {r.dosed ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="bh-card flex flex-col gap-2 p-5">
        <div className="flex items-center gap-2">
          <Beaker className="h-4 w-4" style={{ color: "var(--bh-accent)" }} />
          <span className="bh-eyebrow">Why the log matters</span>
        </div>
        <p
          className="text-[13px] leading-[1.6]"
          style={{ color: "var(--bh-text-muted)" }}
        >
          Florida pool service operators carry per-county chemistry records.
          A pool that gets a chlorine-related call from the homeowner becomes
          a paper trail question fast. Gladius logs every reading with tech
          and dose, exports clean, and pre-fills auto-doses for the next
          visit when patterns drift.
        </p>
        <Link
          href="/demo/blue-haven/customers"
          className="bh-btn-ghost mt-2 self-start"
        >
          See chemistry by pool <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </div>
  );
}
