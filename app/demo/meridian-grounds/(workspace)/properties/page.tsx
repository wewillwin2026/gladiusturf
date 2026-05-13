import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PROPERTIES } from "@/lib/demo-data/meridian-grounds";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

const KIND_LABEL: Record<
  (typeof PROPERTIES)[number]["ownerKind"],
  string
> = {
  office: "Office",
  retail: "Retail",
  hoa: "HOA",
  multi_tenant: "Multi-tenant",
  industrial: "Industrial",
};

export default function PropertiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="mg-eyebrow-muted">Properties</span>
        <h1
          className="mg-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--mg-text)" }}
        >
          {PROPERTIES.length} properties under contract
        </h1>
        <p className="text-[13px]" style={{ color: "var(--mg-text-muted)" }}>
          NTE ceiling per property gates over-budget work orders to PM
          approval. COI tracked + auto-renewal flagged 60 days out.
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
              <th className="px-4 py-3 font-semibold">Owner / kind</th>
              <th className="px-4 py-3 font-semibold">COI</th>
              <th className="px-4 py-3 font-semibold text-right">Monthly</th>
              <th className="px-4 py-3 font-semibold text-right">NTE</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {PROPERTIES.map((p) => (
              <tr
                key={p.id}
                style={{ borderBottom: "1px solid var(--mg-border)" }}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/demo/meridian-grounds/properties/${p.id}`}
                    style={{ color: "var(--mg-text)" }}
                    className="hover:underline"
                  >
                    {p.propertyName}
                  </Link>
                  <div
                    className="mt-0.5 text-[11px]"
                    style={{ color: "var(--mg-text-muted)" }}
                  >
                    {p.address} · {p.zip} · {p.acreage} ac
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div style={{ color: "var(--mg-text)" }}>{p.customerName}</div>
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--mg-text-muted)" }}
                  >
                    {KIND_LABEL[p.ownerKind]}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {p.coiOnFile ? (
                    <span
                      className="inline-flex items-center gap-1 text-[12px]"
                      style={{ color: "var(--mg-success)" }}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {p.coiExpiry}
                    </span>
                  ) : (
                    <span
                      className="mg-pill"
                      style={{
                        color: "var(--mg-alert)",
                        background: "rgba(232,95,95,0.10)",
                        borderColor: "rgba(232,95,95,0.40)",
                      }}
                    >
                      Missing
                    </span>
                  )}
                </td>
                <td
                  className="mg-mono px-4 py-3 text-right"
                  style={{ color: "var(--mg-text)" }}
                >
                  {money(p.contractMonthlyCents)}
                </td>
                <td
                  className="mg-mono px-4 py-3 text-right text-[12px]"
                  style={{ color: "var(--mg-text-faint)" }}
                >
                  {money(p.nteCeilingCents)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/demo/meridian-grounds/properties/${p.id}`}
                    className="inline-flex items-center gap-1"
                    style={{ color: "var(--mg-accent)" }}
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
