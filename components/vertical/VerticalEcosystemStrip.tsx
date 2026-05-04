import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { cn } from "@/lib/cn";
import { VERTICALS, type VerticalSlug } from "@/lib/vertical/types";

type Props = {
  /** Slug of the page rendering the strip — that tile gets a "current" treatment. */
  current?: VerticalSlug;
  /** Section eyebrow + headline override. Defaults match the spec. */
  eyebrow?: string;
  headline?: string;
};

/**
 * The 8-tile horizontal strip rendered on /lighting and every waitlist page.
 * Spec calls this the "ecosystem strip" — it's how prospects see that
 * Gladius covers the full green industry, not just one vertical.
 *
 * /lighting tile → "Live now" pill, links to /lighting.
 * Other 7 tiles → "Waitlist" pill, link to their waitlist page.
 *
 * On mobile the strip is horizontally scrollable with snap points so the
 * whole 8-tile lineup is reachable on a phone without crowding.
 */
export function VerticalEcosystemStrip({
  current,
  eyebrow = "The ecosystem",
  headline = "Gladius is one platform for the green industry.",
}: Props) {
  return (
    <section className="border-b border-bone/10 bg-pitch py-20">
      <div className="mx-auto max-w-content px-6">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-crest text-honey-bright">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-3xl font-serif text-h2-md font-semibold tracking-[-0.01em] text-bone md:text-h2-lg">
            {headline}
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-bone/60">
            Eight verticals, one operating system. Lighting is live. The other
            seven open through 2026 and 2027 — join the waitlist for the one
            you run.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div
            className={cn(
              "mt-10 flex gap-3 overflow-x-auto pb-2",
              "snap-x snap-mandatory scroll-smooth",
              "md:grid md:grid-cols-4 md:overflow-visible md:pb-0",
              "lg:grid-cols-8",
            )}
          >
            {VERTICALS.map((v) => {
              const Icon = v.icon;
              const isCurrent = current === v.slug;
              const isLive = v.status === "live";
              return (
                <Link
                  key={v.slug}
                  href={v.href}
                  prefetch
                  data-track={`ecosystem_tile_${v.slug}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "group flex min-w-[160px] shrink-0 snap-start flex-col gap-3 rounded-xl border bg-bone/[0.02] p-4 transition-colors md:min-w-0",
                    isCurrent
                      ? "border-honey-bright/60 bg-honey/[0.06]"
                      : isLive
                        ? "border-honey-bright/30 hover:border-honey-bright/60"
                        : "border-bone/10 hover:border-bone/30",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isLive ? "text-honey-bright" : "text-bone/55",
                      )}
                      aria-hidden
                    />
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-honey-bright/40 bg-honey/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-honey-bright">
                        Live now
                        <ArrowRight className="h-2.5 w-2.5" aria-hidden />
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-bone/15 bg-bone/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-bone/55">
                        Waitlist
                      </span>
                    )}
                  </div>
                  <div className="text-[14px] font-medium text-bone">
                    {v.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
