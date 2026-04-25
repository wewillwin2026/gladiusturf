"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { TIN_PENDING_VENDOR } from "@/content/payroll-demo-data";

export function TinRequestButton() {
  const [sent, setSent] = useState(false);

  function send() {
    setSent(true);
    setTimeout(() => setSent(false), 2400);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={send}
        disabled={sent}
        className="inline-flex items-center gap-1.5 rounded-full border border-champagne/40 bg-champagne/10 px-3.5 py-1.5 text-xs font-semibold text-champagne-bright transition-colors hover:bg-champagne/20 disabled:opacity-60"
      >
        <Mail className="h-3.5 w-3.5" />
        Email TIN request to {TIN_PENDING_VENDOR}
      </button>
      {sent && (
        <span
          role="status"
          className="inline-flex items-center gap-1.5 rounded-full border border-moss/30 bg-moss/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-moss-bright"
        >
          <CheckCircle2 className="h-3 w-3" />
          Request sent · 2 reminders queued
        </span>
      )}
    </div>
  );
}
