"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Mail } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/founders/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to send link");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send link");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="rounded-full border border-champagne/30 bg-champagne-bright/10 p-3 text-champagne-bright">
          <Mail className="h-5 w-5" />
        </div>
        <p className="text-[15px] text-bone">
          If your email is approved, a sign-in link is on its way.
        </p>
        <p className="text-[12px] text-bone/55">
          Link expires in 15 minutes. You&rsquo;ll need your authenticator app for the
          TOTP code.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
          className="mt-3 text-[12px] uppercase tracking-[0.16em] text-champagne-bright hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Founder email">
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          placeholder="founder@gladiusturf.com"
        />
      </Field>

      {error && (
        <p className="text-[13px] text-honey-bright" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !email}
        className="group mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-lime-bright px-6 py-3 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending link…
          </>
        ) : (
          <>
            Email me a sign-in link
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-bone/40">
        Two founders only. Activity is logged.
      </p>
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-md border border-bone/10 bg-bone/[0.04] px-3 text-[15px] text-bone placeholder:text-bone/40 focus:border-champagne-bright/60 focus:outline-none focus:ring-2 focus:ring-champagne/20";

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
