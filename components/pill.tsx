import { cn } from "@/lib/cn";

type PillProps = {
  children: React.ReactNode;
  className?: string;
  /** Color tone for the pill. Defaults to moss. */
  tone?: "moss" | "honey";
};

/**
 * Small rounded badge with moss or honey accent — used for category tags,
 * callouts, and the eyebrow row in hero/sections.
 */
export function Pill({ children, className, tone = "moss" }: PillProps) {
  const toneCls =
    tone === "honey"
      ? "border-honey/30 bg-honey/5 text-honey-bright"
      : "border-moss/30 bg-moss/5 text-moss-bright";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        toneCls,
        className
      )}
    >
      {children}
    </span>
  );
}
