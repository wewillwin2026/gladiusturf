"use client";

import { useState } from "react";
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
      <div className="rounded-[12px] border border-moss bg-bone p-8">
        <h3 className="font-serif text-[28px] text-forest">Got it.</h3>
        <p className="mt-4 text-[16px] leading-[1.6] text-stone">
          A founder will email you within the business day with two or three
          30-minute slots. If you need us faster, text{" "}
          <a className="underline" href="tel:+18134420253">
            (813) 442-0253
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-paper p-8 shadow-card"
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
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </Field>

      <Field label="Crew size">
        <select name="crewSize" required className={inputCls} defaultValue="">
          <option value="" disabled>Pick one</option>
          {CREW_SIZES.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={status === "submitting"}
        className={cn(
          "mt-2 inline-flex items-center justify-center rounded-[8px] bg-forest px-6 py-3 text-sm font-medium text-bone transition-colors hover:bg-forest/90",
          status === "submitting" && "cursor-wait opacity-70"
        )}
      >
        {status === "submitting" ? "Sending..." : "Request my demo"}
      </button>

      {error && (
        <p className="text-[13px] text-forest">
          {error}. Try again, or email founders@gladiusturf.com.
        </p>
      )}
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-[8px] border border-[rgba(15,61,46,0.18)] bg-paper px-3 text-[15px] text-forest placeholder:text-stone/70 focus:border-moss focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[12px] uppercase tracking-[0.15em] text-stone">
        {label}
      </span>
      {children}
    </label>
  );
}
