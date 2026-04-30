"use client";

import * as React from "react";
import * as RT from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

export const Tabs = RT.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof RT.List>,
  React.ComponentPropsWithoutRef<typeof RT.List>
>(function TabsList({ className, ...rest }, ref) {
  return (
    <RT.List
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 border-b border-g-border-subtle",
        className,
      )}
      {...rest}
    />
  );
});

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof RT.Trigger>,
  React.ComponentPropsWithoutRef<typeof RT.Trigger>
>(function TabsTrigger({ className, ...rest }, ref) {
  return (
    <RT.Trigger
      ref={ref}
      className={cn(
        "px-3 h-8 text-[13px] text-g-text-muted hover:text-g-text border-b-2 border-transparent transition-colors",
        "data-[state=active]:text-g-text data-[state=active]:border-g-accent",
        className,
      )}
      {...rest}
    />
  );
});

export const TabsContent = RT.Content;
