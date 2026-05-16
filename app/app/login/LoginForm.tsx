"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { trackConversion } from "@/lib/tracking/client";

const DEMO_EMAIL = "admin@gladiuscrm.com";
const DEMO_PASSWORD = "Wewillwin2026!!";

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

type Mode = "password" | "magic" | "demo";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [partial, setPartial] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    initialError ? ERROR_LABELS[initialError] ?? null : null,
  );
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Demo creds bypass Supabase Auth and go straight to the demo session API.
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      try {
        const res = await fetch("/api/app/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error || "Sign in failed");
        }
        trackConversion("demo_login", 0, { email });
        router.push("/app");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign in failed");
        setLoading(false);
      }
      return;
    }
    try {
      const res = await fetch("/api/app/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        requireTotp?: boolean;
        partial?: string;
        error?: string;
      };
      if (!res.ok || !body.ok) {
        throw new Error(
          body.error === "invalid_credentials"
            ? "Email or password didn't match. Try again or use a sign-in link."
            : body.error || "Sign in failed",
        );
      }
      if (body.requireTotp && body.partial) {
        setPartial(body.partial);
        setLoading(false);
        return;
      }
      trackConversion("tenant_password_login", 0, { email });
      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  }

  async function handleTotpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!partial) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/app/auth/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partial, code }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        factor?: string;
      };
      if (!res.ok || !body.ok) {
        throw new Error(
          body.error === "invalid_code"
            ? "That code didn't match. Try again, or use a recovery code."
            : body.error === "expired_partial"
              ? "Your sign-in expired. Re-enter your password."
              : body.error || "Sign in failed",
        );
      }
      trackConversion("tenant_totp_login", 0, { email });
      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  }

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

  // TOTP step — partial token issued, prompt for the 6-digit code.
  if (partial) {
    return (
      <form onSubmit={handleTotpSubmit} className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-[13px] text-g-text-muted">
          <ShieldCheck className="h-4 w-4 text-g-accent" />
          <span>
            Two-factor required.{" "}
            <span className="text-g-text">Enter the 6-digit code</span> from your
            authenticator app, or a recovery code.
          </span>
        </div>
        <Field label="Code">
          <input
            type="text"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456 or abcd-1234"
            className={inputCls}
          />
        </Field>

        {error && (
          <p className="text-[13px] text-g-danger" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="group inline-flex h-10 items-center justify-center gap-2 rounded-md bg-g-accent px-4 text-[13px] font-medium text-black transition-colors hover:bg-g-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              Verify and sign in
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setPartial(null);
            setCode("");
            setError(null);
          }}
          className="text-center text-[11px] text-g-text-faint hover:text-g-text-muted"
        >
          Cancel — start over
        </button>
      </form>
    );
  }

  // Mode switcher (password / magic / demo)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-1 rounded-md border border-g-border-subtle bg-g-surface-2 p-1">
        <ModeTab active={mode === "password"} onClick={() => setMode("password")}>
          <Lock className="h-3 w-3" />
          Password
        </ModeTab>
        <ModeTab active={mode === "magic"} onClick={() => setMode("magic")}>
          <Mail className="h-3 w-3" />
          Email link
        </ModeTab>
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
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
                <KeyRound className="h-3.5 w-3.5" />
                Sign in
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-g-text-faint">
            First time?{" "}
            <button
              type="button"
              onClick={() => setMode("magic")}
              className="text-g-accent hover:underline"
            >
              Email me a sign-in link
            </button>{" "}
            — set a password from the security page after.
          </p>
          <p className="text-center text-[11px] text-g-text-faint">
            Demo?{" "}
            <button
              type="button"
              onClick={autofillDemo}
              className="text-g-accent hover:underline"
            >
              Use shared demo creds
            </button>
            .
          </p>
        </form>
      ) : mode === "magic" ? (
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
            Demo?{" "}
            <button
              type="button"
              onClick={autofillDemo}
              className="text-g-accent hover:underline"
            >
              Use shared demo creds
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
              setMode("password");
              setError(null);
              setPassword("");
            }}
            className="text-center text-[11px] text-g-text-faint hover:text-g-text-muted"
          >
            Real customer? Use password sign-in instead
          </button>
        </form>
      )}
    </div>
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

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-medium bg-g-bg text-g-text"
          : "inline-flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      }
    >
      {children}
    </button>
  );
}
