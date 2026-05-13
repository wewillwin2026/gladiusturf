"use client";

import * as React from "react";
import { CircleCheck, Loader2, Plus } from "lucide-react";
import { createReferral } from "../actions";

type CustomerOption = { id: string; name: string };

export function NewReferralForm({
  customers,
}: {
  customers: CustomerOption[];
}) {
  const [open, setOpen] = React.useState(customers.length > 0 && open0());
  const [pending, startTransition] = React.useTransition();
  const [ok, setOk] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <div className="g-card overflow-hidden">
      <header className="flex items-center justify-between border-b border-g-border-subtle px-5 py-3">
        <h2 className="text-[13px] text-g-text">Log a referral</h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-g-border bg-g-surface-2 px-3 py-1.5 text-[11px] font-medium text-g-text transition-colors hover:bg-g-surface-3"
        >
          {open ? "Cancel" : "Log"}
        </button>
      </header>
      {open && (
        <form
          ref={formRef}
          action={(fd) => {
            setError(null);
            setOk(false);
            startTransition(async () => {
              const res = await createReferral(fd);
              if ("error" in res) setError(res.error);
              else {
                setOk(true);
                formRef.current?.reset();
              }
            });
          }}
          className="grid gap-3 px-5 py-4 md:grid-cols-3"
        >
          <label className="flex flex-col gap-1 md:col-span-3">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Referring customer
            </span>
            <select
              name="referrerCustomerId"
              required
              defaultValue=""
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            >
              <option value="" disabled>
                Pick a customer
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Referred name
            </span>
            <input
              type="text"
              name="referredName"
              placeholder="Mike Foster"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Referred phone
            </span>
            <input
              type="tel"
              name="referredPhone"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Referred email
            </span>
            <input
              type="email"
              name="referredEmail"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Reward (USD)
            </span>
            <input
              type="number"
              name="rewardCents"
              step="5"
              min="0"
              max="2000"
              placeholder="50"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Reward kind
            </span>
            <select
              name="rewardKind"
              defaultValue=""
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            >
              <option value="">—</option>
              <option value="credit">Account credit</option>
              <option value="cash">Cash</option>
              <option value="gift_card">Gift card</option>
              <option value="free_visit">Free visit</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 md:col-span-3">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Notes
            </span>
            <input
              type="text"
              name="notes"
              placeholder="Mentioned in a Google review on May 4"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <div className="flex items-center gap-3 md:col-span-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-g-accent px-4 py-2 text-[12px] font-semibold text-g-bg transition-colors hover:bg-g-accent-bright disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {pending ? "Logging..." : "Log referral"}
            </button>
            {ok && (
              <span className="inline-flex items-center gap-1 text-[12px] text-g-success">
                <CircleCheck className="h-3.5 w-3.5" />
                Logged. Page will refresh shortly.
              </span>
            )}
            {error && (
              <span className="text-[12px] text-g-danger">
                {error === "missing_referrer"
                  ? "Pick a referring customer."
                  : error === "missing_referred_contact"
                    ? "Add at least a name, phone, or email for the referred party."
                    : `Couldn't log (${error}).`}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function open0(): boolean {
  // Keep the form collapsed by default; the user must click "Log".
  return false;
}
