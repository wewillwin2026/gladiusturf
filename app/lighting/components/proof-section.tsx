import { ArrowRight, Lock } from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PROOF } from "@/lib/lighting/content";

/**
 * Renders a stylized "live workspace" preview frame instead of a real
 * screenshot — the spec calls this out as the fallback (§4.4) and it avoids
 * leaking the demo passcode (`2598`) anywhere in source.
 */
export function LightingProof() {
  return (
    <section
      id="proof"
      className="relative scroll-mt-20 overflow-hidden border-b border-bone/10 bg-pitch py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[400px] bg-[radial-gradient(ellipse_at_top_right,rgba(244,204,133,0.08),transparent_60%)]"
      />
      <div className="mx-auto max-w-content px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <ScrollReveal>
            <Eyebrow tone="honey">Proof</Eyebrow>
            <h2 className="mt-3 font-serif text-h2-md font-semibold tracking-[-0.01em] text-bone md:text-h2-lg">
              {PROOF.header}
            </h2>
            <p className="mt-6 text-[16px] leading-[1.7] text-bone/70">
              {PROOF.body}
            </p>
            <a
              href="#lead-form"
              data-track="lighting_workspace_cta"
              className="group mt-8 inline-flex items-center gap-2 rounded-full border border-honey-bright/40 bg-honey/5 px-6 py-3 text-sm font-medium text-honey-bright transition-all hover:border-honey-bright hover:bg-honey/10"
            >
              {PROOF.cta}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <WorkspacePreview />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function WorkspacePreview() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-bone/10 bg-gradient-to-br from-honey/[0.06] via-bone/[0.02] to-transparent p-1 shadow-pop-honey">
      <div className="relative flex h-full w-full flex-col rounded-xl bg-forest-deep">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-bone/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-bone/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-bone/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-bone/15" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-crest text-bone/40">
            bright-lights · workspace
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-honey-bright/40 bg-honey/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-honey-bright">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-honey-bright" />
            Live
          </span>
        </div>

        {/* Mock dashboard */}
        <div className="flex-1 p-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Active customers", value: "171" },
              { label: "Plans on file", value: "0" },
              { label: "Fixtures tracked", value: "3,420" },
            ].map((tile) => (
              <div
                key={tile.label}
                className="rounded-lg border border-bone/10 bg-bone/[0.03] p-3"
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-bone/40">
                  {tile.label}
                </p>
                <p className="mt-2 font-serif text-2xl font-semibold text-bone">
                  {tile.value}
                </p>
              </div>
            ))}
          </div>

          {/* Florida silhouette + map dots — pure CSS, no image asset */}
          <div className="mt-5 rounded-lg border border-bone/10 bg-bone/[0.02] p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-bone/40">
              Service map · Sarasota cluster
            </p>
            <div className="relative mt-3 h-28 w-full overflow-hidden rounded-md bg-forest-mid/40">
              {[
                { top: "20%", left: "30%" },
                { top: "55%", left: "45%" },
                { top: "40%", left: "55%" },
                { top: "70%", left: "62%" },
                { top: "30%", left: "68%" },
                { top: "60%", left: "78%" },
              ].map((d, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="absolute h-1.5 w-1.5 rounded-full bg-honey-bright shadow-[0_0_8px_rgba(244,204,133,0.6)]"
                  style={{ top: d.top, left: d.left }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Lock overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-forest-deep/95 via-forest-deep/60 to-transparent">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-honey-bright/40 bg-forest-deep/80 px-4 py-2 text-[11px] font-medium text-honey-bright backdrop-blur">
            <Lock className="h-3 w-3" aria-hidden />
            Live workspace · passcode required
          </div>
        </div>
      </div>
    </div>
  );
}
