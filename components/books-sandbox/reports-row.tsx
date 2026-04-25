"use client";

import { useState } from "react";
import { CheckCircle2, Download, FileText } from "lucide-react";
import { REPORTS } from "@/content/books-demo-data";

export function ReportsRow() {
  const [toast, setToast] = useState<string | null>(null);

  const handleClick = (name: string, format: string) => {
    setToast(`Generated · ${name}.${format.toLowerCase()} · sandbox`);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <section
      id="reports"
      aria-labelledby="reports-heading"
      className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 md:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-champagne-bright">
            Reports & exports
          </span>
          <h2
            id="reports-heading"
            className="mt-2 font-serif text-xl font-semibold tracking-[-0.01em] text-bone md:text-2xl"
          >
            One-click exports for the bank, the bookkeeper, the IRS
          </h2>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/40">
          Live · regenerated on demand
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            onClick={() => handleClick(r.name, r.format)}
            className="group flex items-center gap-3 rounded-xl border border-bone/10 bg-bone/[0.02] p-4 text-left transition-colors hover:border-champagne hover:bg-champagne/[0.04]"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-bone/10 bg-bone/[0.04] text-bone/65 transition-colors group-hover:border-champagne/40 group-hover:text-champagne-bright">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium text-bone">
                {r.name}
              </div>
              <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-bone/45">
                Export · {r.format}
              </div>
            </div>
            <Download className="h-3.5 w-3.5 flex-none text-bone/35 transition-colors group-hover:text-champagne-bright" />
          </button>
        ))}
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-champagne/40 bg-pitch/95 px-4 py-2 text-[12px] text-champagne-bright shadow-pop"
        >
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {toast}
          </span>
        </div>
      )}
    </section>
  );
}
