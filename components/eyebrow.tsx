import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  /** Color tone for the text. Defaults to moss. */
  tone?: "moss" | "lime";
};

/**
 * Small all-caps section eyebrow. Pair with an h2 underneath.
 */
export function Eyebrow({ children, className, tone = "moss" }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.2em]",
        tone === "moss" ? "text-moss-bright" : "text-lime-bright",
        className
      )}
    >
      {children}
    </p>
  );
}
