"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

/**
 * Read-only code block with a copy button. Sized for the install page
 * snippets — multi-line, monospace, no syntax highlighting.
 */
export function CopyBlock({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore — older browsers w/o clipboard API just won't copy
    }
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-g-border bg-g-surface-2">
      <pre className="px-4 py-3 pr-12 text-[12px] leading-[1.5] font-mono text-g-text whitespace-pre-wrap break-all">
        {value}
      </pre>
      <button
        type="button"
        onClick={onCopy}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-g-border bg-g-bg px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-g-text-muted hover:text-g-text hover:bg-g-surface transition-colors"
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
  );
}
