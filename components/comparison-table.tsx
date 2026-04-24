import { Check, Minus } from "lucide-react";
import { COMPARISON_ROWS, type ComparisonRow } from "@/content/comparison";
import { cn } from "@/lib/cn";

function YesNoCell({
  value,
  label,
  featured,
}: {
  value: boolean | "partial";
  label: string;
  featured?: boolean;
}) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-2 text-sm">
        <Check
          className={cn(
            "h-4 w-4 flex-none",
            featured ? "text-lime-bright" : "text-moss-bright"
          )}
        />
        <span className={featured ? "text-bone" : "text-bone/75"}>{label}</span>
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-bone/55">
        <span className="h-1 w-3 flex-none rounded-full bg-bone/30" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-sm text-bone/40">
      <Minus className="h-4 w-4 flex-none" />
      {label}
    </span>
  );
}

function AiCell({
  v,
  featured,
}: {
  v: ComparisonRow["aiNative"];
  featured?: boolean;
}) {
  const label = v === "yes" ? "Native" : v === "partial" ? "Bolted on" : "No";
  const value = v === "yes" ? true : v === "partial" ? "partial" : false;
  return <YesNoCell value={value} label={label} featured={featured} />;
}

function ComplianceCell({
  v,
  featured,
}: {
  v: ComparisonRow["compliance"];
  featured?: boolean;
}) {
  const label =
    v === "full" ? "Built in" : v === "partial" ? "Logging only" : "None";
  const value = v === "full" ? true : v === "partial" ? "partial" : false;
  return <YesNoCell value={value} label={label} featured={featured} />;
}

function MarketplaceCell({
  v,
  featured,
}: {
  v: ComparisonRow["marketplace"];
  featured?: boolean;
}) {
  const value = v === "yes";
  return (
    <YesNoCell
      value={value}
      label={value ? "Surplus Yard" : "—"}
      featured={featured}
    />
  );
}

type ComparisonTableProps = {
  /** When true, renders without the section wrapper (for embedding inside cards). */
  bare?: boolean;
};

export function ComparisonTable({ bare = false }: ComparisonTableProps) {
  const table = (
    <div className="overflow-x-auto rounded-2xl border border-bone/10 bg-forest-mid/40">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-bone/10 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/50">
            <th className="px-5 py-4">Vendor</th>
            <th className="px-5 py-4">Price</th>
            <th className="px-5 py-4">AI-native</th>
            <th className="px-5 py-4">Compliance</th>
            <th className="px-5 py-4">Marketplace</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((r) => (
            <tr
              key={r.vendor}
              className={cn(
                "border-t border-bone/5 transition-colors",
                r.featured
                  ? "bg-gradient-to-r from-moss/[0.08] to-transparent"
                  : "hover:bg-bone/[0.02]"
              )}
              style={
                r.featured
                  ? { boxShadow: "inset 3px 0 0 0 #9DFF8A" }
                  : undefined
              }
            >
              <td className="px-5 py-5 align-top">
                <span
                  className={cn(
                    "text-sm font-medium",
                    r.featured ? "text-bone" : "text-bone/85"
                  )}
                >
                  {r.vendor}
                </span>
              </td>
              <td className="px-5 py-5 align-top">
                <span
                  className={cn(
                    "text-sm",
                    r.featured ? "text-bone" : "text-bone/65"
                  )}
                >
                  {r.price}
                </span>
              </td>
              <td className="px-5 py-5 align-top">
                <AiCell v={r.aiNative} featured={r.featured} />
              </td>
              <td className="px-5 py-5 align-top">
                <ComplianceCell v={r.compliance} featured={r.featured} />
              </td>
              <td className="px-5 py-5 align-top">
                <MarketplaceCell v={r.marketplace} featured={r.featured} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (bare) return table;

  return (
    <section className="border-t border-bone/10 bg-forest-deep py-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-moss-bright">
          Compare
        </p>
        <h2 className="mx-auto max-w-3xl text-center font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
          What you&apos;re paying now vs. what GladiusTurf costs.
        </h2>
        <div className="mt-12">{table}</div>
        <p className="mt-6 text-center text-[12px] leading-[1.5] text-bone/45">
          Public pricing, Capterra reviews, Aspire 2026 Commercial Landscape
          Industry Report. Replaces the 7-tool stack with one flat subscription.
        </p>
      </div>
    </section>
  );
}
