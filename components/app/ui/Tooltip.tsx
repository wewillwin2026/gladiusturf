"use client";

import * as React from "react";
import * as RT from "@radix-ui/react-tooltip";
import { cn } from "@/lib/cn";

export function TooltipProvider(props: RT.TooltipProviderProps) {
  return <RT.Provider delayDuration={150} {...props} />;
}

export function Tooltip({
  children,
  content,
  side = "top",
  className,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) {
  return (
    <RT.Root>
      <RT.Trigger asChild>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 rounded-md bg-g-surface-2 border border-g-border px-2 py-1 text-[11px] text-g-text shadow-md",
            "data-[state=delayed-open]:animate-in fade-in-0 zoom-in-95",
            className,
          )}
        >
          {content}
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  );
}
