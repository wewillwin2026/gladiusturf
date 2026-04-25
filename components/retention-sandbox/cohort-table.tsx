import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { COHORTS } from "@/content/retention-demo-data";

const fmt = new Intl.NumberFormat("en-US");

function pillFor(retentionPct: number) {
  if (retentionPct >= 85) {
    return "border-moss/30 bg-moss/10 text-moss-bright";
  }
  if (retentionPct >= 70) {
    return "border-champagne/30 bg-champagne/10 text-champagne-bright";
  }
  return "border-honey/30 bg-honey/10 text-honey-bright";
}

export function CohortTable() {
  return (
    <div className="rounded-2xl border border-bone/10 bg-obsidian/60 shadow-pop">
      <div className="flex items-center justify-between border-b border-bone/10 px-5 py-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/45">
            Cohort retention · Customer Worth feed
          </div>
          <h3 className="mt-1 font-serif text-lg font-semibold tracking-tight text-bone">
            Five quarters. The customers you kept.
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bone/10 text-[10px] uppercase tracking-[0.18em] text-bone/45">
              <th scope="col" className="px-5 py-3 font-medium">Cohort</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Started</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Retained</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Walked</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Retention</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Customer Worth (avg)</th>
            </tr>
          </thead>
          <tbody>
            {COHORTS.map((c) => {
              const pct = Math.round((c.retained / c.customers) * 100);
              return (
                <tr
                  key={c.cohort}
                  className="border-b border-bone/[0.06] last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <span className="font-serif text-[15px] text-bone">
                      {c.cohort}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right font-mono text-bone/85">
                    {c.customers}
                  </td>
                  <td className="px-3 py-4 text-right font-mono text-bone/85">
                    {c.retained}
                  </td>
                  <td className="px-3 py-4 text-right font-mono text-bone/55">
                    {c.walked}
                  </td>
                  <td className="px-3 py-4 text-right">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[11px] ${pillFor(pct)}`}
                    >
                      {pct}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-champagne-bright">
                    ${fmt.format(c.customerWorth)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bone/10 px-5 py-4 text-[12px] text-bone/55">
        <span>
          Cohort data feeds <span className="text-bone/85">Customer Worth</span> (engine 33).
        </span>
        <Link
          href="/retention#customer-worth"
          className="inline-flex items-center gap-1.5 text-champagne-bright transition-colors hover:text-champagne"
        >
          Open Customer Worth
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
