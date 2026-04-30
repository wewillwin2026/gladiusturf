import * as React from "react";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { Sparkline } from "./Sparkline";

export interface KPICardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  spark?: number[];
  hint?: React.ReactNode;
  className?: string;
}

const TREND = {
  up: { Icon: ArrowUp, cls: "text-g-success" },
  down: { Icon: ArrowDown, cls: "text-g-danger" },
  flat: { Icon: ArrowRight, cls: "text-g-text-faint" },
} as const;

export function KPICard({
  label,
  value,
  delta,
  trend,
  spark,
  hint,
  className,
}: KPICardProps) {
  const T = trend ? TREND[trend] : null;
  return (
    <div
      className={cn(
        "g-card p-4 flex flex-col gap-2 min-w-0",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint truncate">
          {label}
        </span>
        {spark && (
          <Sparkline
            data={spark}
            stroke={trend === "down" ? "var(--g-danger)" : "var(--g-accent)"}
            className="text-g-accent"
          />
        )}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-geist-mono text-[24px] font-medium text-g-text tabular-nums tracking-tight truncate">
          {value}
        </span>
        {delta && T && (
          <span className={cn("inline-flex items-center gap-0.5 text-[12px]", T.cls)}>
            <T.Icon className="h-3 w-3" />
            <span className="font-geist-mono tabular-nums">{delta}</span>
          </span>
        )}
      </div>
      {hint && <div className="text-[11px] text-g-text-muted">{hint}</div>}
    </div>
  );
}
