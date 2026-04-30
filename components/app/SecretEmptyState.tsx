import * as React from "react";
import { Database, Sparkles } from "lucide-react";

export function SecretEmptyState({
  schemaMissing,
  title,
}: {
  schemaMissing?: boolean;
  title: string;
}) {
  return (
    <div className="g-card p-8 text-center">
      <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-md bg-g-accent-faint border border-g-accent/30 text-g-accent">
        {schemaMissing ? (
          <Database className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>
      <h3 className="mt-3 text-g-text">{title}</h3>
      {schemaMissing ? (
        <>
          <p className="mt-2 text-[12px] text-g-text-muted max-w-md mx-auto">
            Tracking schema not yet applied. Run{" "}
            <code className="font-mono text-g-accent">
              supabase/migrations/20260430_tracking.sql
            </code>{" "}
            in the Supabase SQL editor (one-time, service-role only) and the live
            data shows up here within seconds.
          </p>
          <p className="mt-2 text-[11px] text-g-text-faint font-mono">
            <code>visitors · sessions · tracking_events</code>
          </p>
        </>
      ) : (
        <p className="mt-2 text-[12px] text-g-text-muted max-w-md mx-auto">
          Live tracking is wired and writing to Supabase. As soon as someone
          hits the marketing site, this view fills in.
        </p>
      )}
    </div>
  );
}
