"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function UnlockForm() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || code.length < 4) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bright-lights/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: code }),
      });
      if (!res.ok) {
        setError("That passcode didn't work. Try again.");
        setLoading(false);
        return;
      }
      router.replace("/demo/bright-lights-encina/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again in a moment.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label
        className="text-[10px] uppercase tracking-[0.18em]"
        style={{ color: "var(--bl-text-faint)" }}
      >
        Passcode
      </label>
      <input
        ref={inputRef}
        className="bl-input bl-mono text-center text-[24px] tracking-[0.6em]"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        pattern="[0-9]*"
        placeholder="••••"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
        aria-label="Demo passcode"
      />
      {error && (
        <p className="text-[12px]" style={{ color: "var(--bl-alert)" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        className="bl-btn-primary mt-2"
        disabled={loading || code.length < 4}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Enter the workspace <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
