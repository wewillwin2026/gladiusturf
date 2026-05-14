"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, RefreshCw } from "lucide-react";

type Props = {
  token: string;
  email: string;
  mode: "sms" | "totp";
  phoneHint: string | null;
};

export function VerifyForm({ token, email, mode, phoneHint }: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (mode !== "sms") return;
    sendSms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendSms() {
    try {
      const res = await fetch("/api/founders/sms-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setSmsError(b.error || "Failed to send SMS");
      } else {
        setSmsSent(true);
        setSmsError(null);
      }
    } catch {
      setSmsError("Could not send SMS — check your connection.");
    }
  }

  async function handleResend() {
    setResending(true);
    setSmsError(null);
    await sendSms();
    setResending(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/founders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Verification failed");
      }
      router.push("/founders/war-room");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="text-center text-[12px] text-bone/55">
        Signing in as <span className="font-mono text-bone/80">{email}</span>
      </div>

      {mode === "sms" && (
        <div className="rounded-md border border-bone/10 bg-bone/[0.03] px-4 py-3 text-center">
          {smsSent ? (
            <p className="text-[13px] text-bone/70">
              Code sent to <span className="font-mono text-bone/90">{phoneHint}</span>
            </p>
          ) : smsError ? (
            <p className="text-[13px] text-honey-bright">{smsError}</p>
          ) : (
            <p className="text-[13px] text-bone/50">Sending SMS…</p>
          )}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-champagne-bright hover:underline disabled:opacity-50"
          >
            <RefreshCw className="h-2.5 w-2.5" />
            {resending ? "Sending…" : "Resend code"}
          </button>
        </div>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55">
          {mode === "sms" ? "SMS code" : "Authenticator code"}
        </span>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoComplete="one-time-code"
          autoFocus
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="h-14 w-full rounded-md border border-bone/10 bg-bone/[0.04] px-3 text-center font-mono text-[28px] tracking-[0.4em] text-bone focus:border-champagne-bright/60 focus:outline-none"
          placeholder="000000"
        />
      </label>

      {error && (
        <p className="text-[13px] text-honey-bright" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="group inline-flex items-center justify-center gap-2 rounded-full bg-lime-bright px-6 py-3 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying…
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
