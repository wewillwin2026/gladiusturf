"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { trackConversion } from "@/lib/tracking/client";

const DEMO_EMAIL = "admin@gladiuscrm.com";
const DEMO_PASSWORD = "test123";

const ERROR_LABELS: Record<string, string> = {
  invalid_or_expired:
    "That sign-in link is invalid or expired. Request a new one below.",
  no_longer_invited:
    "Your access to this workspace was removed. Contact founders@gladiusturf.com.",
  tenant_inactive:
    "This workspace is currently paused. Contact founders@gladiusturf.com.",
  auth_provision_failed:
    "Couldn't provision your account. Try again or contact founders@gladiusturf.com.",
  membership_failed:
    "Couldn't grant workspace access. Contact founders@gladiusturf.com.",
};

type Mode = "magic" | "demo";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    initialError ? ERROR_LABELS[initialError] ?? null : null,
  );
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function handleDemoSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleMagicSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/app/auth/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Couldn't send sign-in link");
      }
      trackConversion("tenant_magic_requested", 0, { email });
      // Always show the same success state — the API never reveals whether
      // the email is in the invitation map.
      setMagicSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send sign-in link");
    } finally {
      setLoading(false);
    }
  }

  function autofillDemo() {
    setMode("demo");
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }

  if (magicSent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-g-accent" aria-hidden />
        <div>
          <h2 className="text-[16px] font-medium text-g-text">
            Check your email.
          </h2>
          <p className="mt-2 text-[13px] leading-[1.5] text-g-text-muted">
            If <span className="font-geist-mono text-g-text">{email}</span> is
            on the invitation list, we just sent a sign-in link. The link
            expires in 15 minutes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMagicSent(false);
            setError(null);
          }}
          className="text-[12px] text-g-text-faint hover:text-g-text-muted"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return mode === "magic" ? (
    <form onSubmit={handleMagicSubmit} className="flex flex-col gap-5">
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

      {error && (
        <p className="text-[13px] text-g-danger" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !email}
        className="group inline-flex h-10 items-center justify-center gap-2 rounded-md bg-g-accent px-4 text-[13px] font-medium text-black transition-colors hover:bg-g-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Sending link…
          </>
        ) : (
          <>
            <Mail className="h-3.5 w-3.5" />
            Email me a sign-in link
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-g-text-faint">
        Real customer? We&apos;ll email you a link. Demo? Use{" "}
        <button
          type="button"
          onClick={autofillDemo}
          className="text-g-accent hover:underline"
        >
          shared demo creds
        </button>
        .
      </p>
    </form>
  ) : (
    <form onSubmit={handleDemoSubmit} className="flex flex-col gap-5">
      <Field label="Email">
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
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

      <p className="text-left text-[11px] text-g-text-faint">
        Demo creds: <span className="font-geist-mono">{DEMO_EMAIL}</span> /{" "}
        <span className="font-geist-mono">{DEMO_PASSWORD}</span>
      </p>

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
            Sign in to demo
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode("magic");
          setError(null);
          setPassword("");
        }}
        className="text-center text-[11px] text-g-text-faint hover:text-g-text-muted"
      >
        Real customer? Use a sign-in link instead
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
