"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Landmark,
  Loader2,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import {
  CREW_ROWS,
  FUND_TOTAL,
  NET_DEPOSIT_TOTAL,
  PAY_PERIOD,
  STUB_PREVIEW,
  TAX_TOTAL,
} from "@/content/payroll-demo-data";
import { cn } from "@/lib/cn";

type Step = "review" | "deposits" | "confirm" | "running" | "success";

const STEP_ORDER: Step[] = ["review", "deposits", "confirm"];

function fmtMoney(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function fmtMoneyCents(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function RunPayrollModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("review");

  useEffect(() => {
    if (open) setStep("review");
  }, [open]);

  // Block body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc closes (but not while running)
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && step !== "running") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, onClose]);

  if (!open) return null;

  function next() {
    if (step === "review") setStep("deposits");
    else if (step === "deposits") setStep("confirm");
  }

  function back() {
    if (step === "deposits") setStep("review");
    else if (step === "confirm") setStep("deposits");
  }

  function fire() {
    setStep("running");
    setTimeout(() => setStep("success"), 1100);
  }

  const stepIndex = STEP_ORDER.includes(step as (typeof STEP_ORDER)[number])
    ? STEP_ORDER.indexOf(step as (typeof STEP_ORDER)[number])
    : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Run payroll"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-pitch/70 backdrop-blur-sm"
        onClick={() => step !== "running" && onClose()}
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-bone/15 bg-slate-deep text-bone shadow-pop-champagne">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-bone/10 px-6 py-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/45">
              Run payroll · {PAY_PERIOD.label}
            </div>
            <h3 className="mt-1 font-serif text-xl font-semibold tracking-[-0.01em] text-bone">
              {step === "running"
                ? "Running payroll..."
                : step === "success"
                  ? "Payroll fired"
                  : titleForStep(step)}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => step !== "running" && onClose()}
            disabled={step === "running"}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-bone/15 bg-bone/[0.03] text-bone/65 transition-colors hover:bg-bone/[0.07] hover:text-bone disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stepper (visible for the 3 review steps) */}
        {STEP_ORDER.includes(step as (typeof STEP_ORDER)[number]) && (
          <div className="flex items-center gap-2 border-b border-bone/10 bg-bone/[0.02] px-6 py-3">
            {STEP_ORDER.map((s, i) => {
              const reached = i <= stepIndex;
              return (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-semibold",
                      reached
                        ? "bg-champagne text-pitch"
                        : "border border-bone/15 bg-transparent text-bone/45"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-[0.16em]",
                      reached ? "text-bone" : "text-bone/45"
                    )}
                  >
                    {labelForStep(s)}
                  </span>
                  {i < STEP_ORDER.length - 1 && (
                    <span className="mx-1 h-px w-8 bg-bone/15" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
          {step === "review" && <ReviewBody />}
          {step === "deposits" && <DepositsBody />}
          {step === "confirm" && <ConfirmBody />}
          {step === "running" && <RunningBody />}
          {step === "success" && <SuccessBody />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-bone/10 bg-bone/[0.02] px-6 py-4">
          {step !== "running" && step !== "success" && (
            <>
              <button
                type="button"
                onClick={back}
                disabled={step === "review"}
                className="inline-flex items-center gap-1.5 rounded-full border border-bone/15 bg-bone/[0.03] px-4 py-2 text-xs font-semibold text-bone/85 transition-colors hover:bg-bone/[0.07] hover:text-bone disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </button>
              {step !== "confirm" ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-1.5 rounded-full bg-champagne px-5 py-2 text-xs font-semibold text-pitch transition-colors hover:bg-champagne-bright"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={fire}
                  className="inline-flex items-center gap-1.5 rounded-full bg-champagne px-5 py-2 text-xs font-semibold text-pitch transition-colors hover:bg-champagne-bright"
                >
                  <Play className="h-3.5 w-3.5" />
                  Run payroll
                </button>
              )}
            </>
          )}
          {step === "running" && (
            <div className="mx-auto inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone/55">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Submitting to Stripe Connect...
            </div>
          )}
          {step === "success" && (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-moss px-5 py-2 text-xs font-semibold text-pitch transition-colors hover:bg-moss-bright"
            >
              Back to dashboard
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function titleForStep(s: Step): string {
  switch (s) {
    case "review":
      return "Review summary";
    case "deposits":
      return "Confirm direct deposit accounts";
    case "confirm":
      return "Final confirmation";
    default:
      return "";
  }
}

function labelForStep(s: Step): string {
  switch (s) {
    case "review":
      return "Review";
    case "deposits":
      return "Deposits";
    case "confirm":
      return "Confirm";
    default:
      return "";
  }
}

function ReviewBody() {
  return (
    <div className="space-y-5">
      <p className="text-[13.5px] leading-[1.65] text-bone/70">
        Confirm the totals below match your expectations. Hours are pulled from
        Field Crew App GPS clock-ins and approved by your foreman swipe.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Crew" value={String(PAY_PERIOD.crewCount)} />
        <Stat label="Hours" value={PAY_PERIOD.totalHours.toLocaleString()} />
        <Stat label="Gross" value={fmtMoney(PAY_PERIOD.totalGross)} />
        <Stat label="Net deposits" value={fmtMoney(NET_DEPOSIT_TOTAL)} accent />
      </div>

      <div className="rounded-xl border border-bone/10 bg-bone/[0.02] p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/45">
          Sample stub preview · 3 of 12
        </div>
        <table className="mt-3 w-full text-left text-[12px]">
          <thead className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/45">
            <tr>
              <th className="py-1.5 font-semibold">Crew</th>
              <th className="py-1.5 text-right font-semibold">Gross</th>
              <th className="py-1.5 text-right font-semibold">Fed</th>
              <th className="py-1.5 text-right font-semibold">State</th>
              <th className="py-1.5 text-right font-semibold">FICA</th>
              <th className="py-1.5 text-right font-semibold">Net</th>
            </tr>
          </thead>
          <tbody className="text-bone/85">
            {STUB_PREVIEW.map((s) => (
              <tr key={s.id} className="border-t border-bone/[0.06]">
                <td className="py-2 font-serif text-[13px] text-bone">
                  {s.name}
                </td>
                <td className="py-2 text-right font-mono">
                  {fmtMoneyCents(s.gross)}
                </td>
                <td className="py-2 text-right font-mono text-bone/55">
                  -{fmtMoneyCents(s.fedTax)}
                </td>
                <td className="py-2 text-right font-mono text-bone/55">
                  -{fmtMoneyCents(s.stateTax)}
                </td>
                <td className="py-2 text-right font-mono text-bone/55">
                  -{fmtMoneyCents(s.fica)}
                </td>
                <td className="py-2 text-right font-mono text-champagne-bright">
                  {fmtMoneyCents(s.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-champagne/25 bg-champagne/5 p-3 text-[12px] text-bone/75">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-none text-champagne-bright" />
        <span>
          Total to fund: <strong>{fmtMoney(FUND_TOTAL)}</strong> · Net to crew:{" "}
          <strong>{fmtMoney(NET_DEPOSIT_TOTAL)}</strong> · Taxes withheld:{" "}
          <strong>{fmtMoney(TAX_TOTAL)}</strong>
        </span>
      </div>
    </div>
  );
}

function DepositsBody() {
  // Show direct-deposit destinations for the 12 crew, last-4 only
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] leading-[1.65] text-bone/70">
        Stripe Connect Express has verified the bank accounts below. Subcontractor
        ACH routes through 1099 vendor accounts. We&apos;ll never display full
        account numbers.
      </p>

      <ul className="divide-y divide-bone/[0.06] rounded-xl border border-bone/10 bg-bone/[0.02]">
        {CREW_ROWS.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 px-4 py-3 text-[12.5px]"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-bone/[0.05] font-mono text-[10px] font-semibold text-bone/70">
                {r.firstName.charAt(0)}
                {r.lastName.charAt(0)}
              </span>
              <div>
                <div className="font-serif text-[13.5px] font-semibold text-bone">
                  {r.firstName} {r.lastName}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/45">
                  {r.type === "w2" ? "W-2 · ACH" : "1099 · ACH"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <span className="font-mono text-[11px] text-bone/55">
                {r.routingLast4 === "—"
                  ? "Vendor ACH"
                  : `••• ${r.routingLast4} / ••• ${r.accountLast4}`}
              </span>
              <CheckCircle2 className="h-4 w-4 text-moss-bright" />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-start gap-2 rounded-xl border border-bone/10 bg-bone/[0.02] p-3 text-[12px] text-bone/65">
        <Landmark className="mt-0.5 h-3.5 w-3.5 flex-none text-bone/55" />
        <span>
          Funds debited from operating account ending ••• 4421. Lands in crew
          accounts on{" "}
          <strong className="text-bone">{PAY_PERIOD.depositLands}</strong>.
        </span>
      </div>
    </div>
  );
}

function ConfirmBody() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-champagne/30 bg-champagne/5 p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-champagne-bright">
          You&apos;re about to fire payroll
        </div>
        <h4 className="mt-2 font-serif text-2xl font-semibold tracking-[-0.01em] text-bone">
          {fmtMoney(PAY_PERIOD.totalGross)} gross · 12 crew · 4 states
        </h4>
        <p className="mt-2 text-[13px] leading-[1.6] text-bone/70">
          Direct deposit lands {PAY_PERIOD.depositLands}. Tax filings auto-prepped
          for FL / GA / TX / NC. 11 W-2 stubs and 3 1099-NEC interim packets queue
          inside the Field Crew App.
        </p>
      </div>
      <ul className="space-y-2 text-[12.5px] text-bone/70">
        <ConfirmLine label="Funds debited">
          {fmtMoney(FUND_TOTAL)} from operating ••• 4421
        </ConfirmLine>
        <ConfirmLine label="Net deposits">
          {fmtMoney(NET_DEPOSIT_TOTAL)} to 12 crew accounts
        </ConfirmLine>
        <ConfirmLine label="Taxes withheld">
          {fmtMoney(TAX_TOTAL)} routed to fed + state filings
        </ConfirmLine>
        <ConfirmLine label="Audit trail">
          GPS records archived · 7-year DOL retention
        </ConfirmLine>
      </ul>
      <p className="text-[11px] italic text-bone/45">
        Sandbox preview — no actual funds will move.
      </p>
    </div>
  );
}

function RunningBody() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <Loader2 className="h-10 w-10 animate-spin text-champagne-bright" />
      <div className="text-center">
        <h4 className="font-serif text-lg font-semibold text-bone">
          Filing taxes · queuing direct deposits
        </h4>
        <p className="mt-1 text-[12.5px] text-bone/55">
          Posting journal entries to Books · syncing QuickBooks
        </p>
      </div>
    </div>
  );
}

function SuccessBody() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-moss/40 bg-moss/15 text-moss-bright">
          <CircleCheck className="h-6 w-6" />
        </span>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-moss-bright">
            Payroll · success
          </div>
          <h4 className="mt-1 font-serif text-2xl font-semibold tracking-[-0.01em] text-bone">
            Direct deposit scheduled
          </h4>
        </div>
      </div>
      <ul className="space-y-2 rounded-xl border border-bone/10 bg-bone/[0.02] p-4 text-[13px]">
        <SuccessLine>12 paystubs queued in the Field Crew App</SuccessLine>
        <SuccessLine>4 state tax filings auto-prepped (FL/GA/TX/NC)</SuccessLine>
        <SuccessLine>
          Federal 941 deposit scheduled · {fmtMoney(TAX_TOTAL)} held in escrow
        </SuccessLine>
        <SuccessLine>
          Books journal entries posted · QuickBooks synced
        </SuccessLine>
      </ul>
      <div className="rounded-xl border border-bone/10 bg-pitch/40 px-4 py-3 font-mono text-[11px] text-bone/55">
        Run ID: <span className="text-champagne-bright">PR-2026-04-27-A</span> ·
        Receipt emailed to owner@greenleafcrew.com
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-bone/10 bg-bone/[0.02] p-3">
      <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-bone/45">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-serif text-xl font-semibold tracking-[-0.01em]",
          accent ? "text-champagne-bright" : "text-bone"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ConfirmLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-bone/[0.06] pb-2 last:border-b-0 last:pb-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone/45">
        {label}
      </span>
      <span className="font-mono text-bone/85">{children}</span>
    </li>
  );
}

function SuccessLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-bone/80">
      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-moss-bright" />
      <span>{children}</span>
    </li>
  );
}
