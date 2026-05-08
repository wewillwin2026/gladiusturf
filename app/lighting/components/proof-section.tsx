import { ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PROOF } from "@/lib/lighting/content";

/**
 * Proof strip — single full-width section with the founding-cohort pilot
 * callout. Per LIGHTING_LEGENDARY §7.4: do NOT link to any tenant-specific
 * demo URL from this public page. CTA scrolls to the lead form. The public
 * demo lives at /demo/bright-lights-encina (passcode-gated, fictional brand).
 */
export function LightingProof() {
  return (
    <section
      id="proof"
      className="scroll-mt-20 border-b border-tw-line bg-tw-bg-quiet py-24 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <h2 className="max-w-3xl font-tiempos text-3xl font-medium tracking-[-0.01em] text-tw-text-primary md:text-4xl">
            {PROOF.header}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-tw-text-secondary md:text-xl">
            {PROOF.body}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <a
            href="#lead-form"
            data-track="lighting_workspace_cta"
            className="group mt-10 inline-flex items-center gap-1 rounded-md border border-tw-accent-bronze/60 bg-transparent px-6 py-3 text-base font-medium text-tw-accent-bronze transition-colors hover:bg-tw-accent-bronze hover:text-tw-bg-base"
          >
            {PROOF.cta}
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
