import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  /** Color tone for the text. Defaults to champagne (heritage). */
  tone?: "moss" | "lime" | "honey" | "champagne";
};

/**
 * Small all-caps section eyebrow. Pair with an h2 underneath.
 * Default tone is champagne — the heritage accent. Moss/lime/honey remain
 * available for backwards compatibility.
 */
export function Eyebrow({
  children,
  className,
  tone = "champagne",
}: EyebrowProps) {
  const toneCls =
    tone === "lime"
      ? "text-lime-bright"
      : tone === "honey"
        ? "text-honey-bright"
        : tone === "moss"
          ? "text-moss-bright"
          : "text-champagne-bright";
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-crest",
        toneCls,
        className
      )}
    >
      {children}
    </p>
  );
}
