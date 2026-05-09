"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createDealAction } from "../actions";

type TierDefault = { id: string; label: string; monthly: number };

export function NewDealForm({ tierDefaults }: { tierDefaults: TierDefault[] }) {
  const router = useRouter();
  const [tier, setTier] = React.useState(tierDefaults[1]?.id ?? "growth");
  const [customPrice, setCustomPrice] = React.useState(
    String(tierDefaults[1]?.monthly ?? 1497),
  );
  const [addonBdc, setAddonBdc] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  // Auto-update price field when tier changes (founder can still override).
  function pickTier(id: string) {
    setTier(id);
    const t = tierDefaults.find((x) => x.id === id);
    if (t) setCustomPrice(String(t.monthly));
  }

  const monthlyTotal =
    (Number.parseFloat(customPrice) || 0) + (addonBdc ? 499 : 0);

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const result = await createDealAction(fd);
          if ("ok" in result) {
            toast.success("Deal created — share link is on the deal detail page");
            router.push(`/founders/war-room/deals/${result.dealId}`);
            router.refresh();
          } else {
            const msg =
              result.error === "invalid_email"
                ? "Email is required and must include @"
                : result.error === "missing_company"
                  ? "Company name is required"
                  : result.error === "invalid_tier"
                    ? "Pick a tier"
                    : result.error === "invalid_price"
                      ? "Price must be a number between 0 and 10,000"
                      : `Couldn't create deal: ${result.error}`;
            toast.error(msg);
          }
        })
      }
      className="g-card flex flex-col gap-5 p-6"
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Prospect company" required>
          <input
            name="prospect_company"
            required
            placeholder="Bright Lights Landscape Lighting"
            className={inputCls}
          />
        </Field>
        <Field label="Prospect email" required>
          <input
            type="email"
            name="prospect_email"
            required
            autoComplete="email"
            placeholder="cristian@brightlightslandscapelighting.com"
            className={inputCls}
          />
        </Field>
        <Field label="Prospect phone (optional)">
          <input
            type="tel"
            name="prospect_phone"
            placeholder="(941) 205-1000"
            className={inputCls}
          />
        </Field>
      </section>

      <section>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-g-text-faint">
          Tier
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {tierDefaults.map((t) => (
            <label
              key={t.id}
              className={`cursor-pointer rounded-md border p-3 text-[13px] transition-colors ${
                tier === t.id
                  ? "border-g-accent bg-g-accent-faint/30 text-g-text"
                  : "border-g-border-subtle bg-g-surface text-g-text-muted hover:border-g-accent/40"
              }`}
            >
              <input
                type="radio"
                name="tier"
                value={t.id}
                checked={tier === t.id}
                onChange={() => pickTier(t.id)}
                className="sr-only"
              />
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{t.label}</span>
                <span className="font-geist-mono text-[12px]">${t.monthly}</span>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Custom price (USD/mo) — overrides tier default">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-g-text-faint">
              $
            </span>
            <input
              name="custom_price"
              required
              inputMode="decimal"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className={`${inputCls} pl-7`}
            />
          </div>
          <p className="mt-1 text-[11px] text-g-text-faint">
            Bright Lights grandfather example: 397. Pilot pricing: 197.
          </p>
        </Field>
        <Field label="Add BDC ($499/mo)">
          <label className="flex items-center gap-2.5 rounded-md border border-g-border-subtle bg-g-surface px-3 py-2 text-[13px] text-g-text">
            <input
              type="checkbox"
              name="addon_bdc"
              checked={addonBdc}
              onChange={(e) => setAddonBdc(e.target.checked)}
              className="h-4 w-4 accent-g-accent"
            />
            <span>Include GladiusBDC addon</span>
          </label>
        </Field>
      </section>

      <Field label="Notes (founder-only)">
        <textarea
          name="notes"
          rows={3}
          placeholder="Any special terms, context from the demo, follow-ups."
          className={inputCls}
        />
      </Field>

      <div className="flex items-center justify-between rounded-md border border-g-border-subtle bg-g-surface-2 p-3 text-[13px]">
        <span className="text-g-text-muted">First-month total</span>
        <span className="font-geist-mono text-[18px] text-g-text tabular-nums">
          ${monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-g-accent px-4 py-2 text-[13px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Creating…
            </>
          ) : (
            "Create deal + share link"
          )}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "h-10 w-full rounded-md border border-g-border-subtle bg-g-surface px-3 text-[13px] text-g-text placeholder:text-g-text-faint focus:border-g-accent focus:outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-g-text-faint">
        {label}
        {required && <span className="ml-1 text-g-danger">*</span>}
      </span>
      {children}
    </label>
  );
}
