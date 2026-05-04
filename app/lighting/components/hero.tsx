import { ArrowRight, Lightbulb } from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";
import { HERO } from "@/lib/lighting/content";

export function LightingHero() {
  return (
    <section
      data-lighting-hero
      className="relative overflow-hidden border-b border-bone/10 bg-pitch py-28 md:py-32"
    >
      {/* Dusk-to-night gradient — warm at the bottom. The single visual motif
          for this page (spec §3). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[400px] bg-[radial-gradient(ellipse_at_bottom,rgba(244,204,133,0.18),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(15,61,46,0.4),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-content px-6">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-honey-bright/30 bg-honey/5 px-3 py-1">
            <Lightbulb className="h-3 w-3 text-honey-bright" aria-hidden />
            <Eyebrow tone="honey" className="text-[11px]">
              {HERO.eyebrow}
            </Eyebrow>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <h1 className="mt-7 max-w-4xl font-serif text-display-md font-semibold leading-[1.04] tracking-[-0.02em] text-bone md:text-display-lg">
            {HERO.headline}
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-parchment/75 md:text-xl">
            {HERO.subhead}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#lead-form"
              data-track="lighting_demo_cta_hero"
              className="group inline-flex items-center gap-2 rounded-full bg-honey-bright px-7 py-3.5 text-base font-semibold text-forest-deep shadow-pop-honey transition-all hover:bg-honey hover:shadow-cta-hover"
            >
              {HERO.primaryCta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            {/* Spec §4.1 — secondary CTA points at the passcode-gated live
                workspace. The passcode itself ships only after a lead form
                submission, so unauth visitors land on the gate page and see
                the prompt, not the workspace. */}
            <a
              href="/demo/bright-lights-encina"
              data-track="lighting_workspace_cta"
              className="group inline-flex items-center gap-2 rounded-full border border-bone/20 px-6 py-3 text-sm font-medium text-bone/85 transition-all hover:border-honey-bright/60 hover:text-honey-bright"
            >
              {HERO.secondaryCta}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="mt-8 max-w-2xl text-sm italic text-bone/55">
            {HERO.trust}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
