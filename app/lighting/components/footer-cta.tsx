import { ChevronRight } from "lucide-react";
import { FOOTER_CTA } from "@/lib/lighting/content";

/**
 * Final CTA strip at the bottom of /lighting. Per LIGHTING_LEGENDARY §7
 * footer CTA section: "Want to see lighting run live? → Book a 30-min demo"
 * Routes to /demo (the existing booking form), NOT to the Bright Lights
 * private demo URL.
 */
export function LightingFooterCta() {
  return (
    <section className="border-b border-tw-line bg-tw-bg-elevated py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 sm:flex-row sm:items-center">
        <p className="text-base font-medium text-tw-text-primary">
          {FOOTER_CTA.left}
        </p>
        <a
          href={FOOTER_CTA.rightHref}
          data-track="lighting_demo_cta_footer"
          className="group inline-flex items-center gap-1 rounded-md bg-tw-accent-bronze px-5 py-2.5 text-sm font-medium text-tw-bg-base transition-colors hover:bg-tw-accent-amber"
        >
          {FOOTER_CTA.right}
          <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
