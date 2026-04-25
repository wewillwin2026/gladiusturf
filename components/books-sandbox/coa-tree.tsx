"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { COA, formatUsdShort } from "@/content/books-demo-data";

export function CoaTree() {
  const [openSet, setOpenSet] = useState<Set<string>>(
    new Set([COA[0]?.number ?? ""])
  );

  const toggle = (num: string) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  return (
    <section
      id="coa"
      aria-labelledby="coa-heading"
      className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 md:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-champagne-bright">
            Chart of accounts
          </span>
          <h2
            id="coa-heading"
            className="mt-2 font-serif text-xl font-semibold tracking-[-0.01em] text-bone md:text-2xl"
          >
            Pre-built for landscape ops
          </h2>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/40">
          4 sections · 14 sub-accounts
        </span>
      </div>

      <ul className="mt-6 divide-y divide-bone/10">
        {COA.map((node) => {
          const open = openSet.has(node.number);
          return (
            <li key={node.number}>
              <button
                onClick={() => toggle(node.number)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:bg-bone/[0.02]"
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 flex-none text-bone/45 transition-transform duration-200",
                    open && "rotate-90"
                  )}
                />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/50">
                  {node.number}
                </span>
                <span className="text-[14px] font-medium text-bone">
                  {node.name}
                </span>
                <span className="ml-auto font-mono text-[13px] text-bone/85">
                  {formatUsdShort(
                    node.children.reduce((s, c) => s + c.ytd, 0)
                  )}
                </span>
              </button>

              {open && (
                <ul className="mb-2 ml-11 space-y-1 border-l border-bone/10 pl-4">
                  {node.children.map((c) => (
                    <li
                      key={c.number}
                      className="flex items-center gap-3 py-1.5"
                    >
                      <span className="font-mono text-[11px] text-bone/45">
                        {c.number}
                      </span>
                      <span className="text-[13px] text-bone/75">
                        {c.name}
                      </span>
                      <span className="ml-auto font-mono text-[12px] text-bone/65">
                        {formatUsdShort(c.ytd)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
