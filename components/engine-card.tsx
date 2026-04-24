import type { Engine } from "@/content/engines";

const FEATURE_BULLETS: Record<string, string[]> = {
  "quote-intercept": [
    "Voicemail captured, transcribed, and routed in 30 seconds",
    "Stale quotes auto-rescued before they age out",
    "Ghosted prospects re-engaged with personalized SMS",
  ],
  "upsell-whisperer": [
    "AI scans every site for aeration, mulch, drainage gaps",
    "Crew gets a punch-list before they pull off the truck",
    "Client gets a 1-tap approve link tied to next visit",
  ],
  "referral-radar": [
    "Tracks which properties produce new business",
    "Flags reps that quietly kill referral pipelines",
    "Fires next-door outreach before competitors arrive",
  ],
  "applicator-shield": [
    "Watches every applicator, license, and chemical daily",
    "Drift logs + weather-hold windows auto-captured",
    "Renewal deadlines flagged 60 days before expiry",
  ],
  "site-memory": [
    "Gate codes, pets, sprinkler quirks captured visit one",
    "Every new hire onboarded in 6 weeks, not 6 months",
    "Crew handoff carries every fact for the next 6 years",
  ],
  "weather-pivot": [
    "Routes auto-reshuffle when storms shift",
    "Every client texted before they wonder",
    "Chemical-safe days auto re-sequenced",
  ],
  "surplus-yard": [
    "Sod, mulch, stone, equipment listed in one tap",
    "Sold to crews across town without leaving the app",
    "Stripe-collected payment lands in your account",
  ],
};

export function EngineCard({ engine }: { engine: Engine }) {
  const bullets = FEATURE_BULLETS[engine.slug] ?? [];

  return (
    <a
      href={`/product#${engine.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-bright/40 hover:shadow-[0_0_0_1px_rgba(212,255,74,0.25),0_24px_48px_-20px_rgba(212,255,74,0.25)]"
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs font-medium tracking-[0.2em] text-bone/40">
          {engine.number}
        </span>
        <span className="rounded-full border border-moss/30 bg-moss/5 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-moss-bright">
          Engine
        </span>
      </div>

      <h3 className="mt-6 font-serif text-2xl font-semibold leading-[1.15] tracking-[-0.01em] text-bone">
        {engine.name}
      </h3>

      <span className="mt-3 font-mono text-sm font-medium text-moss-bright">
        {engine.outcome}
      </span>

      <p className="mt-5 text-[15px] leading-[1.6] text-bone/65">
        {engine.description}
      </p>

      {bullets.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2.5 text-sm text-bone/75">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-moss-bright" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-lime-bright transition-transform group-hover:translate-x-0.5">
        Read more →
      </span>
    </a>
  );
}
