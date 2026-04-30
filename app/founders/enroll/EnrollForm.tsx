"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import QRCode from "qrcode";

export function EnrollForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [secret, setSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/founders/enroll?token=${encodeURIComponent(token)}`,
        );
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Enrollment failed");
        if (cancelled) return;
        setSecret(body.secret);
        const dataUrl = await QRCode.toDataURL(body.otpauthUri, {
          margin: 1,
          width: 220,
          color: { dark: "#0F3D2E", light: "#F5F1E8" },
        });
        if (!cancelled) setQrDataUrl(dataUrl);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Enrollment failed");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!secret) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/founders/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, secret, code }),
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
        Enrolling <span className="font-mono text-bone/80">{email}</span>
      </div>

      <div className="flex items-center justify-center rounded-xl border border-bone/10 bg-bone p-4">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="TOTP QR code" width={220} height={220} />
        ) : (
          <div className="h-[220px] w-[220px] animate-pulse bg-bone/10" />
        )}
      </div>

      {secret && (
        <div className="text-center text-[11px] text-bone/45">
          Can&rsquo;t scan? Enter this secret manually:
          <br />
          <span className="font-mono text-bone/75 break-all">{secret}</span>
        </div>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55">
          6-digit code
        </span>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoComplete="one-time-code"
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
        disabled={loading || !secret || code.length !== 6}
        className="group inline-flex items-center justify-center gap-2 rounded-full bg-lime-bright px-6 py-3 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirming…
          </>
        ) : (
          <>
            Confirm and enter
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
