import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "g-card flex flex-col items-center justify-center text-center p-10 gap-3",
        className,
      )}
    >
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-g-surface-2 border border-g-border flex items-center justify-center">
          <Icon className="h-5 w-5 text-g-text-muted" />
        </div>
      )}
      <h3 className="text-[14px] font-medium text-g-text">{title}</h3>
      {body && (
        <p className="text-[13px] text-g-text-muted max-w-sm leading-relaxed">
          {body}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
