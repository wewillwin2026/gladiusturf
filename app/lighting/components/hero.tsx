import { ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { HERO, HERO_STATS } from "@/lib/lighting/content";

/**
 * /lighting hero — Twilight Bronze per LIGHTING_LEGENDARY §7.1.
 * Editorial Tiempos H1, three-line break with the third line in amber.
 * Single bronze ambient glow bottom-right (the "landscape light at dusk"
 * motif). No stock photos, no fake dashboard art.
 */
export function LightingHero() {
  return (
    <section
      data-lighting-hero
      className="relative overflow-hidden bg-tw-bg-base pt-32 pb-24 md:pt-40 md:pb-32"
    >
      {/* Bronze ambient glow — bottom-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(212,165,116,0.35) 0%, rgba(232,181,103,0.10) 40%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <p className="mb-6 text-sm uppercase tracking-[0.2em] text-tw-accent-bronze">
            {HERO.eyebrow}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <h1 className="font-tiempos text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-tw-text-primary md:text-[64px] lg:text-[72px]">
            {HERO.headlineLine1}
            <br />
            {HERO.headlineLine2}
            <br />
            <span className="text-tw-accent-amber">
              {HERO.headlineLine3Accent}
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-tw-text-secondary md:text-xl">
            {HERO.subhead}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#lead-form"
              data-track="lighting_demo_cta_hero"
              className="group inline-flex items-center justify-center gap-1 rounded-md bg-tw-accent-bronze px-6 py-3.5 text-base font-medium text-tw-bg-base transition-colors hover:bg-tw-accent-amber"
            >
              {HERO.primaryCta}
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/demo"
              data-track="lighting_book_demo_hero"
              className="inline-flex items-center justify-center rounded-md border border-tw-line bg-transparent px-6 py-3.5 text-base font-medium text-tw-text-primary transition-colors hover:border-tw-accent-bronze hover:text-tw-accent-bronze"
            >
              {HERO.secondaryCta}
            </a>
          </div>
        </ScrollReveal>

        {/* Stat strip — three real numbers with sources cited */}
        <ScrollReveal delay={0.22}>
          <div className="mt-20 grid grid-cols-1 gap-8 border-t border-tw-line pt-12 md:grid-cols-3">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-tiempos text-4xl font-medium text-tw-accent-amber md:text-5xl">
                  {stat.number}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-tw-text-secondary">
                  {stat.label}
                </p>
                <p className="mt-2 text-xs text-tw-text-muted">
                  — {stat.source}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
