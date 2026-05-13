import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CUSTOMERS, ROUTES } from "@/lib/demo-data/aquaflow";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<
  (typeof CUSTOMERS)[number]["status"],
  { bg: string; color: string; border: string }
> = {
  Active: {
    bg: "rgba(77,196,178,0.10)",
    color: "var(--af-accent)",
    border: "rgba(77,196,178,0.40)",
  },
  "Past due": {
    bg: "rgba(232,95,95,0.10)",
    color: "var(--af-alert)",
    border: "rgba(232,95,95,0.40)",
  },
  Hold: {
    bg: "rgba(244,184,96,0.10)",
    color: "var(--af-warning)",
    border: "rgba(244,184,96,0.40)",
  },
};

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="af-eyebrow-muted">Customers</span>
        <h1 className="af-serif text-[28px] leading-[1.1]" style={{ color: "var(--af-text)" }}>
          {CUSTOMERS.length} properties on the book
        </h1>
        <p className="text-[13px]" style={{ color: "var(--af-text-muted)" }}>
          Sample of 12 from an 89-property book. Tap any name for the
          per-zone controller history.
        </p>
      </header>

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
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Route</th>
              <th className="px-4 py-3 font-semibold">Controller</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Monthly</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map((c) => {
              const route = ROUTES.find((r) => r.id === c.route);
              const pill = STATUS_PILL[c.status];
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--af-border)" }}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/demo/aquaflow/customers/${c.id}`}
                      style={{ color: "var(--af-text)" }}
                      className="hover:underline"
                    >
                      {c.name}
                    </Link>
                    <div
                      className="mt-0.5 text-[11px]"
                      style={{ color: "var(--af-text-muted)" }}
                    >
                      {c.address} · {c.zip} · {c.zones} zones
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--af-text-muted)" }}>
                    {route?.weekday} · {route?.techName.split(" ")[0]}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--af-text-muted)" }}>
                    {c.controller}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="af-pill"
                      style={{
                        background: pill.bg,
                        color: pill.color,
                        borderColor: pill.border,
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td
                    className="af-mono px-4 py-3 text-right"
                    style={{ color: "var(--af-text)" }}
                  >
                    ${c.monthlyValue}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/demo/aquaflow/customers/${c.id}`}
                      className="inline-flex items-center gap-1"
                      style={{ color: "var(--af-accent)" }}
                    >
                      Open <ArrowRight className="h-3 w-3" />
                    </Link>
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
