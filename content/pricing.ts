export type Tier = {
  id: "independent" | "professional" | "enterprise";
  name: string;
  tagline: string;
  price: number;
  period: string;
  featured?: boolean;
  features: string[];
  cta: string;
};

export const TIERS: Tier[] = [
  {
    id: "independent",
    name: "Independent",
    tagline: "For the one-crew operator that wants to stop leaking.",
    price: 397,
    period: "/ crew / mo",
    features: [
      "All 33 engines included",
      "Unlimited seats per crew",
      "Quote Intercept + SMS routing",
      "Site Memory, Weather Pivot",
      "Email + chat support",
    ],
    cta: "Start 14-day pilot",
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "For the 2–10 crew shop ready to add a truck without adding chaos.",
    price: 997,
    period: "/ crew / mo",
    featured: true,
    features: [
      "Everything in Independent",
      "Safety Shield compliance",
      "Referral Radar + neighbor outreach",
      "Upsell Whisperer AI scoring",
      "Surplus Yard posting",
      "Priority migration from Jobber / LMN",
    ],
    cta: "Start 14-day pilot",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For the 10+ crew operator with branches, fleets, foremen.",
    price: 2997,
    period: "/ crew / mo",
    features: [
      "Everything in Professional",
      "Multi-branch routing + fleet telemetry",
      "Custom SSO + SCIM",
      "Dedicated revenue strategist",
      "Direct line to the founder",
      "SLA with credits",
    ],
    cta: "Talk to the founder",
  },
];

export const BDC_ADDON = {
  name: "GladiusBDC for Turf",
  price: 499,
  period: "/ mo",
  description:
    "Plugs into any tier. 24/7 AI phone answering, outbound re-engagement, spring-rush overflow.",
};
