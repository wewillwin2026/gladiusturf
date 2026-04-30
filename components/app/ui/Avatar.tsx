import * as React from "react";
import { cn } from "@/lib/cn";
import { initials as toInitials } from "@/lib/shared/format";

const SIZE = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-[12px]",
  lg: "h-10 w-10 text-[14px]",
} as const;

export function Avatar({
  name,
  size = "md",
  className,
  tone = "muted",
}: {
  name: string;
  size?: keyof typeof SIZE;
  className?: string;
  tone?: "muted" | "accent";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium select-none",
        SIZE[size],
        tone === "accent"
          ? "bg-g-accent-faint text-g-accent"
          : "bg-g-surface-2 text-g-text-muted border border-g-border-subtle",
        className,
      )}
    >
      {toInitials(name)}
    </div>
  );
}
