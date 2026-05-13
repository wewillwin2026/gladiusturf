import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CUSTOMERS, ROUTES, colorForRoute } from "@/lib/demo-data/blue-haven";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<
  (typeof CUSTOMERS)[number]["status"],
  { bg: string; color: string; border: string }
> = {
  Active: {
    bg: "rgba(124,200,232,0.10)",
    color: "var(--bh-accent)",
    border: "rgba(124,200,232,0.40)",
  },
  "Past due": {
    bg: "rgba(232,95,95,0.10)",
    color: "var(--bh-alert)",
    border: "rgba(232,95,95,0.40)",
  },
  Hold: {
    bg: "rgba(244,184,96,0.10)",
    color: "#f4b860",
    border: "rgba(244,184,96,0.40)",
  },
};

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="bh-eyebrow-muted">Customers</span>
        <h1
          className="bh-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--bh-text)" }}
        >
          {CUSTOMERS.length} pools on the book
        </h1>
        <p className="text-[13px]" style={{ color: "var(--bh-text-muted)" }}>
          Sample of 15 from a 162-pool route. Tap a name for the property
          profile + chemistry history.
        </p>
      </header>

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
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Route</th>
              <th className="px-4 py-3 font-semibold">Pool</th>
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
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid var(--bh-border)" }}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/demo/blue-haven/customers/${c.id}`}
                      style={{ color: "var(--bh-text)" }}
                      className="hover:underline"
                    >
                      {c.name}
                    </Link>
                    <div
                      className="mt-0.5 text-[11px]"
                      style={{ color: "var(--bh-text-muted)" }}
                    >
                      {c.address} · {c.zip}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: colorForRoute(c.route) }}
                      />
                      <span style={{ color: "var(--bh-text-muted)" }}>
                        {route?.weekday} · {route?.techName.split(" ")[0]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--bh-text-muted)" }}>
                    {c.pool} · {c.gallons.toLocaleString()} gal
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="bh-pill"
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
                    className="bh-mono px-4 py-3 text-right"
                    style={{ color: "var(--bh-text)" }}
                  >
                    ${c.monthlyValue}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/demo/blue-haven/customers/${c.id}`}
                      className="inline-flex items-center gap-1"
                      style={{ color: "var(--bh-accent)" }}
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
