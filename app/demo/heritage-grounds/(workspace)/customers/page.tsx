import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CUSTOMERS } from "@/lib/demo-data/heritage-grounds";

export const dynamic = "force-dynamic";

function money(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

const STATUS_PILL: Record<
  (typeof CUSTOMERS)[number]["status"],
  { bg: string; color: string; border: string }
> = {
  Active: {
    bg: "rgba(217,131,106,0.10)",
    color: "var(--hg-accent)",
    border: "rgba(217,131,106,0.40)",
  },
  "Past project": {
    bg: "rgba(245,241,232,0.06)",
    color: "var(--hg-text-muted)",
    border: "var(--hg-border-strong)",
  },
  Lead: {
    bg: "rgba(124,200,232,0.10)",
    color: "var(--hg-info)",
    border: "rgba(124,200,232,0.40)",
  },
};

export default function CustomersPage() {
  const active = CUSTOMERS.filter((c) => c.status === "Active").length;
  const leads = CUSTOMERS.filter((c) => c.status === "Lead").length;
  const past = CUSTOMERS.filter((c) => c.status === "Past project").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="hg-eyebrow-muted">Customers</span>
        <h1
          className="hg-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--hg-text)" }}
        >
          {CUSTOMERS.length} properties on the book
        </h1>
        <p className="text-[13px]" style={{ color: "var(--hg-text-muted)" }}>
          {active} active · {leads} lead{leads === 1 ? "" : "s"} · {past} past
          project{past === 1 ? "" : "s"}.
        </p>
      </header>

      <div className="hg-card overflow-hidden" style={{ background: "var(--hg-bg)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr
              className="text-left text-[10px] uppercase tracking-[0.14em]"
              style={{
                color: "var(--hg-text-faint)",
                borderBottom: "1px solid var(--hg-border)",
              }}
            >
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Designer</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Lifetime</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map((c) => {
              const pill = STATUS_PILL[c.status];
              return (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid var(--hg-border)" }}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/demo/heritage-grounds/customers/${c.id}`}
                      style={{ color: "var(--hg-text)" }}
                      className="hover:underline"
                    >
                      {c.name}
                    </Link>
                    <div
                      className="mt-0.5 text-[11px]"
                      style={{ color: "var(--hg-text-muted)" }}
                    >
                      {c.address} · {c.zip}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--hg-text-muted)" }}
                  >
                    {c.primaryDesigner}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="hg-pill"
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
                    className="hg-mono px-4 py-3 text-right tabular-nums"
                    style={{ color: "var(--hg-text)" }}
                  >
                    {money(c.lifetimeRevenue)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/demo/heritage-grounds/customers/${c.id}`}
                      className="inline-flex items-center gap-1"
                      style={{ color: "var(--hg-accent)" }}
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
