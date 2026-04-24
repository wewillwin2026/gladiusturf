import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  /** Color tone for the text. Defaults to moss. */
  tone?: "moss" | "lime" | "honey";
};

/**
 * Small all-caps section eyebrow. Pair with an h2 underneath.
 */
export function Eyebrow({ children, className, tone = "moss" }: EyebrowProps) {
  const toneCls =
    tone === "lime"
      ? "text-lime-bright"
      : tone === "honey"
        ? "text-honey-bright"
        : "text-moss-bright";
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.2em]",
        toneCls,
        className
      )}
    >
      {children}
    </p>
  );
}
