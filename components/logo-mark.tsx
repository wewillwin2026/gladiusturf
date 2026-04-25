import Image from "next/image";
import { cn } from "@/lib/cn";

type LogoMarkProps = {
  className?: string;
  size?: number;
  /**
   * Legacy prop kept for backwards compatibility with sister components.
   * The crest is a fixed PNG and no longer re-tinted by tone.
   */
  tone?: "forest" | "moss" | "bone";
  /**
   * Legacy prop kept for backwards compatibility with sister components.
   * The crest itself is a fixed PNG; only the wordmark color shifts.
   */
  theme?: "dark" | "light";
  withWordmark?: boolean;
};

/**
 * Heritage crest mark. Renders the official GladiusTurf crest PNG
 * (black field, moss-green linework, formal wordmark) untouched —
 * the asset is the source of truth and should not be re-styled.
 *
 * When `withWordmark` is true, a small "GLADIUSTURF" wordmark is
 * rendered to the right of the crest (the crest itself already
 * contains a wordmark beneath the seal — this is an optional
 * adjacent label for nav/footer contexts).
 */
export function LogoMark({
  className,
  size = 48,
  // tone is intentionally accepted but unused — see prop docs above.
  tone: _tone,
  theme = "dark",
  withWordmark = false,
}: LogoMarkProps) {
  void _tone;
  const wordmarkColor = theme === "light" ? "#0F3D2E" : "#F5F1E8";

  return (
    <span
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="GladiusTurf"
    >
      <Image
        src="/crest.png"
        alt="GladiusTurf crest"
        width={size}
        height={size}
        priority
        className="h-auto w-auto select-none"
        style={{ width: size, height: "auto" }}
      />
      {withWordmark && (
        <span
          className="font-serif text-[22px] leading-none"
          style={{
            fontWeight: 500,
            letterSpacing: "0.02em",
            color: wordmarkColor,
          }}
        >
          GladiusTurf
        </span>
      )}
    </span>
  );
}
