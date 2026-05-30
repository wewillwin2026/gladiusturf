import { Bell, Bot, Check, MapPin, Receipt, Truck } from "lucide-react";

/**
 * SVG/CSS interim animated product loop for the homepage. 4 scenes cross-fade
 * over an 8-second cycle. When a real Lottie file lands at
 * `/public/animations/product-loop.json`, swap this component for the
 * `@lottiefiles/react-lottie-player` Player. Until then, this stays
 * dependency-free and respects prefers-reduced-motion (motion stops, scene 1
 * shown statically).
 */
export function ProductLoop() {
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-2xl border border-bone/10 bg-gradient-to-br from-pitch via-slate-deep to-pitch shadow-[0_0_60px_-12px_rgba(0,0,0,0.6)]"
      role="img"
      aria-label="GladiusTurf product loop: inbound text, AI quote, crew assigned, paid"
    >
      {/* Subtle grid for depth */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,241,232,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,241,232,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Scene 1 — Inbound text notification */}
      <div className="gt-loop-1 absolute inset-0 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-champagne-bright/30 bg-bone/[0.04] p-5 shadow-[0_0_40px_-10px_rgba(212,178,122,0.35)]">
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-crest text-champagne-bright">
            <Bell className="h-3.5 w-3.5" />
            New inquiry · 7:42 PM
          </div>
          <p className="mt-3 font-serif text-lg leading-snug text-bone">
            &ldquo;Hi! Need a quote for backyard cleanup before Memorial
            Day.&rdquo;
          </p>
          <p className="mt-2 text-[13px] text-bone/65">
            From: 813-555-0119 · 0.4 acres · existing customer
          </p>
        </div>
      </div>

      {/* Scene 2 — AI drafts the reply.
              2026-05-30: replaced the character-by-character typewriter
              effect with an "energy-core" reveal — concentric rings +
              particle convergence + blur-to-clear glow. Palette-adapted
              to landing's Moss + Champagne accents (NOT CRM cyan/gold).
              The line still reads as "AI generated this" without the
              code-terminal feel. */}
      <div className="gt-loop-2 absolute inset-0 flex items-center justify-center px-6">
        <div className="relative w-full max-w-md rounded-2xl border border-moss-bright/30 bg-bone/[0.04] p-5 shadow-[0_0_40px_-10px_rgba(157,255,138,0.3)]">
          {/* Expanding ring overlay — moss, fades through the card during reveal */}
          <span
            aria-hidden
            className="gt-loop-ring pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-moss-bright/60"
          />
          <span
            aria-hidden
            className="gt-loop-ring-2 pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-champagne-bright/40"
          />
          {/* Energy-core glow halo behind the line */}
          <span
            aria-hidden
            className="gt-loop-core pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(157,255,138,0.32),transparent_65%)]"
          />

          <div className="relative flex items-center gap-2 text-[13px] uppercase tracking-crest text-moss-bright">
            <Bot className="h-3.5 w-3.5" />
            AI · drafted in 11s
          </div>
          <p className="relative mt-3 font-serif text-lg leading-snug text-bone">
            <span className="gt-loop-reveal inline-block">
              &ldquo;Hi! Tuesday 3pm works. Reply YES to lock it in.&rdquo;
            </span>
          </p>
          <p className="relative mt-2 text-[13px] text-bone/65">
            $340 quote attached · synced to Site Memory
          </p>
        </div>
      </div>

      {/* Scene 3 — Crew assigned */}
      <div className="gt-loop-3 absolute inset-0 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-champagne-bright/30 bg-bone/[0.04] p-5">
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-crest text-champagne-bright">
            <MapPin className="h-3.5 w-3.5" />
            Crew assigned · Tuesday 3 PM
          </div>
          <div className="mt-4 flex h-24 items-center justify-between rounded-xl border border-bone/10 bg-pitch px-4">
            <Truck className="h-7 w-7 text-moss-bright" aria-hidden />
            <div className="mx-3 h-px flex-1 bg-gradient-to-r from-moss-bright/60 to-champagne-bright/60" />
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-champagne-bright/50">
              <MapPin className="h-3.5 w-3.5 text-champagne-bright" />
            </span>
          </div>
          <p className="mt-3 text-[13px] text-bone/65">
            Marcus &middot; route optimized &middot; ETA texted to customer
          </p>
        </div>
      </div>

      {/* Scene 4 — Paid */}
      <div className="gt-loop-4 absolute inset-0 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-moss-bright/40 bg-bone/[0.04] p-5 shadow-[0_0_40px_-10px_rgba(157,255,138,0.4)]">
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-crest text-moss-bright">
            <Receipt className="h-3.5 w-3.5" />
            Invoice paid · 4:11 PM
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-serif text-3xl font-semibold tracking-tight text-bone">
              $340.00
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-moss-bright/20">
              <Check className="h-5 w-5 text-moss-bright" />
            </span>
          </div>
          <p className="mt-2 text-[13px] text-bone/65">
            Stripe ACH · review request scheduled for T+72h
          </p>
        </div>
      </div>

      {/* Caption overlay */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 border-t border-bone/10 bg-pitch/40 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="text-[13px] uppercase tracking-crest text-bone/85">
          One inbound text → quote → crew assigned → paid
        </span>
        <span className="text-[13px] text-bone/75">
          ~30 seconds, every time
        </span>
      </div>
    </div>
  );
}
