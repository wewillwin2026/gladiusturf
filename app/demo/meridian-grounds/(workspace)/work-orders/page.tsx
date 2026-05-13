import Link from "next/link";
import { WORK_ORDERS, customerById } from "@/lib/demo-data/meridian-grounds";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

const STATUS_TONE: Record<
  (typeof WORK_ORDERS)[number]["status"],
  { bg: string; color: string; border: string; label: string }
> = {
  draft: {
    bg: "rgba(245,241,232,0.06)",
    color: "var(--mg-text-muted)",
    border: "var(--mg-border-strong)",
    label: "Draft",
  },
  submitted: {
    bg: "rgba(244,184,96,0.10)",
    color: "var(--mg-warning)",
    border: "rgba(244,184,96,0.40)",
    label: "Awaiting PM",
  },
  approved: {
    bg: "rgba(107,148,214,0.08)",
    color: "var(--mg-accent)",
    border: "rgba(107,148,214,0.30)",
    label: "Approved",
  },
  in_progress: {
    bg: "rgba(124,200,232,0.10)",
    color: "var(--mg-info)",
    border: "rgba(124,200,232,0.40)",
    label: "In progress",
  },
  complete: {
    bg: "rgba(157,255,138,0.10)",
    color: "var(--mg-success)",
    border: "rgba(157,255,138,0.40)",
    label: "Complete",
  },
  denied: {
    bg: "rgba(232,95,95,0.10)",
    color: "var(--mg-alert)",
    border: "rgba(232,95,95,0.40)",
    label: "Denied",
  },
};

export default function WorkOrdersPage() {
  const totalSubmitted = WORK_ORDERS.filter((w) => w.status === "submitted").reduce(
    (s, w) => s + w.estimateCents,
    0,
  );
  const totalInFlight = WORK_ORDERS.filter((w) =>
    ["approved", "in_progress"].includes(w.status),
  ).reduce((s, w) => s + w.estimateCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="mg-eyebrow-muted">Work orders</span>
        <h1
          className="mg-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--mg-text)" }}
        >
          {WORK_ORDERS.length} work orders on file
        </h1>
        <p className="text-[13px]" style={{ color: "var(--mg-text-muted)" }}>
          Awaiting PM approval: {money(totalSubmitted)} · In flight after
          approval: {money(totalInFlight)}. WOs that exceed the property NTE
          ceiling are auto-routed to PM for sign-off.
        </p>
      </header>

      <div className="mg-card overflow-hidden" style={{ background: "var(--mg-bg)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr
              className="text-left text-[10px] uppercase tracking-[0.14em]"
              style={{
                color: "var(--mg-text-faint)",
                borderBottom: "1px solid var(--mg-border)",
              }}
            >
              <th className="px-4 py-3 font-semibold">Property</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Approved</th>
              <th className="px-4 py-3 font-semibold">Start</th>
              <th className="px-4 py-3 font-semibold text-right">Estimate</th>
            </tr>
          </thead>
          <tbody>
            {WORK_ORDERS.map((w) => {
              const prop = customerById(w.propertyId);
              const tone = STATUS_TONE[w.status];
              return (
                <tr
                  key={w.id}
                  style={{ borderBottom: "1px solid var(--mg-border)" }}
                >
                  <td className="px-4 py-3">
                    {prop ? (
                      <Link
                        href={`/demo/meridian-grounds/properties/${prop.id}`}
                        style={{ color: "var(--mg-text)" }}
                        className="hover:underline"
                      >
                        {prop.propertyName}
                      </Link>
                    ) : (
                      <span style={{ color: "var(--mg-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--mg-text-muted)" }}>
                    {w.description}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="mg-pill"
                      style={{
                        background: tone.bg,
                        color: tone.color,
                        borderColor: tone.border,
                      }}
                    >
                      {tone.label}
                    </span>
                  </td>
                  <td
                    className="mg-mono px-4 py-3"
                    style={{ color: "var(--mg-text-faint)" }}
                  >
                    {w.approvedAt ?? "—"}
                  </td>
                  <td
                    className="mg-mono px-4 py-3"
                    style={{ color: "var(--mg-text-faint)" }}
                  >
                    {w.startDate ?? "—"}
                  </td>
                  <td
                    className="mg-mono px-4 py-3 text-right"
                    style={{ color: "var(--mg-text)" }}
                  >
                    {money(w.estimateCents)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
