import { Star } from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";

const PILOT_STATS = [
  { stat: "12", label: "founding crews live" },
  { stat: "$1.4M+", label: "recovered in pilot" },
  { stat: "0", label: "churned in 90 days" },
];

/**
 * Three-column homepage social proof block. All three columns are intentionally
 * placeholder-flagged so a real-customer drop-in is grep-and-replace.
 */
export function SocialProofStrip() {
  return (
    <section className="border-b border-bone/10 bg-slate-deep py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Left third — pilot logo bar */}
          <ScrollReveal>
            {/* TODO: swap for real customer logos — see CONTENT.md */}
            <div className="flex flex-col gap-4">
              <Eyebrow tone="champagne">Founding cohort, 2026</Eyebrow>
              <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="pilot-logo-placeholder flex h-[60px] w-full items-center justify-center rounded-lg border border-bone/10 bg-bone/[0.04] text-[10px] uppercase tracking-crest text-bone/30"
                    aria-hidden
                  >
                    Pilot crew {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Center third — featured quote */}
          <ScrollReveal delay={0.08}>
            {/* TODO: swap for real customer quote, attribution, and avatar */}
            <div className="flex h-full flex-col rounded-2xl border border-champagne/20 bg-bone/[0.02] p-6">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-honey text-honey"
                    aria-hidden
                  />
                ))}
              </div>
              <blockquote className="mt-4 font-serif text-[17px] leading-[1.5] text-bone">
                &ldquo;We were leaking $18K a month on quotes that died in
                voicemail. The first week with Gladius we recovered three of
                them. The system has paid for itself before the second
                invoice.&rdquo;
              </blockquote>
              <div className="mt-5 flex items-center gap-3">
                <div
                  aria-hidden
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-bone/10 text-xs font-medium uppercase tracking-crest text-bone/40"
                >
                  TBD
                </div>
                <div className="text-xs leading-snug text-bone/55">
                  <div className="font-medium text-bone/80">[Founder name]</div>
                  <div>[Crew name], [City, State]</div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right third — pilot stats */}
          <ScrollReveal delay={0.16}>
            <div className="flex flex-col gap-4">
              <Eyebrow tone="champagne">Pilot results</Eyebrow>
              <div className="flex flex-col gap-3">
                {PILOT_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-bone/10 bg-bone/[0.02] px-5 py-4"
                  >
                    <div className="font-mono text-2xl text-champagne-bright">
                      {s.stat}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-crest text-bone/55">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
