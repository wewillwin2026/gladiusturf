import { Quote } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

type QuoteBlockProps = {
  /** The customer quote text. If omitted, the component renders nothing. */
  quote?: string;
  /** Author name (e.g. "Jane Smith"). */
  attribution?: string;
  /** Author role / org (e.g. "Owner · 14-crew shop, North Carolina"). */
  role?: string;
  /** Optional initials shown in the avatar circle. */
  initials?: string;
  /** Headline stat (e.g. "+$43K"). */
  stat?: string;
  /** Stat caption (e.g. "upsell revenue · first 30 days"). */
  statLabel?: string;
};

/**
 * Founding-crew testimonial block.
 *
 * Returns null when no verified quote is provided. We do NOT ship fabricated
 * customer names or "placeholder" disclaimers to production — see audit
 * BUG-CONTENT-005 / BUG-CODE-007.
 */
export function QuoteBlock({
  quote,
  attribution,
  role,
  initials,
  stat,
  statLabel,
}: QuoteBlockProps = {}) {
  if (!quote || !attribution) {
    return null;
  }

  return (
    <section className="bg-pitch py-28">
      <div className="mx-auto max-w-5xl px-6">
        <ScrollReveal>
          <div className="rounded-3xl border border-champagne/20 bg-pitch p-10 md:p-14">
            <Quote
              className="h-10 w-10 text-champagne-bright"
              aria-hidden
            />
            <blockquote className="mt-6 font-serif text-2xl font-medium italic leading-snug tracking-[-0.01em] text-bone md:text-3xl">
              &ldquo;{quote}&rdquo;
            </blockquote>
            <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                {initials ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-champagne to-honey-deep font-serif text-lg font-semibold text-pitch">
                    {initials}
                  </div>
                ) : null}
                <div>
                  <div className="font-medium text-bone">{attribution}</div>
                  {role ? (
                    <div className="text-sm text-bone/55">{role}</div>
                  ) : null}
                </div>
              </div>
              {stat ? (
                <div className="ml-auto text-left sm:text-right">
                  <div className="font-serif text-3xl font-semibold text-champagne-bright">
                    {stat}
                  </div>
                  {statLabel ? (
                    <div className="text-xs text-bone/55">{statLabel}</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
