import { cn } from "@/lib/cn";

type PillProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Small rounded badge with moss accent — used for category tags, callouts,
 * and the eyebrow row in hero/sections.
 */
export function Pill({ children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-3 py-1 text-xs font-medium text-moss-bright",
        className
      )}
    >
      {children}
    </span>
  );
}
