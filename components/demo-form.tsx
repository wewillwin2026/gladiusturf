"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Status = "idle" | "submitting" | "success" | "error";

const CURRENT_SOFTWARE = [
  "Jobber",
  "LMN",
  "Service Autopilot",
  "Aspire",
  "Zentive",
  "Whiteboard / spreadsheet",
  "Other",
];

const CREW_SIZES = ["1 crew", "2–5 crews", "6–10 crews", "11–30 crews", "30+ crews"];

export function DemoForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-moss/40 bg-moss/[0.05] p-8">
        <h3 className="font-serif text-2xl font-semibold text-bone">Got it.</h3>
        <p className="mt-4 text-[15px] leading-[1.6] text-bone/75">
          A founder will email you within the business day with two or three
          30-minute slots. If you need us faster, reply to that email and
          we&rsquo;ll move things up.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-bone/10 bg-bone/[0.02] p-8"
    >
      <Field label="Crew / shop name">
        <input
          name="crewName"
          required
          autoComplete="organization"
          className={inputCls}
        />
      </Field>

      <Field label="Your name">
        <input name="ownerName" required autoComplete="name" className={inputCls} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email">
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={inputCls}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Current software">
        <select name="currentSoftware" required className={inputCls} defaultValue="">
          <option value="" disabled>Pick one</option>
          {CURRENT_SOFTWARE.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Crew size">
        <select name="crewSize" required className={inputCls} defaultValue="">
          <option value="" disabled>Pick one</option>
          {CREW_SIZES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={status === "submitting"}
        className={cn(
          "group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-lime-bright px-6 py-3 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover",
          status === "submitting" && "cursor-wait opacity-70"
        )}
      >
        {status === "submitting" ? "Sending..." : "Request my demo"}
        {status !== "submitting" && (
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        )}
      </button>

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
  "h-11 w-full rounded-md border border-bone/10 bg-bone/[0.04] px-3 text-[15px] text-bone placeholder:text-bone/40 focus:border-moss/60 focus:outline-none focus:ring-2 focus:ring-moss/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55">
        {label}
      </span>
      {children}
    </label>
  );
}
