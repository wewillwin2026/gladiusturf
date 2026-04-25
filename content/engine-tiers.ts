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
    name: "Win the work",
    tagline: "How you win the work.",
    blurb:
      "Eight engines that catch every quote, voice every estimate, hunt every property, and resurrect every dead lead — before your competitor texts back.",
    accent: "moss",
  },
  {
    slug: "lifecycle",
    name: "Keep the work",
    tagline: "How you keep the customer.",
    blurb:
      "Six engines that handle the boring middle — portal, follow-ups, memory, weather, show-rate, life moments — so your office stops drowning in reschedule emails.",
    accent: "honey",
  },
  {
    slug: "intelligence",
    name: "Get smarter",
    tagline: "How the AI gets smarter every night.",
    blurb:
      "Six engines that grade every inbound lead, score every queued job, read every message tone, remember every won bid, price every job against the neighborhood, and benchmark every crew. Your software works while you sleep — and gets smarter from every job.",
    accent: "moss",
  },
  {
    slug: "operations",
    name: "Run the crew",
    tagline: "How the crews actually execute.",
    blurb:
      "Nine engines for compliance, quality, crew reputation, offline field tooling, per-job costing, books, expense capture, payroll, and tax. The boring stuff that decides whether you make money.",
    accent: "honey",
  },
  {
    slug: "marketplace",
    name: "Build the network",
    tagline: "How the network compounds.",
    blurb:
      "Four engines that turn the leftover sod into cash, the foreman's 30 years into onboarding, the customers about to walk into save plays, and every account into a real dollar number on the books. Year three pays for years one and two.",
    accent: "moss",
  },
];
