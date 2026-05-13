"use client";

import * as React from "react";
import { ArrowDownNarrowWide, Loader2 } from "lucide-react";
import { Button } from "@/components/app/ui/Button";
import { autoOrderByZip } from "../actions";

export function AutoOrderButton({ dayKey }: { dayKey: string }) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const res = await autoOrderByZip(fd);
          if ("error" in res) setError(res.error);
        });
      }}
      className="inline-flex items-center gap-2"
    >
      <input type="hidden" name="dayKey" value={dayKey} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ArrowDownNarrowWide className="h-3.5 w-3.5" />
        )}
        {pending ? "Ordering..." : "Auto-order by ZIP"}
      </Button>
      {error && (
        <span className="text-[11px] text-g-danger">
          Couldn&rsquo;t reorder. Try again.
        </span>
      )}
    </form>
  );
}
