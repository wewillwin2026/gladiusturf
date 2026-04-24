export type Engine = {
  number: string;
  slug: string;
  name: string;
  outcome: string;
  description: string;
};

export const ENGINES: Engine[] = [
  {
    number: "01",
    slug: "quote-intercept",
    name: "Quote Intercept",
    outcome: "$14,200/mo saved deals",
    description:
      "Estimates that would otherwise die in voicemail get routed, re-priced, and closed. The average shop loses a third of its pipeline to quotes that sit for more than 24 hours — Intercept won't let yours.",
  },
  {
    number: "02",
    slug: "upsell-whisperer",
    name: "Upsell Whisperer",
    outcome: "$38,000/mo additional revenue",
    description:
      "Every existing property gets a continuous scan for aeration, overseeding, mulch refresh, drainage, irrigation. The system tells the crew — and the client — exactly what to add, when, and why. No awkward sales pitch required.",
  },
  {
    number: "03",
    slug: "referral-radar",
    name: "Referral Radar",
    outcome: "$180,000/yr recovered revenue",
    description:
      "Your best crews generate referrals. Your worst ones kill them. Radar tracks which properties produce new business, which reps lose it, and fires the next-door outreach before the neighbor calls a competitor.",
  },
  {
    number: "04",
    slug: "applicator-shield",
    name: "Applicator Shield",
    outcome: "avoid $25K+ in state fines",
    description:
      "State pesticide licensing, drift logs, weather-hold windows, renewal deadlines. Shield watches every applicator, every chemical, every spray, every day — and flags the one thing that would have cost you your license.",
  },
  {
    number: "05",
    slug: "site-memory",
    name: "Site Memory",
    outcome: "6mo → 6wk new-hire onboarding",
    description:
      "The gate code. The dog. The sprinkler zone that leaks. The client's deck chairs. Every crew handoff carries a hundred small facts — Memory captures them on the first visit and hands them to every new hire for the next six years.",
  },
  {
    number: "06",
    slug: "weather-pivot",
    name: "Weather Pivot",
    outcome: "zero complaint calls on storm days",
    description:
      "Rain tomorrow? Pivot reshuffles the route, texts every client with the new window, and re-sequences the chemical-safe days. The client knows before they wonder. You stop fielding angry calls the morning of.",
  },
  {
    number: "07",
    slug: "surplus-yard",
    name: "Surplus Yard",
    outcome: "$20K–$60K/yr recaptured margin",
    description:
      "Leftover sod, mulch, stone, trees, equipment — the stuff that rots in the yard becomes revenue. Post it to the Surplus Yard marketplace, sell it to a crew across town, collect payment without leaving the app.",
  },
  {
    number: "08",
    slug: "client-portal",
    name: "Client Portal",
    outcome: "73% fewer 'when are you coming?' calls",
    description:
      "Your branded portal for the homeowner. They reschedule visits, book new services, pay invoices, approve change orders, and see job history — all from one self-serve link. Your crew's logo, your colors. The phone stops ringing for status updates.",
  },
  {
    number: "09",
    slug: "cadence",
    name: "Cadence",
    outcome: "+24% retention · $12,800/mo recovered late invoices",
    description:
      "The intelligent follow-up brain. Post-service feedback within six hours. Late-payment cadences that warm before they escalate (Day 3 / 7 / 14, then human handoff). Seasonal reminders timed to NOAA — fall cleanup, snow contracts, spring fert, mosquito, leaf. Every message personalized from Site Memory.",
  },
];
