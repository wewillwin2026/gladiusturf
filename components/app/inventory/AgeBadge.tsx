import * as React from "react";
import { cn } from "@/lib/cn";

export interface AgeBadgeProps {
  days: number;
  className?: string;
}

type Bucket = {
  label: string;
  classes: string;
};

/**
 * Maps days-on-shelf into one of four aging buckets:
 *   0-29   → Fresh   (g-accent green)
 *   30-89  → Aging   (champagne / amber)
 *   90-179 → Stale   (honey / orange)
 *   180+   → Dead    (g-danger red, "Sell first" CTA)
 *
 * Pure presentational — safe for both server and client rendering.
 */
function bucketFor(days: number): Bucket {
  const d = Math.max(0, Math.floor(days));
  if (d >= 180) {
    return {
      label: `Dead · ${d}d · Sell first`,
      classes: "bg-g-danger/15 text-g-danger border-g-danger/30",
    };
  }
  if (d >= 90) {
    return {
      label: `Stale · ${d}d`,
      classes: "bg-honey/20 text-honey-bright border-honey/40",
    };
  }
  if (d >= 30) {
    return {
      label: `Aging · ${d}d`,
      classes: "bg-champagne/20 text-champagne-bright border-champagne/40",
    };
  }
  return {
    label: `Fresh · ${d}d`,
    classes: "bg-g-accent/15 text-g-accent border-g-accent/30",
  };
}

export default function AgeBadge({ days, className }: AgeBadgeProps) {
  const { label, classes } = bucketFor(days);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        "font-geist-mono tabular-nums leading-none",
        "text-[10px]",
        classes,
        className,
      )}
      style={{ borderWidth: 1 }}
    >
      {label}
    </span>
  );
}
