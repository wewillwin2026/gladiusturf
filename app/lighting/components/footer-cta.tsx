import { ArrowRight } from "lucide-react";
import { FOOTER_CTA } from "@/lib/lighting/content";

export function LightingFooterCta() {
  return (
    <section className="border-b border-bone/10 bg-pitch py-10">
      <div className="mx-auto flex max-w-content flex-col items-start justify-between gap-4 px-6 sm:flex-row sm:items-center">
        <p className="text-sm font-medium text-bone/70">{FOOTER_CTA.left}</p>
        <a
          href="#lead-form"
          data-track="lighting_demo_cta_footer"
          className="group inline-flex items-center gap-2 rounded-full border border-honey-bright/40 bg-honey/5 px-5 py-2.5 text-sm font-medium text-honey-bright transition-all hover:border-honey-bright hover:bg-honey/10"
        >
          {FOOTER_CTA.right}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
