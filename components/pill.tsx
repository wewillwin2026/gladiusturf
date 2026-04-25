import { cn } from "@/lib/cn";

type PillProps = {
  children: React.ReactNode;
  className?: string;
  /** Color tone for the pill. Defaults to champagne (heritage). */
  tone?: "moss" | "honey" | "champagne";
};

/**
 * Small rounded badge — used for category tags, callouts, and the eyebrow row
 * in hero/sections. Champagne is the default heritage tone; moss + honey are
 * preserved for backwards compatibility.
 */
export function Pill({ children, className, tone = "champagne" }: PillProps) {
  const toneCls =
    tone === "honey"
      ? "border-honey/30 bg-honey/5 text-honey-bright"
      : tone === "moss"
        ? "border-moss/30 bg-moss/5 text-moss-bright"
        : "border-champagne/30 bg-champagne/5 text-champagne-bright";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-crest",
        toneCls,
        className
      )}
    >
      {children}
    </span>
  );
}
