"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  Receipt,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type PaymentLinkInvoice = {
  id: string;
  number: string;
  description: string;
  serviceDate: string;
  amount: number;
  amountLabel: string;
  dueLabel: string;
};

type PaymentLinkProps = {
  invoice: PaymentLinkInvoice;
  customerEmail: string;
};

/**
 * A Stripe-flavored "Pay invoice" row. Clicking [Pay now] opens an in-page
 * modal that mimics a Payment Element + Pay button. No real payments — the
 * confirm button transitions through a fake loading state to a success state.
 */
export function PaymentLink({ invoice, customerEmail }: PaymentLinkProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-pitch/10 bg-bone/60 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-serif text-base font-semibold tracking-[-0.01em] text-forest">
              {invoice.description}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-stone">
              {invoice.number}
            </span>
          </div>
          <div className="mt-1 text-[13px] text-stone">
            Service date {invoice.serviceDate} · {invoice.dueLabel}
          </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-none">
          <span className="font-serif text-xl font-semibold text-forest">
            {invoice.amountLabel}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-pitch px-4 py-2 text-sm font-semibold text-parchment transition-colors hover:bg-slate-deep"
          >
            <CreditCard className="h-4 w-4" />
            Pay now
          </button>
        </div>
      </div>

      {open && (
        <PaymentModal
          invoice={invoice}
          customerEmail={customerEmail}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

type PaymentModalProps = PaymentLinkProps & { onClose: () => void };

function PaymentModal({ invoice, customerEmail, onClose }: PaymentModalProps) {
  const [stage, setStage] = useState<"form" | "processing" | "success">("form");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stage !== "processing") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, stage]);

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (stage !== "form") return;
    setStage("processing");
    // Fake processing window — purely visual.
    setTimeout(() => setStage("success"), 1400);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-pitch/40 px-3 py-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Pay invoice"
      onClick={() => stage !== "processing" && onClose()}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-paper shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header strip */}
        <div className="flex items-center justify-between border-b border-pitch/10 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2 text-[13px] font-medium text-forest">
            <Lock className="h-3.5 w-3.5 text-forest/70" />
            Secure checkout
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={stage === "processing"}
            className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-forest/70 transition-colors hover:bg-bone hover:text-forest disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {stage === "success" ? (
          <SuccessView
            invoice={invoice}
            customerEmail={customerEmail}
            onClose={onClose}
          />
        ) : (
          <form onSubmit={handlePay} className="px-5 py-5">
            <div className="rounded-xl bg-bone p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
                {invoice.number}
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <div className="font-serif text-base font-semibold text-forest">
                  {invoice.description}
                </div>
                <div className="font-serif text-xl font-semibold text-forest">
                  {invoice.amountLabel}
                </div>
              </div>
              <div className="mt-1 text-[12px] text-stone">
                Service {invoice.serviceDate} · {invoice.dueLabel}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Field label="Email">
                <input
                  type="email"
                  defaultValue={customerEmail}
                  className="block w-full rounded-lg border border-pitch/15 bg-white px-3 py-2 text-sm text-forest outline-none focus:border-forest focus:ring-1 focus:ring-forest"
                  disabled={stage === "processing"}
                />
              </Field>
              <Field label="Card number">
                <div className="flex items-center gap-2 rounded-lg border border-pitch/15 bg-white px-3 py-2">
                  <CreditCard className="h-4 w-4 text-forest/50" />
                  <input
                    type="text"
                    defaultValue="4242 4242 4242 4242"
                    className="block w-full bg-transparent text-sm text-forest outline-none"
                    disabled={stage === "processing"}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                    Visa
                  </span>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry">
                  <input
                    type="text"
                    defaultValue="04 / 28"
                    className="block w-full rounded-lg border border-pitch/15 bg-white px-3 py-2 text-sm text-forest outline-none focus:border-forest focus:ring-1 focus:ring-forest"
                    disabled={stage === "processing"}
                  />
                </Field>
                <Field label="CVC">
                  <input
                    type="text"
                    defaultValue="123"
                    className="block w-full rounded-lg border border-pitch/15 bg-white px-3 py-2 text-sm text-forest outline-none focus:border-forest focus:ring-1 focus:ring-forest"
                    disabled={stage === "processing"}
                  />
                </Field>
              </div>
              <Field label="Name on card">
                <input
                  type="text"
                  defaultValue="Sarah Mitchell"
                  className="block w-full rounded-lg border border-pitch/15 bg-white px-3 py-2 text-sm text-forest outline-none focus:border-forest focus:ring-1 focus:ring-forest"
                  disabled={stage === "processing"}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={stage === "processing"}
              className={cn(
                "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-pitch px-4 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-slate-deep disabled:opacity-80"
              )}
            >
              {stage === "processing" ? (
                <>
                  <Spinner /> Processing…
                </>
              ) : (
                <>Pay {invoice.amountLabel}</>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-stone">
              <ShieldCheck className="h-3.5 w-3.5 text-forest/50" />
              Secured by Stripe · sandbox preview · no charge will occur
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SuccessView({
  invoice,
  customerEmail,
  onClose,
}: {
  invoice: PaymentLinkInvoice;
  customerEmail: string;
  onClose: () => void;
}) {
  return (
    <div className="px-5 py-7 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-champagne/20 text-champagne">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-serif text-xl font-semibold text-forest">
        Payment received
      </h3>
      <p className="mt-2 text-[13px] text-stone">
        {invoice.amountLabel} for {invoice.description}
      </p>
      <div className="mx-auto mt-5 flex items-center justify-center gap-1.5 rounded-full bg-bone px-3 py-1.5 text-[12px] text-forest/80">
        <Receipt className="h-3.5 w-3.5" />
        Receipt sent to {customerEmail}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-pitch px-4 py-2.5 text-sm font-semibold text-parchment transition-colors hover:bg-slate-deep"
      >
        Done
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-parchment/30 border-t-parchment"
    />
  );
}
