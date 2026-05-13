import Link from "next/link";
import { Download, ShieldCheck } from "lucide-react";
import { BACKFLOWS, customerById } from "@/lib/demo-data/aquaflow";

export const dynamic = "force-dynamic";

export default function BackflowPage() {
  const current = BACKFLOWS.filter((b) => b.status === "current").length;
  const dueSoon = BACKFLOWS.filter((b) => b.status === "due_soon").length;
  const overdue = BACKFLOWS.filter((b) => b.status === "overdue").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="af-eyebrow-muted">Backflow compliance radar</span>
        <h1
          className="af-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--af-text)" }}
        >
          {BACKFLOWS.length} assemblies on file
        </h1>
        <p className="text-[13px]" style={{ color: "var(--af-text-muted)" }}>
          {current} current · {dueSoon} due soon · {overdue} overdue.
          Per-utility-portal filing (BSI Online · JEA · Pinellas County ·
          Tampa Water) auto-routes on test completion.
        </p>
      </header>

      <section className="flex flex-wrap gap-2">
        <button type="button" className="af-btn-primary">
          <Download className="h-3.5 w-3.5" />
          Export filing log (PDF)
        </button>
        <button type="button" className="af-btn-ghost">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </section>

      <div className="af-card overflow-hidden" style={{ background: "var(--af-bg)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr
              className="text-left text-[10px] uppercase tracking-[0.14em]"
              style={{
                color: "var(--af-text-faint)",
                borderBottom: "1px solid var(--af-border)",
              }}
            >
              <th className="px-4 py-3 font-semibold">Property</th>
              <th className="px-4 py-3 font-semibold">Assembly</th>
              <th className="px-4 py-3 font-semibold">Portal</th>
              <th className="px-4 py-3 font-semibold">Last filed</th>
              <th className="px-4 py-3 font-semibold">Next due</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Cert #</th>
            </tr>
          </thead>
          <tbody>
            {BACKFLOWS.map((b) => {
              const cust = customerById(b.customerId);
              const tone =
                b.status === "current"
                  ? {
                      bg: "rgba(157,255,138,0.10)",
                      color: "var(--af-success)",
                      border: "rgba(157,255,138,0.40)",
                    }
                  : b.status === "due_soon"
                    ? {
                        bg: "rgba(244,184,96,0.10)",
                        color: "var(--af-warning)",
                        border: "rgba(244,184,96,0.40)",
                      }
                    : {
                        bg: "rgba(232,95,95,0.10)",
                        color: "var(--af-alert)",
                        border: "rgba(232,95,95,0.40)",
                      };
              return (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--af-border)" }}>
                  <td className="px-4 py-3">
                    {cust ? (
                      <Link
                        href={`/demo/aquaflow/customers/${cust.id}`}
                        style={{ color: "var(--af-text)" }}
                        className="hover:underline"
                      >
                        {cust.name}
                      </Link>
                    ) : (
                      <span style={{ color: "var(--af-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div style={{ color: "var(--af-text)" }}>{b.assemblyType}</div>
                    <div className="text-[11px]" style={{ color: "var(--af-text-faint)" }}>
                      SN {b.serialNo}
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--af-text-muted)" }}>
                    {b.utilityPortal}
                  </td>
                  <td
                    className="af-mono px-4 py-3"
                    style={{ color: "var(--af-text-faint)" }}
                  >
                    {b.lastFiledDate}
                  </td>
                  <td
                    className="af-mono px-4 py-3"
                    style={{ color: "var(--af-text-faint)" }}
                  >
                    {b.nextDueDate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="af-pill"
                      style={{
                        background: tone.bg,
                        color: tone.color,
                        borderColor: tone.border,
                      }}
                    >
                      {b.status.replace("_", " ")}
                    </span>
                  </td>
                  <td
                    className="af-mono px-4 py-3 text-[11px]"
                    style={{ color: "var(--af-text-muted)" }}
                  >
                    {b.technicianCertNo}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="af-card flex flex-col gap-2 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" style={{ color: "var(--af-accent)" }} />
          <span className="af-eyebrow">Why the radar matters</span>
        </div>
        <p
          className="text-[13px] leading-[1.6]"
          style={{ color: "var(--af-text-muted)" }}
        >
          Florida backflow assemblies need annual filings. Late = shut-off +
          fines. The radar surfaces overdue + due-soon by property, pre-fills
          the right utility-portal export, and stamps the technician cert #
          on every row.
        </p>
      </section>
    </div>
  );
}
