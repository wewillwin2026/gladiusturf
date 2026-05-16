"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/founders/password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Invalid credentials");
      }
      router.push("/founders/war-room");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="founder-email"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55"
        >
          Email
        </label>
        <input
          id="founder-email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="you@gladiuscrm.com"
          className="h-11 w-full rounded-md border border-bone/15 bg-bone/[0.04] px-3 text-[15px] text-bone placeholder:text-bone/30 focus:border-champagne-bright/60 focus:outline-none disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="founder-password"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55"
        >
          Password
        </label>
        <input
          id="founder-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="h-11 w-full rounded-md border border-bone/15 bg-bone/[0.04] px-3 text-[15px] text-bone focus:border-champagne-bright/60 focus:outline-none disabled:opacity-50"
        />
      </div>

      {error && (
        <p className="text-[13px] text-honey-bright" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="group inline-flex items-center justify-center gap-2 rounded-full bg-lime-bright px-6 py-3 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Enter the War Room
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
