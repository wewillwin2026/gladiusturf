"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { readFirstTouchUtm, trackDemoBooked, trackDemoFormStart } from "@/lib/track";
import { track, trackConversion } from "@/lib/tracking/client";

/**
 * DemoForm — 2026-05-12 rewrite per landing-conversion plan.
 *
 * Trimmed from 11 fields → 3 (crew name, email, phone) plus one optional
 * freetext "best window to talk." Every other detail (current software,
 * crew size, tier, BDC add-on, preferred date/time) moves to the demo
 * call itself. Each field above 3 typically costs 5–10% completion on
 * a mobile-first surface; we live with one customer's worth of context
 * being asked on the call.
 *
 * URL handoff from the homepage loss calculator: `/demo?leak=<dollars>`
 * pre-fills the "best window" note with a structured leak handoff so
 * the founder lands on the call with the prospect's own number.
 */

type Status = "idle" | "submitting" | "success" | "error";

export function DemoForm() {
  const searchParams = useSearchParams();
  const leakParam = searchParams.get("leak");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [crewName, setCrewName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bestWindow, setBestWindow] = useState(
    leakParam && /^\d+$/.test(leakParam)
      ? `Calculator modeled $${Number(leakParam).toLocaleString()}/yr leak — please run my own audit on the call.`
      : "",
  );

  const startedRef = useRef(false);

  function noteStart() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackDemoFormStart();
    track("demo_form_focus");
  }

  const isComplete =
    crewName.trim() !== "" && email.trim() !== "" && phone.trim() !== "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isComplete) return;
    setStatus("submitting");
    setError(null);

    const utm = readFirstTouchUtm();

    const body = {
      crewName: crewName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      ...(bestWindow.trim() ? { altTimeNote: bestWindow.trim() } : {}),
      ...utm,
      source_page:
        typeof window !== "undefined" ? window.location.pathname : "/demo",
    };

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Something went wrong");
      }
      trackDemoBooked("", false, "");
      trackConversion("demo_form_submit", 0, { fields: 3 });
      setStatus("success");
      setCrewName("");
      setEmail("");
      setPhone("");
      setBestWindow("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-moss/40 bg-moss/[0.05] p-8">
        <h3 className="font-serif text-2xl font-semibold text-bone">
          Got it — demo confirmed.
        </h3>
        <p className="mt-4 text-[15px] leading-[1.6] text-bone/85">
          A founder will text you within the hour to lock the time. We&rsquo;ll
          run a free pipeline audit on the call.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={noteStart}
      className="flex flex-col gap-5 rounded-2xl border border-bone/10 bg-bone/[0.02] p-8"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-serif text-2xl font-semibold text-bone">
          Book a 30-minute demo.
        </h3>
        <p className="text-[14px] leading-[1.5] text-bone/75">
          Three fields. A founder texts you within the hour to lock the
          time and runs a free pipeline audit on the call.
        </p>
      </div>

      <Field label="Crew / shop name">
        <input
          name="crewName"
          data-track="demo_form_crewName"
          required
          autoComplete="organization"
          value={crewName}
          onChange={(e) => setCrewName(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Phone (we'll text)">
        <input
          type="tel"
          name="phone"
          data-track="demo_form_phone"
          required
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Email (for the calendar invite)">
        <input
          type="email"
          name="email"
          data-track="demo_form_email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Best window to talk (optional)">
        <input
          name="altTimeNote"
          type="text"
          value={bestWindow}
          onChange={(e) => setBestWindow(e.target.value)}
          placeholder="e.g. Tue after 4pm CT, or weekend mornings"
          className={inputCls}
        />
      </Field>

      <button
        type="submit"
        disabled={status === "submitting" || !isComplete}
        className={cn(
          "group mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-lime-bright px-6 py-3.5 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover",
          status === "submitting" && "cursor-wait opacity-70",
          !isComplete && status !== "submitting" && "cursor-not-allowed opacity-50",
        )}
      >
        {status === "submitting" ? "Sending..." : "Book my demo"}
        {status !== "submitting" && (
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        )}
      </button>

      <p className="text-[12px] leading-[1.5] text-bone/70">
        30-day money-back. Per-crew pricing. No setup fee.
      </p>

      {error && (
        <p className="text-[13px] text-bone/80">
          {error}. Try again, or email{" "}
          <a
            href="mailto:founders@gladiusturf.com"
            className="text-moss-bright underline underline-offset-2"
          >
            founders@gladiusturf.com
          </a>
          .
        </p>
      )}
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-md border border-bone/15 bg-bone/[0.04] px-3 text-[15px] text-bone placeholder:text-bone/50 focus:border-moss/60 focus:outline-none focus:ring-2 focus:ring-moss/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/75">
        {label}
      </span>
      {children}
    </label>
  );
}
