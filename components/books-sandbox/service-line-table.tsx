"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  SERVICE_LINES,
  formatUsdShort,
  type ServiceLineRow,
} from "@/content/books-demo-data";

type SortKey = "name" | "revenue" | "cost" | "marginPct";
type SortDir = "asc" | "desc";

const HEADERS: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: "name", label: "Service line", numeric: false },
  { key: "revenue", label: "Revenue", numeric: true },
  { key: "cost", label: "Cost", numeric: true },
  { key: "marginPct", label: "Margin", numeric: true },
];

function marginToneClass(pct: number): string {
  if (pct >= 30) return "text-moss-bright";
  if (pct >= 20) return "text-champagne-bright";
  return "text-bone";
}

export function ServiceLineTable() {
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const rows = useMemo<ServiceLineRow[]>(() => {
    const sorted = [...SERVICE_LINES].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return sorted;
  }, [sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  return (
    <section
      id="service-lines"
      aria-labelledby="service-lines-heading"
      className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 md:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-champagne-bright">
            Service-line P&amp;L
          </span>
          <h2
            id="service-lines-heading"
            className="mt-2 font-serif text-xl font-semibold tracking-[-0.01em] text-bone md:text-2xl"
          >
            Mowing vs hardscape vs snow — broken out automatically
          </h2>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/40">
          5 lines · YTD
        </span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-bone/10">
              {HEADERS.map((h) => {
                const active = sortKey === h.key;
                return (
                  <th
                    key={h.key}
                    scope="col"
                    className={cn(
                      "py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/50",
                      h.numeric && "text-right"
                    )}
                  >
                    <button
                      onClick={() => toggleSort(h.key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 transition-colors hover:text-bone",
                        active && "text-champagne-bright",
                        h.numeric && "flex-row-reverse"
                      )}
                    >
                      {h.label}
                      {active &&
                        (sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.name}
                className="border-b border-bone/10 last:border-b-0"
              >
                <td className="py-3.5 text-[14px] text-bone/85">{r.name}</td>
                <td className="py-3.5 text-right font-mono text-[13px] text-bone/85">
                  {formatUsdShort(r.revenue)}
                </td>
                <td className="py-3.5 text-right font-mono text-[13px] text-bone/55">
                  {formatUsdShort(r.cost)}
                </td>
                <td
                  className={cn(
                    "py-3.5 text-right font-mono text-[13px] font-semibold",
                    marginToneClass(r.marginPct)
                  )}
                >
                  {r.marginPct}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-bone/40">
                Total
              </td>
              <td className="pt-4 text-right font-mono text-[13px] font-semibold text-bone">
                {formatUsdShort(
                  SERVICE_LINES.reduce((s, r) => s + r.revenue, 0)
                )}
              </td>
              <td className="pt-4 text-right font-mono text-[13px] text-bone/55">
                {formatUsdShort(SERVICE_LINES.reduce((s, r) => s + r.cost, 0))}
              </td>
              <td className="pt-4 text-right font-mono text-[13px] font-semibold text-champagne-bright">
                25.5%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
