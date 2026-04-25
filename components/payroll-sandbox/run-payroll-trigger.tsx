"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { RunPayrollModal } from "./run-payroll-modal";

export function RunPayrollTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold text-pitch shadow-cta-champagne transition-all hover:bg-champagne-bright"
      >
        <Play className="h-4 w-4" />
        Run payroll
      </button>
      <RunPayrollModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
