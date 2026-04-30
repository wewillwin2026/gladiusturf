"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { trackConversion } from "@/lib/tracking/client";

const DEMO_EMAIL = "admin@gladiuscrm.com";
const DEMO_PASSWORD = "test123";

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
      const res = await fetch("/api/app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Sign in failed");
      }
      trackConversion("demo_login", 0, { email });
      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  }

  function autofill() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Email">
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          placeholder="you@yourcrew.com"
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
      </Field>

      <button
        type="button"
        onClick={autofill}
        className="text-left text-[11px] text-g-text-faint hover:text-g-text-muted"
      >
        Demo creds: <span className="font-geist-mono">{DEMO_EMAIL}</span> /{" "}
        <span className="font-geist-mono">{DEMO_PASSWORD}</span> · click to autofill
      </button>

      {error && (
        <p className="text-[13px] text-g-danger" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="group inline-flex h-10 items-center justify-center gap-2 rounded-md bg-g-accent px-4 text-[13px] font-medium text-black transition-colors hover:bg-g-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}

const inputCls =
  "h-10 w-full rounded-md border border-g-border bg-g-surface px-3 text-[14px] text-g-text placeholder:text-g-text-faint focus:border-g-accent focus:outline-none focus:ring-2 focus:ring-g-accent/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-g-text-faint">
        {label}
      </span>
      {children}
    </label>
  );
}
