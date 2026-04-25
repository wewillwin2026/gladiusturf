export type EngineTier = {
  slug: string;
  name: string;
  tagline: string;
  blurb: string;
  accent: "moss" | "honey";
};

export const ENGINE_TIERS: EngineTier[] = [
  {
    slug: "revenue",
    name: "Revenue",
    tagline: "How you win the work.",
    blurb:
      "Eight engines that catch every quote, voice every estimate, hunt every property, and resurrect every dead lead — before your competitor texts back.",
    accent: "moss",
  },
  {
    slug: "lifecycle",
    name: "Lifecycle",
    tagline: "How you keep the customer.",
    blurb:
      "Six engines that handle the boring middle — portal, cadence, memory, weather, show-rate, life events — so your office stops drowning in reschedule emails.",
    accent: "honey",
  },
  {
    slug: "intelligence",
    name: "Intelligence",
    tagline: "How the AI gets smarter every night.",
    blurb:
      "Six engines that score every inquiry, read every message, remember every win, anchor every price, and benchmark every crew. Your software compounds while you sleep.",
    accent: "moss",
  },
  {
    slug: "operations",
    name: "Operations",
    tagline: "How the crews actually execute.",
    blurb:
      "Nine engines for compliance, quality, crew reputation, offline field tooling, per-job costing, books, expense capture, payroll, and tax. The boring stuff that decides whether you make money.",
    accent: "honey",
  },
  {
    slug: "marketplace",
    name: "Marketplace",
    tagline: "How the network compounds.",
    blurb:
      "Four engines that turn surplus inventory into revenue, tribal knowledge into company memory, customer churn into 60-day-out forecasts, and lifetime value into a real ledger. The flywheel that makes year three better than year one.",
    accent: "moss",
  },
];
