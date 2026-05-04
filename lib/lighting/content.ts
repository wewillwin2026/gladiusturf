/**
 * Single-source-of-truth copy for /lighting. Every visible string lives here
 * so iteration is one file. Voice rules and section structure are defined in
 * ~/Downloads/gladius-lighting-page-spec.md (§4–§5).
 */

export const HERO = {
  eyebrow: "Lighting vertical",
  headline: "The operating system for landscape lighting businesses.",
  subhead:
    "Built for the way lighting pros actually run — fixture-level inventory, per-fixture warranty timers, bilingual customer flow, storm-response mode. Not a CRM.",
  primaryCta: "Book a demo",
  secondaryCta: "See a live workspace",
  trust:
    "Trusted by lighting operators across Florida. First-mover early access pricing through Q3 2026.",
} as const;

export const PROBLEM = {
  header: "Every landscape lighting business hits the same ceiling.",
  bullets: [
    {
      title: "Your founder is the system.",
      body: "Every fixture, every warranty, every customer history lives in one person's head.",
    },
    {
      title: "Your reputation is uncapped, your revenue isn't.",
      body: "5-star reviews don't pay your slow season. Maintenance plans do — and most operators don't have one.",
    },
    {
      title: "Your software fights you.",
      body: "HVAC tools weren't built for fixture-level inventory, bilingual flow, or storm-response.",
    },
  ],
} as const;

export const SOLUTION = {
  header: "What's different about Gladius Lighting.",
  features: [
    {
      title: "Fixture-level inventory",
      body: "Track 20–50 fixtures per home with brand, wattage, install date — the way lighting work actually gets billed.",
    },
    {
      title: "Per-fixture warranty timers",
      body: "Cast, Unique, FX — each brand's terms tracked automatically. Stop giving away free labor.",
    },
    {
      title: "Bilingual customer flow",
      body: "English and Spanish templates for every touchpoint. The Florida market your competitors can't speak to.",
    },
    {
      title: "Maintenance plan engine",
      body: "Three-tier plans, automated campaigns to your existing book, recurring revenue that doesn't depend on new installs.",
    },
    {
      title: "Storm Response Mode",
      body: "One-click activation after named storms — every customer in the path gets a check-in offer, priority queue for plan members.",
    },
    {
      title: "Cross-cluster route batching",
      body: "Naples, Tampa, Sarasota in the same week? The system batches by zip cluster and saves a full driving day.",
    },
  ],
} as const;

export const PROOF = {
  header: "See it running for a real lighting business.",
  body: "We built a complete Gladius Lighting workspace for Bright Lights Landscape Lighting in Sarasota — a 2-person family operation with 171 five-star Google reviews and zero customers on a maintenance plan. Their workspace shows what your business looks like inside Gladius — real customers, real warranty data, real bilingual campaign flow. Book a demo and we'll send you the access code.",
  cta: "Request access to the live workspace",
} as const;

export const PRICING_TEASER = {
  tiers: [
    {
      name: "Independent",
      body: "Solo lighting operators. Single user, full lighting toolkit.",
      featured: false,
    },
    {
      name: "Professional",
      body: "2–4 person crews. The Bright Lights tier. Recommended.",
      featured: true,
    },
    {
      name: "Enterprise",
      body: "Multi-crew operators. Custom routing, multi-region, priority support.",
      featured: false,
    },
  ],
  footnote:
    "Annual prepay. First-mover pricing through Q3 2026. Optional GladiusBDC add-on for outbound.",
} as const;

export const FAQ = [
  {
    q: "Is this a CRM?",
    a: "No. CRMs are built around contacts and deals. Gladius is built around properties, fixtures, and service history.",
  },
  {
    q: "Will it work for a 2-person operation?",
    a: "Yes. The Independent and Professional tiers are sized for solo operators and small crews respectively.",
  },
  {
    q: "Can I import my existing customer list?",
    a: "Yes — CSV import on day one. We also help you reconstruct customer history from your Google review base if your records are thin.",
  },
  {
    q: "Do you support Spanish?",
    a: "Yes. Every customer-facing template (estimates, invoices, maintenance plan campaigns, storm check-ins) ships bilingual.",
  },
  {
    q: "What if I already use QuickBooks?",
    a: "QuickBooks Online sync is on the roadmap. Until it ships, Gladius exports clean invoice data you can import.",
  },
  {
    q: "Can I see a real workspace before I commit?",
    a: "Yes. Book a demo and we'll give you the access code to a live workspace running for an actual lighting business.",
  },
] as const;

export const FORM = {
  header: "Book a demo.",
  subhead:
    "15 minutes. We'll show you the live workspace and answer your specific questions. No pitch, no slides — just the product.",
  submit: "Book my demo",
  helper: "We'll respond within 24 hours with three time slots.",
  successHeader: "Got it.",
  successBody:
    "We'll reply within 24 hours with three time slots — and the access code for the live workspace.",
  errorBody:
    "Something went wrong. Please try again or email founders@gladiusturf.com directly.",
} as const;

export const FOOTER_CTA = {
  left: "First-mover pricing ends Q3 2026.",
  right: "Book a demo",
} as const;

export const CREW_SIZES = ["1", "2–4", "5–10", "10+"] as const;
export type CrewSize = (typeof CREW_SIZES)[number];
