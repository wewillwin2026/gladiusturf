"use client";

import * as React from "react";
import * as RD from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export const Dialog = RD.Root;
export const DialogTrigger = RD.Trigger;
export const DialogClose = RD.Close;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof RD.Content>,
  React.ComponentPropsWithoutRef<typeof RD.Content>
>(function DialogContent({ className, children, ...rest }, ref) {
  return (
    <RD.Portal>
      <RD.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in fade-in-0" />
      <RD.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
          "g-card p-6 shadow-2xl",
          "data-[state=open]:animate-in fade-in-0 zoom-in-95",
          className,
        )}
        {...rest}
      >
        {children}
        <RD.Close className="absolute right-3 top-3 rounded-md p-1 text-g-text-muted hover:text-g-text hover:bg-g-surface-2">
          <X className="h-4 w-4" />
        </RD.Close>
      </RD.Content>
    </RD.Portal>
  );
});

export function DialogHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <RD.Title className="text-[16px] font-medium text-g-text">{title}</RD.Title>
      {description && (
        <RD.Description className="mt-1 text-[13px] text-g-text-muted">
          {description}
        </RD.Description>
      )}
    </div>
  );
}
