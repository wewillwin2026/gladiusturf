"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { markProposalPaid } from "../actions";

export function MarkPaidButton({ id }: { id: string }) {
  const [pending, startTransition] = React.useTransition();
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const res = await markProposalPaid(fd);
          if ("error" in res) {
            setError(res.error);
          } else {
            setDone(true);
          }
        });
      }}
      className="inline-flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending || done}
        className="inline-flex items-center gap-1 rounded-full border border-g-success/40 bg-g-success/10 px-3 py-1 text-[11px] font-medium text-g-success transition-colors hover:bg-g-success/15 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
        {done ? "Marked paid" : pending ? "Marking..." : "Mark paid"}
      </button>
      {error && (
        <span className="text-[11px] text-g-danger" role="alert">
          Couldn&rsquo;t mark paid. Try again.
        </span>
      )}
    </form>
  );
}
