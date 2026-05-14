"use client";

import * as React from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";

/**
 * Masked secret with reveal + copy controls. Same visual shape as
 * CopyBlock but starts masked. Used for API keys on the install page.
 */
export function RevealableSecret({ value }: { value: string }) {
  const [shown, setShown] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  const masked = value.slice(0, 4) + "…" + "•".repeat(Math.max(0, value.length - 6)) + value.slice(-2);

  return (
    <div className="relative overflow-hidden rounded-md border border-g-border bg-g-surface-2">
      <pre className="px-4 py-3 pr-24 text-[12px] leading-[1.5] font-mono text-g-text whitespace-pre-wrap break-all">
        {shown ? value : masked}
      </pre>
      <div className="absolute right-2 top-2 inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          className="inline-flex items-center gap-1 rounded-md border border-g-border bg-g-bg px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-g-text-muted hover:text-g-text hover:bg-g-surface transition-colors"
        >
          {shown ? (
            <>
              <EyeOff className="h-3 w-3" />
              Hide
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              Show
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded-md border border-g-border bg-g-bg px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-g-text-muted hover:text-g-text hover:bg-g-surface transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
