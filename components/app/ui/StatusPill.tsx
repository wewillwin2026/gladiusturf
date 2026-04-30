import * as React from "react";
import { cn } from "@/lib/cn";

export type Tone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-g-surface-2 text-g-text-muted border-g-border",
  accent: "bg-g-accent-faint text-g-accent border-g-accent/40",
  success: "bg-g-success/10 text-g-success border-g-success/30",
  warning: "bg-g-warning/10 text-g-warning border-g-warning/30",
  danger: "bg-g-danger/10 text-g-danger border-g-danger/30",
  info: "bg-g-info/10 text-g-info border-g-info/30",
};

export function StatusPill({
  tone = "neutral",
  children,
  className,
  title,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-none transition-colors duration-220",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
