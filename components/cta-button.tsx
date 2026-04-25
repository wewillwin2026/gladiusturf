import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant =
  | "primary"
  | "ghost"
  | "ghost-honey"
  | "ghost-warm"
  | "ghost-champagne";
type Size = "md" | "lg";

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  /** Show the trailing arrow icon. Defaults to true for primary, false for ghost. */
  withArrow?: boolean;
  className?: string;
  external?: boolean;
};

/**
 * Primary lime-bright CTA + ghost variants.
 * - primary: lime-bright filled (signature CTA)
 * - ghost: outlined moss (logo echo)
 * - ghost-honey: outlined honey (legacy, kept for backwards compat)
 * - ghost-warm: alias of ghost-honey
 * - ghost-champagne: outlined champagne — the new heritage ghost default
 *
 * RSC-friendly. Hover styles via Tailwind class state.
 */
export function CtaButton({
  href,
  children,
  variant = "primary",
  size = "md",
  withArrow,
  className,
  external = false,
}: CtaButtonProps) {
  const showArrow = withArrow ?? variant === "primary";

  const sizeCls =
    size === "lg" ? "px-8 py-4 text-base" : "px-7 py-3.5 text-sm";

  const variantCls =
    variant === "primary"
      ? "bg-lime-bright text-forest-deep shadow-cta hover:shadow-cta-hover hover:bg-lime"
      : variant === "ghost-champagne"
        ? "border border-champagne-bright/40 text-champagne-bright hover:border-champagne-bright hover:bg-champagne/10"
        : variant === "ghost-honey" || variant === "ghost-warm"
          ? "border border-honey-bright/40 text-honey-bright hover:border-honey-bright hover:bg-honey/10"
          : "border border-moss/40 text-moss-bright hover:border-moss-bright hover:bg-moss/10";

  const cls = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200",
    sizeCls,
    variantCls,
    className
  );

  const inner = (
    <>
      {children}
      {showArrow ? (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      ) : null}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
