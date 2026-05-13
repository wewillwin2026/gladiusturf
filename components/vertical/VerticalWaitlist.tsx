import { ArrowRight, ChevronDown } from "lucide-react";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ScrollReveal } from "@/components/scroll-reveal";
import { VerticalEcosystemStrip } from "./VerticalEcosystemStrip";
import { WaitlistForm } from "./WaitlistForm";
import { WAITLIST_COPY } from "@/lib/vertical/copy";
import { getVertical, type VerticalSlug } from "@/lib/vertical/types";

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/<\/(script)/gi, "<\\/$1");
}

type Props = {
  vertical: Exclude<VerticalSlug, "lighting">;
};

/**
 * Shared layout for the 7 routed waitlist pages. Vertical-specific copy is
 * read from `lib/vertical/copy.ts`; nothing else is allowed to vary between
 * pages so the brand stays consistent and we don't fork the marketing
 * surface 8 ways.
 */
export function VerticalWaitlist({ vertical }: Props) {
  const def = getVertical(vertical);
  const copy = WAITLIST_COPY[vertical];
  const Icon = def.icon;

  const faqJsonLd = copy.faq && copy.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: copy.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }
    : null;

  return (
    <>
      <Nav />
      <main id="main-content">
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
          />
        )}
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-bone/10 bg-pitch py-28 md:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[400px] bg-[radial-gradient(ellipse_at_bottom,rgba(244,204,133,0.12),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-content px-6">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-bone/15 bg-bone/[0.03] px-3 py-1">
                <Icon className="h-3 w-3 text-bone/55" aria-hidden />
                <span className="text-[11px] font-semibold uppercase tracking-crest text-bone/55">
                  {def.name} · Waitlist
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <h1 className="mt-7 max-w-4xl font-serif text-display-md font-semibold leading-[1.04] tracking-[-0.02em] text-bone md:text-display-lg">
                {copy.h1}
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-parchment/75 md:text-xl">
                {copy.subhead}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-baseline sm:gap-6">
                <a
                  href="#waitlist-form"
                  data-track={`waitlist_hero_${vertical}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-honey-bright px-7 py-3.5 text-base font-semibold text-forest-deep shadow-pop-honey transition-all hover:bg-honey hover:shadow-cta-hover"
                >
                  Join the {def.name.toLowerCase()} waitlist
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                {vertical === "lawn-care" && (
                  <a
                    href="/demo/sterling-lawn"
                    data-track="waitlist_lawn_care_preview"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-bone/85 underline-offset-4 transition-colors hover:text-bone hover:underline"
                  >
                    or see it on lawn-care data first
                    <span className="font-mono text-[12px] text-champagne-bright">
                      (passcode LAWN24)
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </a>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Currently in private development banner */}
        <section className="border-b border-bone/10 bg-slate-deep py-16">
          <div className="mx-auto max-w-content px-6">
            <ScrollReveal>
              <div className="rounded-2xl border border-honey-bright/30 bg-honey/[0.05] p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-crest text-honey-bright">
                  Currently in private development
                </p>
                <p className="mt-3 text-[16px] leading-[1.7] text-bone/80 md:text-[17px]">
                  We&apos;re building Gladius for {def.name.toLowerCase()}.
                  Operators on the waitlist get early access ahead of public
                  launch, founder-direct setup support, and locked-in
                  introductory pricing.
                </p>
                <p className="mt-3 text-[14px] text-bone/55">
                  {copy.estimatedAvailability}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* What's coming */}
        <section className="border-b border-bone/10 bg-obsidian py-24 md:py-28">
          <div className="mx-auto max-w-content px-6">
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-crest text-honey-bright">
                What&apos;s coming
              </p>
              <h2 className="mt-3 max-w-3xl font-serif text-h2-md font-semibold tracking-[-0.01em] text-bone md:text-h2-lg">
                The {def.name.toLowerCase()} build, in plain English.
              </h2>
            </ScrollReveal>

            <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {copy.whatsComing.map((item, i) => (
                <ScrollReveal key={item} delay={(i % 2) * 0.06}>
                  <li className="flex items-start gap-3 rounded-xl border border-bone/10 bg-bone/[0.02] p-5">
                    <span
                      aria-hidden
                      className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-honey-bright"
                    />
                    <span className="text-[15px] leading-[1.6] text-bone/85">
                      {item}
                    </span>
                  </li>
                </ScrollReveal>
              ))}
            </ul>
          </div>
        </section>

        {/* Why we're building it */}
        <section className="border-b border-bone/10 bg-pitch py-24 md:py-28">
          <div className="mx-auto max-w-content px-6">
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-crest text-honey-bright">
                Why we&apos;re building it
              </p>
              <p className="mt-6 max-w-3xl font-serif text-2xl leading-[1.4] tracking-[-0.01em] text-bone md:text-3xl">
                {copy.primaryPain}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ accordion — only renders when copy provides faq[]. The 7
            verticals each have 4 FAQs, lighting has its own page. */}
        {copy.faq && copy.faq.length > 0 && (
          <section className="border-b border-bone/10 bg-obsidian py-24 md:py-28">
            <div className="mx-auto max-w-content px-6">
              <ScrollReveal>
                <p className="text-xs font-semibold uppercase tracking-crest text-honey-bright">
                  Common questions
                </p>
                <h2 className="mt-3 max-w-3xl font-serif text-h2-md font-semibold tracking-[-0.01em] text-bone md:text-h2-lg">
                  The questions every operator asks first.
                </h2>
              </ScrollReveal>

              <div className="mt-12 flex flex-col divide-y divide-bone/10 rounded-2xl border border-bone/10 bg-bone/[0.02]">
                {copy.faq.map((item, i) => (
                  <ScrollReveal key={item.q} delay={(i % 2) * 0.05}>
                    <details className="group p-6 md:p-7">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                        <span className="text-[16px] font-medium leading-snug text-bone md:text-[17px]">
                          {item.q}
                        </span>
                        <ChevronDown
                          className="mt-1 h-4 w-4 shrink-0 text-honey-bright transition-transform group-open:rotate-180"
                          aria-hidden
                        />
                      </summary>
                      <p className="mt-4 text-[15px] leading-[1.7] text-bone/75">
                        {item.a}
                      </p>
                    </details>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Ecosystem strip — every vertical page shows it. */}
        <VerticalEcosystemStrip
          current={vertical}
          eyebrow="The full ecosystem"
          headline="Eight verticals, one platform."
        />

        {/* Waitlist form */}
        <section
          id="waitlist-form"
          className="relative scroll-mt-20 overflow-hidden border-b border-bone/10 bg-obsidian py-28"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(244,204,133,0.08),transparent_60%)]"
          />
          <div className="mx-auto grid max-w-content grid-cols-1 gap-12 px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <ScrollReveal>
              <h2 className="font-serif text-h2-md font-semibold tracking-[-0.01em] text-bone md:text-h2-lg">
                Join the {def.name.toLowerCase()} waitlist.
              </h2>
              <p className="mt-5 max-w-xl text-[16px] leading-[1.7] text-bone/70">
                Operators on the waitlist get early access, founder-direct
                setup support, and locked-in introductory pricing.
              </p>
              <ul className="mt-8 flex flex-col gap-3 text-[14px] leading-[1.6] text-bone/70">
                <li className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-honey-bright"
                  />
                  <span>Real call from Ricardo or Joshua. No SDR.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-moss-bright"
                  />
                  <span>One business day response. Inside the hour, most days.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-honey-bright"
                  />
                  <span>Locked-in pricing for founding-cohort operators.</span>
                </li>
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <WaitlistForm
                vertical={vertical}
                submitLabel={`Join the ${def.name.toLowerCase()} waitlist`}
                footnote={`We'll email you when ${def.name.toLowerCase()} early access opens. No spam.`}
              />
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
