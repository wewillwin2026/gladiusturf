import * as React from "react";
import { cn } from "@/lib/cn";

export function Skeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-g-surface-2 animate-pulse",
        className,
      )}
      {...rest}
    />
  );
}
