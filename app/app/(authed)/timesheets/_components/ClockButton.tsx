"use client";

import * as React from "react";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { clockIn, clockOut } from "../../crew/actions";

export function ClockInButton({ crewMemberId }: { crewMemberId: string }) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const res = await clockIn(fd);
          if ("error" in res) setError(res.error);
        });
      }}
      className="inline-flex items-center gap-2"
    >
      <input type="hidden" name="crewMemberId" value={crewMemberId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-g-success/40 bg-g-success/10 px-3 py-1.5 text-[11px] font-medium text-g-success transition-colors hover:bg-g-success/20 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <LogIn className="h-3 w-3" />
        )}
        {pending ? "Clocking in..." : "Clock in"}
      </button>
      {error && (
        <span className="text-[10px] text-g-danger">
          {error === "already_clocked_in" ? "Already on the clock." : error}
        </span>
      )}
    </form>
  );
}

export function ClockOutButton({ entryId }: { entryId: string }) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const res = await clockOut(fd);
          if ("error" in res) setError(res.error);
        });
      }}
      className="inline-flex items-center gap-2"
    >
      <input type="hidden" name="id" value={entryId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-g-warning/40 bg-g-warning/10 px-3 py-1.5 text-[11px] font-medium text-g-warning transition-colors hover:bg-g-warning/20 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <LogOut className="h-3 w-3" />
        )}
        {pending ? "Clocking out..." : "Clock out"}
      </button>
      {error && <span className="text-[10px] text-g-danger">{error}</span>}
    </form>
  );
}
