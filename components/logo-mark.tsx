import { cn } from "@/lib/cn";

type LogoMarkProps = {
  className?: string;
  size?: number;
  /** Color of the mark stroke. */
  tone?: "forest" | "moss" | "bone";
  /** Render context. "dark" defaults tone to bone, "light" to forest. */
  theme?: "dark" | "light";
  withWordmark?: boolean;
};

/**
 * Concept C monogram: a G-shape traced as a single continuous stroke that
 * terminates in a blade tip pointing right, with a horizontal crossbar
 * suggesting horizon/T.
 * Placeholder — replace with final vector when provided.
 */
export function LogoMark({
  className,
  size = 48,
  tone,
  theme = "dark",
  withWordmark = false,
}: LogoMarkProps) {
  // Default tone follows theme: dark → bone, light → forest.
  const resolvedTone = tone ?? (theme === "dark" ? "bone" : "forest");
  const stroke =
    resolvedTone === "forest"
      ? "#0F3D2E"
      : resolvedTone === "moss"
      ? "#7FE27A"
      : "#F5F1E8";

  return (
    <span
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="GladiusTurf"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        stroke={stroke}
        strokeWidth={6}
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden="true"
      >
        {/* G-arc: starts upper-right, sweeps counterclockwise to lower-right */}
        <path d="M 40 12 A 16 16 0 1 0 40 36" />
        {/* horizontal crossbar — horizon / T */}
        <path d="M 24 24 L 44 24" />
        {/* blade tip pointing right */}
        <path d="M 40 20 L 46 24 L 40 28" />
      </svg>
      {withWordmark && (
        <span
          className="font-serif text-[22px] leading-none"
          style={{ fontWeight: 500, letterSpacing: "0.02em", color: stroke }}
        >
          GladiusTurf
        </span>
      )}
    </span>
  );
}
