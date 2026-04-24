"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function WaitlistForm({ source }: { source: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const email = (new FormData(form).get("email") as string) || "";

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
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
      <p className="rounded-md border border-moss/40 bg-moss/[0.06] px-4 py-3 text-[15px] text-bone">
        On the list. We&apos;ll email you when it opens.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="your@email.com"
        className="h-12 flex-1 rounded-md border border-bone/10 bg-bone/[0.04] px-4 text-[15px] text-bone placeholder:text-bone/40 focus:border-moss/60 focus:outline-none focus:ring-2 focus:ring-moss/20"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className={cn(
          "inline-flex h-12 items-center justify-center rounded-full bg-lime-bright px-6 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover",
          status === "submitting" && "cursor-wait opacity-70"
        )}
      >
        {status === "submitting" ? "..." : "Join waitlist"}
      </button>
      {error && <p className="text-[13px] text-bone/80">{error}</p>}
    </form>
  );
}
