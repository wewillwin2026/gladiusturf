import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CUSTOMERS } from "@/lib/demo-data/timbercare";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
  const residential = CUSTOMERS.filter((c) => c.customerKind === "residential").length;
  const commercial = CUSTOMERS.filter((c) => c.customerKind === "commercial").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="tc-eyebrow-muted">Customers</span>
        <h1 className="tc-serif text-[28px] leading-[1.1]" style={{ color: "var(--tc-text)" }}>
          {CUSTOMERS.length} on the book
        </h1>
        <p className="text-[13px]" style={{ color: "var(--tc-text-muted)" }}>
          {residential} residential · {commercial} commercial. Commercial
          customers track COI expiry so insurance never lapses on a job
          site.
        </p>
      </header>

      <div className="tc-card overflow-hidden" style={{ background: "var(--tc-bg)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr
              className="text-left text-[10px] uppercase tracking-[0.14em]"
              style={{
                color: "var(--tc-text-faint)",
                borderBottom: "1px solid var(--tc-border)",
              }}
            >
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Kind</th>
              <th className="px-4 py-3 font-semibold">COI</th>
              <th className="px-4 py-3 font-semibold text-right">Lifetime</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--tc-border)" }}>
                <td className="px-4 py-3">
                  <Link
                    href={`/demo/timbercare/customers/${c.id}`}
                    style={{ color: "var(--tc-text)" }}
                    className="hover:underline"
                  >
                    {c.name}
                  </Link>
                  <div
                    className="mt-0.5 text-[11px]"
                    style={{ color: "var(--tc-text-muted)" }}
                  >
                    {c.address} · {c.zip}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="tc-pill"
                    style={{
                      color:
                        c.customerKind === "commercial"
                          ? "var(--tc-accent)"
                          : "var(--tc-text-muted)",
                      background:
                        c.customerKind === "commercial"
                          ? "rgba(180,138,75,0.08)"
                          : "transparent",
                      borderColor:
                        c.customerKind === "commercial"
                          ? "rgba(180,138,75,0.30)"
                          : "var(--tc-border)",
                    }}
                  >
                    {c.customerKind}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c.coiOnFile ? (
                    <span className="inline-flex items-center gap-1 text-[12px] text-g-success" style={{ color: "var(--tc-success)" }}>
                      <ShieldCheck className="h-3 w-3" />
                      {c.coiExpiry}
                    </span>
                  ) : (
                    <span className="text-[12px]" style={{ color: "var(--tc-text-faint)" }}>
                      —
                    </span>
                  )}
                </td>
                <td
                  className="tc-mono px-4 py-3 text-right"
                  style={{ color: "var(--tc-text)" }}
                >
                  ${c.lifetimeRevenue.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/demo/timbercare/customers/${c.id}`}
                    className="inline-flex items-center gap-1"
                    style={{ color: "var(--tc-accent)" }}
                  >
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
