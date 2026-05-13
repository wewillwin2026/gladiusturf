"use client";

import * as React from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { advanceReferral } from "../actions";

const NEXT_STATUS: Record<string, string | null> = {
  pending: "contacted",
  contacted: "quoted",
  quoted: "won",
  won: "reward_paid",
  reward_paid: null,
  lost: null,
};

const NEXT_LABEL: Record<string, string> = {
  pending: "Mark contacted",
  contacted: "Mark quoted",
  quoted: "Mark won",
  won: "Mark reward paid",
};

export function AdvanceButton({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const next = NEXT_STATUS[currentStatus];
  const [pending, startTransition] = React.useTransition();
  const [err, setErr] = React.useState<string | null>(null);

  if (!next) {
    return (
      <span className="text-[11px] text-g-text-faint">
        {currentStatus === "lost" ? "Closed" : "Done"}
      </span>
    );
  }

  return (
    <form
      action={(fd) => {
        setErr(null);
        startTransition(async () => {
          const res = await advanceReferral(fd);
          if ("error" in res) setErr(res.error);
        });
      }}
      className="inline-flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={next} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-full border border-g-accent/40 bg-g-accent/10 px-3 py-1 text-[11px] font-medium text-g-accent transition-colors hover:bg-g-accent/20 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {pending ? "..." : NEXT_LABEL[currentStatus]}
      </button>
      {err && (
        <span className="text-[10px] text-g-danger">{err}</span>
      )}
    </form>
  );
}
