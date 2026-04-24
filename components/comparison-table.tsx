import { COMPARISON_ROWS, type ComparisonRow } from "@/content/comparison";
import { cn } from "@/lib/cn";

function Cell({ children, featured }: { children: React.ReactNode; featured?: boolean }) {
  return (
    <td
      className={cn(
        "px-4 py-5 text-[14px] align-top",
        featured ? "text-forest" : "text-stone"
      )}
    >
      {children}
    </td>
  );
}

function AiBadge({ v }: { v: ComparisonRow["aiNative"] }) {
  const label = v === "yes" ? "Native" : v === "partial" ? "Bolted on" : "No";
  return <span>{label}</span>;
}

function ComplianceBadge({ v }: { v: ComparisonRow["compliance"] }) {
  const label = v === "full" ? "Applicator Shield built in" : v === "partial" ? "Logging only" : "None";
  return <span>{label}</span>;
}

function MarketplaceBadge({ v }: { v: ComparisonRow["marketplace"] }) {
  return <span>{v === "yes" ? "Surplus Yard" : "—"}</span>;
}

export function ComparisonTable() {
  return (
    <section className="border-b border-[rgba(15,61,46,0.12)] bg-paper">
      <div className="mx-auto max-w-content px-6 py-20 md:py-section">
        <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
          Compare · Fragmented stack vs. flat subscription
        </p>
        <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
          What you&apos;re paying now vs. what GladiusTurf costs.
        </h2>

        <div className="mt-12 overflow-x-auto rounded-[12px] border border-[rgba(15,61,46,0.12)]">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="bg-bone text-left text-[12px] uppercase tracking-[0.12em] text-stone">
                <th className="px-4 py-4 font-medium">Vendor</th>
                <th className="px-4 py-4 font-medium">Price</th>
                <th className="px-4 py-4 font-medium">AI-native?</th>
                <th className="px-4 py-4 font-medium">Compliance</th>
                <th className="px-4 py-4 font-medium">Marketplace</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((r) => (
                <tr
                  key={r.vendor}
                  className={cn(
                    "border-t border-[rgba(15,61,46,0.08)]",
                    r.featured && "relative bg-bone"
                  )}
                  style={r.featured ? { boxShadow: "inset 4px 0 0 0 #7FE27A" } : undefined}
                >
                  <Cell featured={r.featured}>
                    <span className={r.featured ? "font-medium text-forest" : ""}>
                      {r.vendor}
                    </span>
                  </Cell>
                  <Cell featured={r.featured}>{r.price}</Cell>
                  <Cell featured={r.featured}><AiBadge v={r.aiNative} /></Cell>
                  <Cell featured={r.featured}><ComplianceBadge v={r.compliance} /></Cell>
                  <Cell featured={r.featured}><MarketplaceBadge v={r.marketplace} /></Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-[12px] leading-[1.5] text-stone">
          Public pricing, Capterra reviews, Aspire 2026 Commercial Landscape
          Industry Report. Replaces the 7-tool stack with one flat
          subscription. No per-user fees. Ever.
        </p>
      </div>
    </section>
  );
}
