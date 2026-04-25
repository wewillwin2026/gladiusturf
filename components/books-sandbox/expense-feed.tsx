"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  EXPENSE_FEED,
  formatUsdCents,
  type ExpenseEntry,
} from "@/content/books-demo-data";

const CATEGORY_OPTIONS: ExpenseEntry["category"][] = [
  "Fuel",
  "Materials",
  "Equipment",
  "Subcontractor",
];

function categoryClass(cat: ExpenseEntry["category"]): string {
  switch (cat) {
    case "Fuel":
      return "border-moss/30 text-moss-bright bg-moss/5";
    case "Materials":
      return "border-champagne/30 text-champagne-bright bg-champagne/5";
    case "Equipment":
      return "border-honey/30 text-honey-bright bg-honey/5";
    case "Subcontractor":
      return "border-lime/30 text-lime-bright bg-lime/5";
  }
}

export function ExpenseFeed() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [pickedCategory, setPickedCategory] = useState<
    ExpenseEntry["category"] | null
  >(null);

  const openEntry = useMemo(
    () => EXPENSE_FEED.find((e) => e.id === openId) ?? null,
    [openId]
  );

  const handleOpen = (id: string) => {
    setOpenId(id);
    setPickedCategory(null);
  };

  const handleConfirm = () => {
    if (!openEntry || !pickedCategory) return;
    setConfirmedIds((prev) => new Set(prev).add(openEntry.id));
    setOpenId(null);
    setPickedCategory(null);
    setToast(`Categorized · ${openEntry.vendor} → ${pickedCategory}`);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleClose = () => {
    setOpenId(null);
    setPickedCategory(null);
  };

  return (
    <section
      id="expenses"
      aria-labelledby="expenses-heading"
      className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 md:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-champagne-bright">
            Expense Brain · live feed
          </span>
          <h2
            id="expenses-heading"
            className="mt-2 font-serif text-xl font-semibold tracking-[-0.01em] text-bone md:text-2xl"
          >
            Today&apos;s receipts — auto-categorized at the pump
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne/30 bg-champagne/[0.06] px-3 py-1.5 text-[12px] text-champagne-bright">
          <Sparkles className="h-3.5 w-3.5" />
          AI categorized 97% · 4 hrs saved this week
        </span>
      </div>

      <ul className="mt-6 divide-y divide-bone/10">
        {EXPENSE_FEED.map((e) => {
          const reviewed = confirmedIds.has(e.id);
          const status: ExpenseEntry["status"] = reviewed ? "Posted" : e.status;
          return (
            <li
              key={e.id}
              className="grid grid-cols-[40px_1fr_auto] items-center gap-4 py-3.5 md:grid-cols-[40px_1fr_auto_auto] md:gap-5"
            >
              {/* Photo thumbnail */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-bone/10 bg-bone/[0.05]">
                <Receipt className="h-4 w-4 text-bone/45" />
              </div>

              {/* Vendor + chip + job */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-[14px] font-medium text-bone">
                    {e.vendor}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px]",
                      categoryClass(e.category)
                    )}
                  >
                    {e.category}
                    <span className="text-bone/40">({e.confidence}%)</span>
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-bone/45">
                  <span>{e.capturedAt}</span>
                  <span className="text-bone/25">·</span>
                  <span className="truncate">{e.jobMatch}</span>
                  {status === "Posted" && (
                    <>
                      <span className="text-bone/25">·</span>
                      <span className="truncate text-bone/55">
                        {e.account}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-right font-mono text-[14px] font-semibold text-bone">
                {formatUsdCents(e.amount)}
              </div>

              {/* Status — full row on mobile */}
              <div className="col-span-3 md:col-span-1">
                {status === "Posted" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-moss/25 bg-moss/[0.06] px-2.5 py-1 font-mono text-[10.5px] text-moss-bright">
                    <CheckCircle2 className="h-3 w-3" />
                    Posted to GL
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpen(e.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-champagne/40 bg-champagne/[0.08] px-2.5 py-1 font-mono text-[10.5px] text-champagne-bright transition-colors hover:bg-champagne/[0.14]"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Needs review
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Modal */}
      {openEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <div
            className="absolute inset-0 bg-pitch/80 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden
          />
          <div className="relative w-full max-w-md rounded-2xl border border-bone/15 bg-obsidian p-6 shadow-pop md:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-champagne-bright">
                  Review · uncategorized
                </span>
                <h3
                  id="review-modal-title"
                  className="mt-2 font-serif text-lg font-semibold tracking-tight text-bone"
                >
                  {openEntry.vendor}
                </h3>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="-mr-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg text-bone/55 transition-colors hover:bg-bone/[0.06] hover:text-bone"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Receipt preview */}
            <div className="mt-5 rounded-lg border border-bone/15 bg-bone/[0.03] p-4 font-mono text-[10.5px] leading-[1.4] text-bone/55">
              <div className="font-semibold text-bone/80">
                {openEntry.vendor.toUpperCase()}
              </div>
              <div className="mt-0.5 text-bone/45">
                {openEntry.capturedAt} · 2026-04-24
              </div>
              <div className="my-2 h-px bg-bone/15" />
              <div className="flex justify-between">
                <span>{openEntry.jobMatch}</span>
                <span className="text-bone/80">
                  {formatUsdCents(openEntry.amount)}
                </span>
              </div>
              <div className="my-2 h-px bg-bone/15" />
              <div className="flex justify-between text-bone/85">
                <span>TOTAL</span>
                <span>{formatUsdCents(openEntry.amount)}</span>
              </div>
              <div className="mt-1 text-bone/35">
                Confidence dropped to {openEntry.confidence}% — pick a category.
              </div>
            </div>

            {/* Category options */}
            <div className="mt-5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/45">
                Pick a category
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const active = pickedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setPickedCategory(cat)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-[13px] transition-colors",
                        active
                          ? "border-champagne/60 bg-champagne/[0.10] text-champagne-bright"
                          : "border-bone/15 bg-bone/[0.02] text-bone/75 hover:border-bone/30 hover:text-bone"
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={handleClose}
                className="rounded-full border border-bone/15 bg-bone/[0.02] px-4 py-2 text-xs font-medium text-bone/70 transition-colors hover:bg-bone/[0.06] hover:text-bone"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!pickedCategory}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                  pickedCategory
                    ? "bg-champagne text-pitch hover:bg-champagne-bright"
                    : "cursor-not-allowed bg-bone/10 text-bone/40"
                )}
              >
                Confirm & post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-moss/30 bg-pitch/95 px-4 py-2 text-[12px] text-moss-bright shadow-pop"
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
