"use client";

import * as React from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateLeadStatusAction } from "../actions";

const STATUSES = ["new", "contacted", "converted", "disqualified"] as const;
type Status = (typeof STATUSES)[number];

const TONE: Record<Status, string> = {
  new: "border-g-border bg-g-surface text-g-text-muted",
  contacted: "border-g-accent/40 bg-g-accent-faint/40 text-g-accent",
  converted: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  disqualified: "border-g-border-subtle bg-g-bg text-g-text-faint line-through",
};

const LABEL: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  disqualified: "DQ",
};

/**
 * Inline editable status badge for vertical_leads table rows. Click → menu
 * pops with the four options; selecting one fires updateLeadStatusAction.
 */
export function StatusBadge({
  id,
  initial,
}: {
  id: string;
  initial: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [current, setCurrent] = React.useState<Status>(
    (STATUSES as readonly string[]).includes(initial)
      ? (initial as Status)
      : "new",
  );

  // Click-outside dismissal.
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function pick(next: Status) {
    if (next === current) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("status", next);
      const result = await updateLeadStatusAction(fd);
      if ("ok" in result) {
        setCurrent(next);
        toast.success(`Marked ${LABEL[next].toLowerCase()}`);
      } else {
        toast.error(`Couldn't update: ${result.error}`);
      }
      setOpen(false);
    });
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] transition-colors hover:border-g-text-muted/60 ${TONE[current]}`}
      >
        {pending ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        ) : (
          <ChevronDown className="h-2.5 w-2.5" />
        )}
        {LABEL[current]}
      </button>

      {open && !pending && (
        <ul className="absolute left-0 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-md border border-g-border bg-g-surface shadow-lg">
          {STATUSES.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => pick(s)}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[12px] hover:bg-g-surface-2 ${
                  s === current
                    ? "text-g-accent"
                    : "text-g-text-muted hover:text-g-text"
                }`}
              >
                <span>{LABEL[s]}</span>
                {s === current && (
                  <span className="text-[10px] text-g-accent">●</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
