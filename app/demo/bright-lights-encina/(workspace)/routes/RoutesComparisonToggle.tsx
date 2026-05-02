"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";

type Cmp = { trips: number; miles: number; hours: number };

export function RoutesComparisonToggle({
  without,
  withB,
}: {
  without: Cmp;
  withB: Cmp;
}) {
  const [showWithout, setShowWithout] = React.useState(false);
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setShowWithout((v) => !v)}
        className="bl-btn-ghost"
      >
        {showWithout ? "Hide" : "Show"} &ldquo;before Gladius&rdquo;
      </button>
      {showWithout && (
        <div
          className="hidden items-center gap-3 text-[11px] md:flex"
          style={{ color: "var(--bl-text-muted)" }}
        >
          <span className="bl-mono">
            Without: {without.trips} trips · {without.miles} mi · {without.hours} hr
          </span>
          <ArrowRight
            className="h-3 w-3"
            style={{ color: "var(--bl-accent)" }}
          />
          <span
            className="bl-mono"
            style={{ color: "var(--bl-success)" }}
          >
            With: {withB.trips} trips · {withB.miles} mi · {withB.hours} hr
          </span>
        </div>
      )}
    </div>
  );
}
