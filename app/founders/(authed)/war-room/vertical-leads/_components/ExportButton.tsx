"use client";

import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";

/**
 * Anchor-styled CSV download button. Inherits the live filter state from
 * the URL, so what the founder sees in the table is what they download.
 */
export function ExportButton() {
  const params = useSearchParams();
  const qs = params.toString();
  const href = `/api/founders/vertical-leads/csv${qs ? `?${qs}` : ""}`;
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-1.5 rounded-md border border-g-border-subtle bg-g-surface px-3 py-1.5 text-[12px] text-g-text-muted hover:border-g-accent/60 hover:text-g-text"
    >
      <Download className="h-3 w-3" />
      Export CSV
    </a>
  );
}
