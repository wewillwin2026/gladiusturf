"use client";

import * as React from "react";
import { setReviewAskEnabled } from "../actions";

/**
 * Single-toggle card for the post-job review-ask SMS cadence. Writes to
 * tenants.review_ask_enabled. Optimistically flips local state then
 * reverts on server error.
 *
 * v1 is intentionally stub-y: the actual SMS dispatch is wired in the
 * messaging layer (lib/messaging/dispatch.ts) and gated by quiet hours
 * + consent — both already exist. The 3-day delay scheduler is the
 * piece that ships next.
 */
export function ReviewAskToggle({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function onToggle() {
    const next = !enabled;
    setEnabled(next);
    setError(null);
    const fd = new FormData();
    if (next) fd.set("enabled", "on");
    startTransition(async () => {
      const r = await setReviewAskEnabled(fd);
      if ("error" in r) {
        setEnabled(!next);
        setError(r.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={enabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? "bg-g-accent" : "bg-g-surface-2 border border-g-border"
      } ${pending ? "opacity-60" : ""}`}
      title={error ?? undefined}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-[18px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}
