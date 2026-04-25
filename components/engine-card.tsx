import type { Engine } from "@/content/engines";
import { cn } from "@/lib/cn";

const FEATURE_BULLETS: Record<string, string[]> = {
  "quote-intercept": [
    "Voicemail captured, transcribed, and routed in 30 seconds",
    "Stale quotes auto-rescued before they age out",
    "Ghosted prospects re-engaged with personalized SMS",
  ],
  quickhook: [
    "60-second AI text on every inbound inquiry",
    "Click-to-book link with crew availability prefilled",
    "First-touch beats the industry's 98-minute average",
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
  voicequote: [
    "Crew chief edits the estimate by voice on-site",
    "Crew + applicator availability checked live",
    "Customer hears the new total before hangup",
  ],
  "property-hunter": [
    "Paste a Zillow URL — AI drafts the intro",
    "Block-level pitch tied to nearby served yards",
    "Hot prospects auto-escalated to managers",
  ],
  "ghost-recovery": [
    "Day-1 pattern interrupt rekindles dead quotes",
    "Voss-style no-questions push at Day 7",
    "50% of dead landscape leads buy within 90 days",
  ],
  servicemagnet: [
    "New service auto-matched to past interested leads",
    "Semantic recall reaches 6-month-old conversations",
    "Personal SMS sent in your tone, not a blast",
  ],
  "client-portal": [
    "Branded reschedule, book, pay, approve in one link",
    "Job history and change orders self-serve 24/7",
    "73% fewer 'when are you coming?' status calls",
  ],
  cadence: [
    "Post-service feedback fired within 6 hours",
    "Late-payment cadence warms Day 3 / 7 / 14 before escalation",
    "NOAA-timed seasonal reminders personalized from Site Memory",
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
  "showrate-max": [
    "Seven-touch lifecycle from book to no-show rescue",
    "Archetype-aware reminders (busy pro vs first-timer)",
    "38% to 71% show rate, no-shows down 58%",
  ],
  lifehook: [
    "AI hears moves, marriages, new babies in threads",
    "Triggers life-event playbooks crews never remember",
    "+76% conversion when timing matches the moment",
  ],
  "intent-scorer": [
    "Every inquiry scored 1–100 before crew opens the app",
    "Service type and sentiment auto-classified",
    "Claude drafts the first-touch SMS in your voice",
  ],
  urgencysync: [
    "Real-time temperature score on every inbound",
    "Dispatch board color-codes red, yellow, green",
    "Emergency callouts spotted in seconds, not hours",
  ],
  toneradar: [
    "Spots ghost-risk before the customer goes dark",
    "Pronoun shifts flag decision-unit changes",
    "Triggers Ghost Recovery before the lead dies",
  ],
  winmemory: [
    "Every closed deal embedded for retrieval",
    "AI cites your three closest past wins on every reply",
    "Your voice compounds with every season",
  ],
  "market-anchor": [
    "Quotes anchored to neighborhood comps + your margin",
    "ZIP-level close-rate evidence at the table",
    "Discount pressure drops, ticket size rises",
  ],
  "lri-score": [
    "0-100 outcome score per crew, per yard",
    "Peer cohort visibility across founding shops",
    "Portable across employers if a crew changes shops",
  ],
  "safety-shield": [
    "Watches every applicator, license, and chemical daily",
    "Drift logs + weather-hold windows auto-captured",
    "Renewal deadlines flagged 60 days before expiry",
  ],
  "quality-radar": [
    "Pre/post photo set required before crew leaves",
    "AI flags rework on-site, not on Day 3",
    "Cuts rework 15% and recovers margin per job",
  ],
  "operator-score": [
    "Crew chief carries a portable performance score",
    "On-time, satisfaction, safety travel between shops",
    "Premium shops bid for high-Score crews",
  ],
  "field-crew-app": [
    "Offline-first PWA installs on a flip phone",
    "Photos batch-upload when signal returns",
    "GPS clock-in, signoff, signature all offline",
  ],
  "job-costing": [
    "Material, labor, and equipment burn per job",
    "Margin shown by crew and by property",
    "Reveals which sites quietly lose you money",
  ],
  "surplus-yard": [
    "Sod, mulch, stone, equipment listed in one tap",
    "Sold to crews across town without leaving the app",
    "Stripe-collected payment lands in your account",
  ],
  "knowledge-codex": [
    "Retiring foremen captured on video, auto-transcribed",
    "Search 'spring fert timing' — get 3 timestamped clips",
    "Tribal knowledge survives every retirement",
  ],
  books: [
    "Real-time P&L by service line, crew, and property",
    "Receipts categorized from a photo, no clerk needed",
    "Audit-ready balance sheet on demand",
  ],
  "expense-brain": [
    "Snap a receipt — Claude reads, codes, and posts it",
    "Auto-matches to the right crew and job",
    "97% auto-categorized, 4 hours/week reclaimed",
  ],
  payroll: [
    "Hours pulled from GPS clock-in, no paper sheets",
    "Multi-state tax tables and prevailing-wage rules",
    "W-2 + 1099-NEC export ready every quarter",
  ],
  "tax-engine": [
    "Sales tax by ZIP, every county, every invoice",
    "Per-vehicle mileage log generated from GPS",
    "1099-NEC packets prepped by January 15",
  ],
  "retention-radar": [
    "Watches every customer for 60-day churn signals",
    "Save plays fire before the cancel email lands",
    "+18% NRR is the only metric we obsess over",
  ],
  "ltv-ledger": [
    "True LTV per customer, real revenue minus real cost",
    "Cohort and segment payback in one ledger",
    "First time landscape ops know what customers are worth",
  ],
};

export function EngineCard({ engine }: { engine: Engine }) {
  const bullets = FEATURE_BULLETS[engine.slug] ?? [];
  const numeric = parseInt(engine.number, 10);
  const isEven = Number.isFinite(numeric) && numeric % 2 === 0;

  // Hover ring alternates by parity. Odd = moss (logo echo), even = champagne (heritage).
  const hoverCls = isEven
    ? "hover:border-champagne-bright/40 hover:ring-1 hover:ring-champagne-bright/30 hover:shadow-[0_0_0_1px_rgba(212,178,122,0.25),0_24px_48px_-20px_rgba(212,178,122,0.3)]"
    : "hover:border-moss-bright/40 hover:ring-1 hover:ring-moss-bright/30 hover:shadow-[0_0_0_1px_rgba(157,255,138,0.25),0_24px_48px_-20px_rgba(157,255,138,0.3)]";

  // Engine number badge: odd echoes the crest (moss), even is heritage (champagne).
  const numberCls = isEven
    ? "text-champagne-bright/40"
    : "text-moss-bright/40";

  // Outcome stat pill alternates per parity for visual rhythm.
  const outcomeCls = isEven
    ? "border-champagne/30 bg-champagne/5 text-champagne-bright"
    : "border-moss/30 bg-moss/5 text-moss-bright";

  // Engine badge tone follows parity.
  const badgeCls = isEven
    ? "border-champagne/30 bg-champagne/5 text-champagne-bright"
    : "border-moss/30 bg-moss/5 text-moss-bright";

  return (
    <a
      href={`/product#${engine.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 transition-all duration-200 hover:-translate-y-0.5",
        hoverCls
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "font-mono text-xs font-medium tracking-[0.2em]",
            numberCls
          )}
        >
          {engine.number}
        </span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-crest",
            badgeCls
          )}
        >
          Engine
        </span>
      </div>

      <h3 className="mt-6 font-serif text-2xl font-semibold leading-[1.15] tracking-[-0.01em] text-bone">
        {engine.name}
      </h3>

      <span
        className={cn(
          "mt-3 inline-flex w-fit rounded-full border px-2.5 py-0.5 font-mono text-sm font-medium",
          outcomeCls
        )}
      >
        {engine.outcome}
      </span>

      <p className="mt-5 text-[15px] leading-[1.6] text-bone/60">
        {engine.description}
      </p>

      {bullets.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2.5 text-sm text-bone/75">
          {bullets.map((b, i) => (
            <li key={b} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-2 h-1.5 w-1.5 flex-none rounded-full",
                  i % 2 === 0 ? "bg-champagne-bright" : "bg-moss-bright"
                )}
              />
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
