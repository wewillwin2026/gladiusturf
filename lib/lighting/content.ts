/**
 * /lighting marketing copy. Lifted verbatim from
 * ~/Downloads/LIGHTING_LEGENDARY.md §7. Voice: confident, expert, friendly.
 * NOT salesy. Lighting-vertical nouns: fixture, riser, lens, low-voltage,
 * halogen-to-LED, transformer load, photometric.
 */

export const HERO = {
  eyebrow: "For landscape lighting operators",
  // Three lines, third rendered in accent color (amber).
  headlineLine1: "Quote it at 4 PM.",
  headlineLine2: "Demo it at 9 PM.",
  headlineLine3Accent: "Install it next week.",
  subhead:
    "The operating system built for landscape lighting designers. Per-fixture warranty tracking, transformer-load math, bilingual customer flow, and an AI receptionist that captures the calls you miss after sunset.",
  primaryCta: "Get on the lighting waitlist",
  secondaryCta: "Book a 30-min demo",
} as const;

export const HERO_STATS = [
  {
    number: "62%",
    label: "of lighting operators run 7+ disconnected tools",
    source: "Aspire 2026 Industry Report",
  },
  {
    number: "$315/yr",
    label:
      "average revenue left on the table per customer without a maintenance plan",
    source: "Industry pricing analysis",
  },
  {
    number: "$25K+",
    label:
      "in state fines avoided when warranty + licensing track automatically",
    source: "FL DBPR fee schedules",
  },
] as const;

export const PROBLEMS = [
  {
    title: "Owner-as-bottleneck",
    body: "Every warranty, every customer, every install date lives in one operator's head. The day he takes a vacation, the business stops.",
  },
  {
    title: "The maintenance plan you never sold",
    body: "171 customers loving you on Google. Zero on a recurring plan. That's $50K–$75K of recurring revenue waiting on someone to pick up the phone.",
  },
  {
    title: "Phone-first ops in a text-first world",
    body: "After-hours calls go to voicemail. Hispanic-market homeowners call in Spanish and get English voicemail. Both groups quietly hire someone else.",
  },
  {
    title: "Fixture inventory in a notebook",
    body: "Cast LED, Unique, FX Luminaire — six brands across your trucks. When a warranty fixture fails on a Mike Jackson property in year 4, you spend forty minutes finding the install record.",
  },
  {
    title: "Routes built by guess",
    body: "487 miles to hit nine jobs. Done right, that's 67 miles. Six hours of driving, recovered every week.",
  },
  {
    title: "Storms turn into chaos",
    body: "Helene rolls through. Forty customers call at once. You have no playbook, no priority queue, and no way to triage who's a Bright Guardian member vs. a one-time install from 2019.",
  },
] as const;

export const PROBLEM_HEADER =
  "What breaks in landscape lighting today.";

// Lucide icon names — imported in solution-section.tsx
export const SOLUTIONS = [
  {
    iconName: "Lightbulb",
    title: "Per-fixture warranty tracking",
    body: "Every fixture you install logs its brand, wattage, install date, and warranty terms. When year 4 rolls around on a Cast LED, you know — before the customer does.",
  },
  {
    iconName: "Languages",
    title: "Bilingual customer flow",
    body: "Every customer-facing email, SMS, and review request runs in EN and ES. Felipe writes once. The system sends in the right language.",
  },
  {
    iconName: "Map",
    title: "Route batching across your full service area",
    body: "Pull up nine jobs from Naples to Clearwater. Watch them collapse into 3 batched routes. One full driving day per week, recovered.",
  },
  {
    iconName: "Repeat",
    title: "The maintenance plan engine",
    body: "Three plans, named for your brand. The campaign builder writes the email, segments your customer base, and tracks conversion. The slow season becomes the high-leverage season.",
  },
  {
    iconName: "Cloud",
    title: "Storm Response Mode",
    body: "When NOAA flags a storm in your service area, one click sends bilingual check-in offers to every customer in the path. Plan members jump the priority queue.",
  },
] as const;

export const SOLUTION_HEADER = "Built for the way lighting actually runs.";

