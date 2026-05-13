import type { Metadata } from "next";
import { LightingFaq } from "./components/faq";
import { LightingFooterCta } from "./components/footer-cta";
import { LightingHero } from "./components/hero";
import { LightingPricingTeaser } from "./components/pricing-teaser";
import { LightingProblem } from "./components/problem-section";
import { LightingProof } from "./components/proof-section";
import { LightingSolution } from "./components/solution-section";
import { LightingStickyCta } from "./components/sticky-cta";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ScrollReveal } from "@/components/scroll-reveal";
import { VerticalEcosystemStrip } from "@/components/vertical/VerticalEcosystemStrip";
import { WaitlistForm } from "@/components/vertical/WaitlistForm";
import { FAQ, FORM } from "@/lib/lighting/content";

export const metadata: Metadata = {
  // `absolute` opts out of root layout's `%s · GladiusTurf` template.
  title: {
    absolute:
      "Gladius for Landscape Lighting — The OS for fixture-level operations",
  },
  description:
    "Per-fixture warranty tracking, bilingual customer flow, AI Quote Drafter, Storm Response Mode. Built for landscape lighting designers, not generic CRM customers.",
  alternates: { canonical: "/lighting" },
  openGraph: {
    title: "Gladius for Landscape Lighting",
    description:
      "Quote it at 4 PM. Demo it at 9 PM. Install it next week.",
    url: "https://gladiusturf.com/lighting",
    siteName: "GladiusTurf",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gladius for Landscape Lighting",
    description:
      "Quote it at 4 PM. Demo it at 9 PM. Install it next week.",
  },
};

const PRODUCT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Gladius Lighting",
  description:
    "The operating system built for landscape lighting designers. Per-fixture warranty tracking, transformer-load math, bilingual customer flow, AI receptionist, Storm Response Mode.",
  brand: { "@type": "Brand", name: "Gladius" },
  url: "https://gladiusturf.com/lighting",
  category: "Field Service Software",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "99",
    highPrice: "999",
    offerCount: 3,
    url: "https://gladiusturf.com/pricing",
  },
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

/**
 * `JSON.stringify` does not escape `</` — if any data string ever contained
 * `</script>` the inline JSON-LD block would break the surrounding script tag
 * and could allow markup injection. Escape defensively before serialization.
 */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/<\/(script)/gi, "<\\/$1");
}

export default function LightingPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-tw-bg-base text-tw-text-primary">
        {/* JSON-LD must land in the initial HTML for crawlers — use plain
            <script> rather than next/script (which defers via React hydration
            and would be invisible to Google's first-pass renderer). */}
        <script
          id="lighting-product-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(PRODUCT_JSON_LD) }}
        />
        <script
          id="lighting-faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(FAQ_JSON_LD) }}
        />

        <LightingHero />
        <LightingProblem />
        <LightingSolution />
        <LightingProof />
        <VerticalEcosystemStrip current="lighting" />
        <LightingPricingTeaser />
        <LightingFaq />

        {/* Lead form section — the only conversion point on the page.
            scroll-mt-20 leaves room for the sticky Nav so the heading isn't
            covered when smooth-scrolling lands here from a CTA anchor. */}
        <section
          id="lead-form"
          className="relative scroll-mt-20 overflow-hidden border-b border-tw-line bg-tw-bg-elevated py-24 md:py-28"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <ScrollReveal>
              <h2 className="font-tiempos text-3xl font-medium tracking-[-0.01em] text-tw-text-primary md:text-4xl">
                {FORM.header}
              </h2>
              <p className="mt-5 max-w-xl text-[16px] leading-[1.7] text-tw-text-secondary">
                {FORM.subhead}
              </p>
              <ul className="mt-8 flex flex-col gap-3 text-[14px] leading-[1.6] text-tw-text-secondary">
                <li className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tw-accent-amber"
                  />
                  <span>Real call from Ricardo or Joshua. No SDR.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tw-accent-bronze"
                  />
                  <span>One business day response. Not a drip sequence.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tw-accent-amber"
                  />
                  <span>Locked-in pilot pricing for the first 5 in each market.</span>
                </li>
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <WaitlistForm
                vertical="lighting"
                submitLabel={FORM.submit}
                footnote={FORM.helper}
                successHeader={FORM.successHeader}
                successBody={FORM.successBody}
              />
            </ScrollReveal>
          </div>
        </section>

        <LightingFooterCta />
        <LightingStickyCta />
      </main>
      <Footer />
    </>
  );
}
