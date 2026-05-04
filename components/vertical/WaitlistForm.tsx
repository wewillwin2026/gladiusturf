"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { readFirstTouchUtm } from "@/lib/track";
import { track, trackConversion } from "@/lib/tracking/client";
import { CREWS, YEARS_IN_BUSINESS } from "@/lib/vertical/copy";
import type { VerticalSlug } from "@/lib/vertical/types";

type Status = "idle" | "submitting" | "success" | "error";

const PAIN_LIMIT = 280;

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `wl-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

type Props = {
  vertical: VerticalSlug;
  /** Submit-button label, e.g. "Get on the lighting waitlist". */
  submitLabel: string;
  /** Footnote rendered below the button. */
  footnote: string;
  /** Success header shown after submission. */
  successHeader?: string;
  /** Success body shown after submission. */
  successBody?: string;
};

export function WaitlistForm({
  vertical,
  submitLabel,
  footnote,
  successHeader = "You're on the list.",
  successBody = "We respond to every waitlist request within one business day. No spam, no drip sequences — just a real call from Ricardo or Joshua.",
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [years, setYears] = useState("");
  const [crews, setCrews] = useState("");
  const [pain, setPain] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const startedRef = useRef(false);
  const idempotencyRef = useRef<string>("");

  useEffect(() => {
    idempotencyRef.current = newIdempotencyKey();
  }, []);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email],
  );

  const isComplete =
    name.trim() !== "" &&
    company.trim() !== "" &&
    emailValid &&
    serviceArea.trim() !== "";

  function noteStart() {
    if (startedRef.current) return;
    startedRef.current = true;
    track(`waitlist_form_started_${vertical}`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isComplete) return;

    setStatus("submitting");
    setError(null);

    const utm = readFirstTouchUtm();
    const body = {
      vertical,
      name: name.trim(),
      company: company.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      serviceArea: serviceArea.trim(),
      yearsInBusiness: years || null,
      crews: crews || null,
      painPoint: pain.trim() || null,
      website,
      idempotencyKey: idempotencyRef.current,
      ...utm,
      source_page: typeof window !== "undefined" ? window.location.pathname : `/${vertical}`,
    };

    try {
      const res = await fetch("/api/vertical/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "request_failed");
      }
      trackConversion(`waitlist_submitted_${vertical}`, 0, {
        vertical,
        crews,
        years,
      });
      setStatus("success");
    } catch (err) {
      track(`waitlist_form_error_${vertical}`, {
        meta: { category: err instanceof Error ? err.message : "unknown" },
      });
      setStatus("error");
      setError(
        "Something went wrong. Please try again or email founders@gladiusturf.com directly.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-honey-bright/40 bg-honey/[0.05] p-8">
        <h3 className="font-serif text-2xl font-semibold text-bone">
          {successHeader}
        </h3>
        <p className="mt-4 text-[15px] leading-[1.6] text-bone/75">
          {successBody}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={noteStart}
      noValidate
      className="relative flex flex-col gap-5 rounded-2xl border border-bone/10 bg-bone/[0.02] p-7 md:p-8"
    >
      {/* Honeypot — see lead-form.tsx in /lighting for context. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden opacity-0"
      >
        <label htmlFor={`${vertical}-website`}>Website</label>
        <input
          id={`${vertical}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <Field label="Full name" htmlFor={`${vertical}-name`}>
        <input
          id={`${vertical}-name`}
          name="name"
          type="text"
          required
          autoComplete="name"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Company name" htmlFor={`${vertical}-company`}>
        <input
          id={`${vertical}-company`}
          name="company"
          type="text"
          required
          autoComplete="organization"
          maxLength={160}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor={`${vertical}-email`}>
          <input
            id={`${vertical}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={180}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            aria-invalid={email.length > 0 && !emailValid}
          />
        </Field>
        <Field label="Phone (optional)" htmlFor={`${vertical}-phone`}>
          <input
            id={`${vertical}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field
        label="Service area"
        htmlFor={`${vertical}-area`}
        hint="e.g. Naples to Clearwater, FL"
      >
        <input
          id={`${vertical}-area`}
          name="serviceArea"
          type="text"
          required
          maxLength={200}
          value={serviceArea}
          onChange={(e) => setServiceArea(e.target.value)}
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Years in business (optional)" htmlFor={`${vertical}-years`}>
          <select
            id={`${vertical}-years`}
            name="years"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className={inputCls}
          >
            <option value="">— Select —</option>
            {YEARS_IN_BUSINESS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Crews (optional)" htmlFor={`${vertical}-crews`}>
          <select
            id={`${vertical}-crews`}
            name="crews"
            value={crews}
            onChange={(e) => setCrews(e.target.value)}
            className={inputCls}
          >
            <option value="">— Select —</option>
            {CREWS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="What's the #1 thing breaking in your business right now?"
        htmlFor={`${vertical}-pain`}
        hint={`Optional · ${pain.length}/${PAIN_LIMIT}`}
      >
        <textarea
          id={`${vertical}-pain`}
          name="pain"
          maxLength={PAIN_LIMIT}
          rows={3}
          value={pain}
          onChange={(e) => setPain(e.target.value)}
          className={cn(inputCls, "h-auto py-3 leading-[1.5]")}
        />
      </Field>

      <button
        type="submit"
        disabled={status === "submitting" || !isComplete}
        aria-busy={status === "submitting"}
        className={cn(
          "group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-honey-bright px-6 py-3 text-sm font-semibold text-forest-deep shadow-pop-honey transition-all hover:bg-honey hover:shadow-cta-hover",
          status === "submitting" && "cursor-wait opacity-70",
          !isComplete && status !== "submitting" && "cursor-not-allowed opacity-50",
        )}
      >
        {status === "submitting" ? (
          <>
            <Loader2
              className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
              aria-hidden
            />
            Sending…
          </>
        ) : (
          <>
            {submitLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="text-center text-[12px] text-bone/45">{footnote}</p>

      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md border border-honey-bright/40 bg-honey/[0.06] p-3 text-[13px] text-bone/85"
        >
          {error}
        </p>
      )}
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-md border border-bone/10 bg-bone/[0.04] px-3 text-[15px] text-bone placeholder:text-bone/40 focus:border-honey/60 focus:outline-none focus:ring-2 focus:ring-honey/20";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55"
        >
          {label}
        </label>
        {hint && <span className="text-[10px] text-bone/40">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