export const PROOF = {
  header: "A real Florida lighting operator. A real 90-day pilot. Live now.",
  body: "We're partnered with Bright Lights Landscape Lighting in Sarasota — a 9-year-old, 5.0-star, 171-review operation that runs from Naples to Clearwater. Their workspace is built. Their first maintenance plan campaign is launching. We'll publish the case study at Day 90.",
  cta: "Get on the lighting waitlist",
} as const;

export const PRICING_TIERS = [
  {
    name: "Independent",
    monthly: "$99",
    pitch: "For solo operators with one truck.",
    features: [
      "Up to 200 customers",
      "Per-fixture inventory & warranty tracking",
      "Maintenance plan engine (3 plans)",
      "Route optimization",
      "Bilingual customer flow",
      "Email support",
    ],
    highlight: false,
  },
  {
    name: "Professional",
    monthly: "$399",
    pitch: "For lighting designers running 2–5 trucks.",
    features: [
      "Unlimited customers",
      "Everything in Independent",
      "AI Quote Drafter (unlimited)",
      "AI Receptionist (1 phone line)",
      "Storm Response Mode",
      "QuickBooks Online sync",
      "Priority text/email support",
    ],
    highlight: true,
    highlightLabel: "Most teams pick this",
  },
  {
    name: "Enterprise",
    monthly: "$999",
    pitch: "For multi-location and franchise lighting.",
    features: [
      "Everything in Professional",
      "Multi-location support",
      "Custom integrations",
      "Dedicated success manager",
      "AI Receptionist (unlimited lines)",
      "White-label customer portal",
      "SLA guarantee",
    ],
    highlight: false,
  },
] as const;

export const PRICING_FOOTNOTE =
  "Annual billing saves 15%. Discounted Pilot pricing for the first 5 lighting operators in each market — contact us if you're interested.";

export const FAQ = [
  {
    q: "Do you support Cast LED and Unique fixtures specifically?",
    a: "Yes. We track fixture inventory by brand, model, wattage, install date, and warranty terms. Photographs attach to the fixture record, not the customer record.",
  },
  {
    q: "Can I run my holiday lighting season inside the same workspace?",
    a: "Yes. Holiday lighting is a separate service type with its own seasonal route batching, install/take-down windows, and customer reactivation flow each October.",
  },
  {
    q: "What about my senior operator — the one who knows everything?",
    a: "That's exactly the problem we solve. Site Memory captures install history, fixture locations, and customer preferences in structured records. New hires reach competence in 6 weeks instead of 6 months.",
  },
  {
    q: "Do I need to be technical?",
    a: "No. We onboard you in two sessions. You'll be running real campaigns by Day 14.",
  },
  {
    q: "Who owns my customer data?",
    a: 'You do. Always. Export to CSV at any time. If we part ways, we hand back access in 5 business days. There is no "Gladius lock-in."',
  },
  {
    q: "What happens to my Google reviews and Google Business Profile?",
    a: "They stay yours. We help you moderate spam in your reviews section and post review-request flows after every completed job. We never own or operate your Google Business Profile — you do.",
  },
  {
    q: "How does Storm Mode actually work?",
    a: "When NOAA issues a watch or warning for any zip code in your service area, you get a Storm Mode prompt. One click sends a pre-approved bilingual check-in offer to every customer in the impact zone, with priority queueing for plan members.",
  },
  {
    q: "What's the price?",
    a: "Independent $99/month, Professional $399/month (most teams pick this), Enterprise $999/month. Discounted Pilot pricing available for the first 5 operators in each market. See /pricing for details.",
  },
] as const;

export const FORM = {
  header: "Get on the lighting waitlist.",
  subhead:
    "We respond to every lighting waitlist request within one business day. No spam, no drip sequences. Just a real call from Ricardo or Joshua.",
  submit: "Get on the lighting waitlist",
  helper:
    "We respond within one business day. Not a drip sequence — a real call.",
  successHeader: "You're on the list.",
  successBody:
    "We'll reply within one business day. Watch for a real call from Ricardo or Joshua, not a drip sequence.",
  errorBody:
    "Something went wrong. Please try again or email founders@gladiusturf.com directly.",
} as const;

export const FOOTER_CTA = {
  left: "Want to see lighting run live?",
  right: "Book a 30-min demo",
  rightHref: "/demo",
} as const;

export const CREW_SIZES = ["1", "2–4", "5–10", "10+"] as const;
export type CrewSize = (typeof CREW_SIZES)[number];
