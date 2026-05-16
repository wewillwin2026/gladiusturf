"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, LogIn } from "lucide-react";

export function ImpersonateButton({
  tenantSlug,
}: {
  tenantSlug: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function enter() {
    setState("loading");
    setErr(null);
    try {
      const res = await fetch("/api/founders/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || "Failed");
      }
      setState("done");
      window.open("/app", "_blank");
      setTimeout(() => setState("idle"), 4000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
      setState("idle");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={enter}
        disabled={state === "loading"}
        className="inline-flex items-center gap-1.5 rounded-md bg-g-accent px-3 py-1.5 text-[12px] font-medium text-black transition-colors hover:bg-g-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "loading" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : state === "done" ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : (
          <LogIn className="h-3 w-3" />
        )}
        {state === "done" ? "Opened in new tab" : "Enter workspace"}
      </button>
      {err && (
        <span className="text-[11px] text-g-danger">{err}</span>
      )}
    </div>
  );
}
