/**
 * Bright Lights Landscape Lighting — demo fixture data.
 *
 * Sourced from /docs/bright-lights-demo-handoff.md sections 1, 3, 5.
 *
 * Customer names + street addresses are SYNTHETIC SURROGATES (board vote
 * 2026-05-06 — no real third-party PII in demo media). Cluster, zip, and
 * lat/lng are preserved so Florida-local route geography looks real. The
 * BRAND block (Cristian + Felipe Encina, public business info) is the only
 * non-synthetic data here, used with operator authorization.
 *
 * v1: read-only static data. No Supabase persistence. The Bright Lights
 * Command Center loads this synchronously, no DB round-trips.
 */

// ---- Brand kit (handoff §1) ----

export const BRAND = {
  name: "Bright Lights Landscape Lighting",
  shortName: "Bright Lights",
  founder: "Cristian Encina",
  operator: "Felipe Encina",
  phone: "(941) 306-6038",
  email: "cristian.brightlights@gmail.com",
  website: "brightlightslandscapelighting.com",
  showroom: "4130 Lancaster Dr, Sarasota, FL 34241",
  yard: "7215 249th St E, Myakka City, FL 34251",
  serviceArea: "Naples → Tampa → Clearwater → St. Petersburg",
  hours: "8 AM – 8 PM, 7 days a week",
  reviewCount: 171,
  reviewStars: 5.0,
  estimatedCustomers: 247,
  founded: "October 2016",
} as const;

export const COLORS = {
  primaryDark: "#0E1628",
  accentWarm: "#F4B860",
  accentSecondary: "#E89B3C",
  bgNeutral: "#1A2438",
  textOnDark: "#F5EFE6",
  success: "#9CD86E",
  alert: "#E85F5F",
} as const;

export const VOICE_PHRASES = [
  "Magical evenings, every night",
  "A touch of magic",
  "Where your satisfaction is our priority",
  "Illuminating outdoor spaces with creativity, quality, and respect for the environment",
  "After sunset, our lighting solutions open up new experiences",
] as const;

// ---- Customers (handoff §3) ----

export type Cluster = "Sarasota" | "Tampa" | "Naples" | "Bradenton" | "Lakewood Ranch" | "Siesta Key" | "Punta Gorda";

export type Customer = {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  cluster: Cluster;
  installYear: number;
  fixtures: number;
  brand: string;
  lastService: string | null;
  notes: string;
  language: "en" | "es";
  referralSource?: string;
  lat: number;
  lng: number;
};

export const CUSTOMERS: Customer[] = [
  {
    id: "BL-DC",
    name: "Daniel Carter",
    address: "1812 Coastal Oak Dr",
    city: "Sarasota",
    zip: "34234",
    cluster: "Sarasota",
    installYear: 2020,
    fixtures: 30,
    brand: "Cast LED",
    lastService: null,
    notes: "Full install — over 30 fixtures completed in a single day.",
    language: "en",
    lat: 27.378,
    lng: -82.555,
  },
  {
    id: "BL-JZ",
    name: "John Zelinsky",
    address: "3247 Magnolia Cove Ln",
    city: "Sarasota",
    zip: "34231",
    cluster: "Sarasota",
    installYear: 2019,
    fixtures: 22,
    brand: "Cast LED",
    lastService: "2024-08-12",
    notes: "Repaired a sinking paver next to the pool — pool/cooking area system.",
    language: "en",
    lat: 27.295,
    lng: -82.524,
  },
  {
    id: "BL-TB",
    name: "Tom Bradford",
    address: "5210 Sandhill Crane Way",
    city: "Bradenton",
    zip: "34209",
    cluster: "Bradenton",
    installYear: 2018,
    fixtures: 18,
    brand: "Cast LED + Unique",
    lastService: "2024-02-11",
    notes: "Riser post failure — came out for warranty replace.",
    language: "en",
    lat: 27.499,
    lng: -82.622,
  },
  {
    id: "BL-MM",
    name: "Mark Mendez",
    address: "6914 Live Oak Ridge",
    city: "Sarasota",
    zip: "34243",
    cluster: "Sarasota",
    installYear: 2021,
    fixtures: 15,
    brand: "Cast LED",
    lastService: "2023-11-08",
    notes: "Reliable repeat customer — handles warranty repairs without friction.",
    language: "en",
    lat: 27.398,
    lng: -82.481,
  },
  {
    id: "BL-MJ",
    name: "Marcus Jenson",
    address: "4108 Egret Point Cir",
    city: "Sarasota",
    zip: "34239",
    cluster: "Sarasota",
    installYear: 2020,
    fixtures: 24,
    brand: "Cast LED",
    lastService: "2025-09-21",
    notes:
      "Watch for sinking paver near pool — repaired 2020. Prefers Tuesday afternoon visits. Cooking-area system was 2 separate visits — keep an eye on those bulbs.",
    language: "en",
    referralSource: "Neighbor — John Zelinsky",
    lat: 27.314,
    lng: -82.519,
  },
  {
    id: "BL-KS",
    name: "Kathleen Stone",
    address: "9105 Cypress Hollow Ct",
    city: "Sarasota",
    zip: "34241",
    cluster: "Sarasota",
    installYear: 2023,
    fixtures: 16,
    brand: "Cast LED",
    lastService: null,
    notes: "Pool-cage install — quick crew turnaround, customer was thrilled.",
    language: "en",
    lat: 27.260,
    lng: -82.395,
  },
  {
    id: "BL-KM",
    name: "Karen Maddox",
    address: "612 Coral Reef Way",
    city: "Siesta Key",
    zip: "34242",
    cluster: "Siesta Key",
    installYear: 2017,
    fixtures: 12,
    brand: "Cast LED (older system)",
    lastService: "2024-03-19",
    notes: "Same-day service — always picks up the phone. 7 years since install.",
    language: "en",
    lat: 27.260,
    lng: -82.557,
  },
  {
    id: "BL-JS",
    name: "Janice Stafford",
    address: "4711 Palm Ridge Dr",
    city: "Sarasota",
    zip: "34232",
    cluster: "Sarasota",
    installYear: 2019,
    fixtures: 14,
    brand: "Unique",
    lastService: "2024-05-04",
    notes: "Came out promptly and fixed the issue same visit.",
    language: "en",
    lat: 27.323,
    lng: -82.467,
  },
  {
    id: "BL-CD",
    name: "Charles Davenport",
    address: "3014 Heron Bay Cir",
    city: "Sarasota",
    zip: "34239",
    cluster: "Sarasota",
    installYear: 2021,
    fixtures: 28,
    brand: "Cast LED",
    lastService: null,
    notes: "Five-star repeat — goes above + beyond when we visit.",
    language: "en",
    lat: 27.305,
    lng: -82.541,
  },
  {
    id: "BL-JB",
    name: "Jay Bishop",
    address: "7820 Pinecrest Loop",
    city: "Lakewood Ranch",
    zip: "34202",
    cluster: "Lakewood Ranch",
    installYear: 2022,
    fixtures: 20,
    brand: "Cast LED",
    lastService: "2024-09-30",
    notes: "Post-Helene inspection visit — system intact.",
    language: "en",
    lat: 27.421,
    lng: -82.420,
  },
  {
    id: "BL-AA",
    name: "Allison Avery",
    address: "2240 Sunset Cove Ln",
    city: "Sarasota",
    zip: "34242",
    cluster: "Siesta Key",
    installYear: 2020,
    fixtures: 19,
    brand: "Cast LED + Unique",
    lastService: null,
    notes: "Long-time advocate — happy to refer.",
    language: "en",
    lat: 27.276,
    lng: -82.553,
  },
  {
    id: "BL-MX",
    name: "Marc Matthews",
    address: "4905 Mariner Bay Ct",
    city: "Punta Gorda",
    zip: "33955",
    cluster: "Punta Gorda",
    installYear: 2021,
    fixtures: 26,
    brand: "Cast LED",
    lastService: "2024-10-15",
    notes: "Post-Milton inspection — partial fixture failure on lanai. South of typical service area.",
    language: "en",
    lat: 26.886,
    lng: -82.103,
  },
];

// ---- Mike Jackson's full fixture inventory (handoff §3) ----

export type FixtureWarranty = "active" | "expiring" | "expired" | "lifetime";

export type Fixture = {
  id: string;
  type: string;
  brand: "Cast" | "Unique";
  model: string;
  wattage: string;
  installDate: string;
  warrantyStatus: FixtureWarranty;
  warrantyEnd: string | null;
  note?: string;
};

export const MIKE_JACKSON_FIXTURES: Fixture[] = [
  { id: "BL-MJ-001", type: "Path Light", brand: "Cast", model: "CPL11", wattage: "3W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-002", type: "Up Light (Royal Palm)", brand: "Cast", model: "CWL5", wattage: "5W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-003", type: "Up Light (Royal Palm)", brand: "Cast", model: "CWL5", wattage: "5W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-004", type: "Path Light", brand: "Cast", model: "CPL11", wattage: "3W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-005", type: "Path Light", brand: "Cast", model: "CPL11", wattage: "3W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-006", type: "Tree Up Light (Live Oak)", brand: "Cast", model: "CWL5", wattage: "5W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-007", type: "Tree Up Light (Live Oak)", brand: "Cast", model: "CWL5", wattage: "5W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-008", type: "Spot Light (Architectural)", brand: "Cast", model: "CSP10", wattage: "5W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-009", type: "Spot Light (Architectural)", brand: "Cast", model: "CSP10", wattage: "5W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-010", type: "Driveway Bollard", brand: "Cast", model: "CBL2", wattage: "5W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-011", type: "Driveway Bollard", brand: "Cast", model: "CBL2", wattage: "5W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-012", type: "Cooking Area Down Light", brand: "Cast", model: "CDL3", wattage: "3W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14", note: "Cooking-area system — keep eye on bulbs." },
  { id: "BL-MJ-013", type: "Cooking Area Down Light", brand: "Cast", model: "CDL3", wattage: "3W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-014", type: "Pool Cage Light", brand: "Unique", model: "Demi", wattage: "2W", installDate: "2020-04-14", warrantyStatus: "lifetime", warrantyEnd: null, note: "Lifetime fixture — 5-yr LED chip warranty active to 2025-04." },
  { id: "BL-MJ-015", type: "Pool Cage Light", brand: "Unique", model: "Demi", wattage: "2W", installDate: "2020-04-14", warrantyStatus: "lifetime", warrantyEnd: null },
  { id: "BL-MJ-016", type: "Step Light", brand: "Cast", model: "CST7", wattage: "1W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-017", type: "Step Light", brand: "Cast", model: "CST7", wattage: "1W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-018", type: "Wall Wash (Front Column)", brand: "Cast", model: "CWW8", wattage: "4W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-019", type: "Wall Wash (Front Column)", brand: "Cast", model: "CWW8", wattage: "4W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-020", type: "Path Light", brand: "Cast", model: "CPL11", wattage: "3W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-021", type: "Path Light", brand: "Cast", model: "CPL11", wattage: "3W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-022", type: "Up Light (Sabal Palm)", brand: "Cast", model: "CWL5", wattage: "5W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-023", type: "Up Light (Sabal Palm)", brand: "Cast", model: "CWL5", wattage: "5W", installDate: "2020-04-14", warrantyStatus: "expired", warrantyEnd: "2025-04-14" },
  { id: "BL-MJ-024", type: "Replacement Up Light (in rain)", brand: "Cast", model: "CWL5", wattage: "5W", installDate: "2025-09-21", warrantyStatus: "active", warrantyEnd: "2030-09-21", note: "Replaced same-day in the rain — Cristian on truck." },
];

// ---- Mike Jackson's service history (handoff §3) ----

export const MIKE_JACKSON_HISTORY = [
  {
    date: "2020-04-14",
    title: "Initial install — 24 fixtures",
    detail: "Cast LED system, architectural + path + driveway + pool cage. 1-day install.",
    invoiced: true,
  },
  {
    date: "2021-08-22",
    title: "Sinking paver near pool — repaired",
    detail: "Customer noticed paver settling next to pool. Lifted, re-leveled, re-set fixture in CWL5 path. No charge.",
    invoiced: false,
  },
  {
    date: "2023-06-09",
    title: "Cooking-area bulb refresh (visit 1 of 2)",
    detail: "First of two cooking-area visits — bulb upgrade on CDL3 pair. Customer requested.",
    invoiced: true,
  },
  {
    date: "2023-08-15",
    title: "Cooking-area bulb refresh (visit 2 of 2)",
    detail: "Second visit — additional CDL3 + lens polish.",
    invoiced: true,
  },
  {
    date: "2025-09-21",
    title: "Up-light replacement — in the rain — warranty",
    detail:
      "Cristian came out same-day and replaced BL-MJ-024 in the rain. New 5-yr Cast warranty issued to 2030-09. The kind of visit that drives 5-star reviews.",
    invoiced: false,
  },
] as const;

// ---- Maintenance plans (handoff §4 Beat 4 + priority prompt §4.2) ----

export type Tier = {
  id: "basics" | "care" | "guardian";
  name: string;
  price: number; // dollars/year
  visitsPerYear: number;
  cadence: string;
  features: string[];
  mostPopular?: boolean;
  badge?: string;
  recommendedFor?: string;
};

export const TIERS: Tier[] = [
  {
    id: "basics",
    name: "Bright Basics",
    price: 249,
    visitsPerYear: 1,
    cadence: "1 annual visit",
    features: [
      "Fixture cleaning",
      "Lens polish",
      "Aim adjustment",
      "Plant trim within 2 ft",
      "16-point inspection",
    ],
    badge: "Bronze",
    recommendedFor: "~30% of your book",
  },
  {
    id: "care",
    name: "Bright Care",
    price: 349,
    visitsPerYear: 2,
    cadence: "Semi-annual",
    features: [
      "Everything in Basics",
      "Bulb replacements at cost",
      "10% off any service calls",
      "Priority booking window",
    ],
    badge: "Silver",
    mostPopular: true,
    recommendedFor: "~50% of your book",
  },
  {
    id: "guardian",
    name: "Bright Guardian",
    price: 589,
    visitsPerYear: 4,
    cadence: "Quarterly",
    features: [
      "Everything in Care",
      "Free warranty repairs",
      "1 free bulb replacement per visit",
      "24-hour SLA after named storms",
      "Lifetime warranty extension on Cast fixtures",
    ],
    badge: "Gold",
    recommendedFor: "~20% of your book",
  },
];

// ---- Email templates (handoff §5) ----

export const EMAIL_EN = {
  from: "Cristian @ Bright Lights Landscape Lighting",
  replyTo: BRAND.email,
  subject:
    "{{first_name}}, your Bright Lights system is {{install_age}} years old — let's keep the magic alive",
  body: [
    "Hi {{first_name}},",
    "",
    "It's been {{install_age}} years since we installed your lighting. Florida is rough on outdoor systems — salt air, humidity, plant overgrowth, storms. That's why we built our new Bright Lights maintenance plans.",
    "",
    "Instead of calling every time something goes out, your system gets scheduled visits. We clean the lenses, re-aim, check the wires, swap bulbs before they fail. All included.",
    "",
    "[See My Plan Options]",
    "",
    "As always, thank you for trusting us.",
    "",
    "Cristian Encina",
    "Bright Lights Landscape Lighting",
    "(941) 306-6038",
  ].join("\n"),
};

export const EMAIL_ES = {
  from: "Cristian @ Bright Lights Landscape Lighting",
  replyTo: BRAND.email,
  subject:
    "{{first_name}}, su sistema Bright Lights tiene {{install_age}} años — mantengamos la magia",
  body: [
    "Hola {{first_name}},",
    "",
    "Han pasado {{install_age}} años desde que instalamos su iluminación. Florida no es fácil con los sistemas de luz — el aire salado, la humedad, las plantas que crecen, las tormentas. Por eso ofrecemos nuestros nuevos planes de mantenimiento Bright Lights.",
    "",
    "En lugar de llamar cada vez que algo falla, su sistema recibe revisiones programadas. Limpiamos los lentes, ajustamos los enfoques, revisamos los cables, cambiamos los focos antes de que fallen. Todo incluido.",
    "",
    "[Ver mis opciones de plan]",
    "",
    "Como siempre, gracias por confiar en nosotros.",
    "",
    "Cristian Encina",
    "Bright Lights Landscape Lighting",
    "(941) 306-6038",
  ].join("\n"),
};

// ---- Activity feed (handoff §4 Beat 2) ----

export type Activity = {
  id: string;
  ts: string; // relative
  customerId?: string;
  text: string;
  tone: "info" | "warning" | "success" | "alert";
};

export const ACTIVITY_FEED: Activity[] = [
  {
    id: "act_1",
    ts: "14 days ago",
    customerId: "BL-MJ",
    text: "Marcus Jenson — fixture warranty expired 14 days ago — upgrade opportunity",
    tone: "warning",
  },
  {
    id: "act_2",
    ts: "in 23 days",
    text: "Hurricane season starts in 23 days — pre-storm campaign template ready",
    tone: "info",
  },
  {
    id: "act_3",
    ts: "7 years ago",
    customerId: "BL-KM",
    text: "Karen Maddox (Siesta Key) — 7 years since install, hasn't been serviced",
    tone: "warning",
  },
  {
    id: "act_4",
    ts: "this week",
    customerId: "BL-CD",
    text: "Charles Davenport — left a 5★ Google review · auto-routed for thank-you note",
    tone: "success",
  },
  {
    id: "act_5",
    ts: "yesterday",
    text: "3 spam comments detected on brightlightslandscapelighting.com/reviews — auto-moderate ready",
    tone: "alert",
  },
  {
    id: "act_6",
    ts: "2 days ago",
    customerId: "BL-JB",
    text: "Jay Bishop — post-Helene check-in delivered, system intact",
    tone: "success",
  },
  {
    id: "act_7",
    ts: "today",
    customerId: "BL-DC",
    text: "Daniel Carter — 30-light system at 5 yrs · maintenance plan eligible",
    tone: "info",
  },
  {
    id: "act_8",
    ts: "3 days ago",
    text: "171 Google reviews · 5.0 ★ — sparkline trending up",
    tone: "success",
  },
];

// ---- Today's route (handoff §4 Beat 2 — 3 Sarasota pins) ----

export const TODAYS_ROUTE = [
  { customerId: "BL-MJ", time: "9:30 AM", reason: "Warranty walkthrough — fixture audit" },
  { customerId: "BL-CD", time: "11:00 AM", reason: "5-yr inspection · pre-plan pitch" },
  { customerId: "BL-JZ", time: "1:30 PM", reason: "Pool paver follow-up" },
];

// ---- Routes — this week (handoff §4 Beat 5) ----

export type RouteStop = { customerId: string; arrival: string; minutes: number };

export type WeeklyRoute = {
  day: string;
  cluster: string;
  jobs: RouteStop[];
  miles: number;
  hours: number;
  color: string;
};

export const WEEKLY_ROUTES: WeeklyRoute[] = [
  {
    day: "Tuesday",
    cluster: "Sarasota",
    color: COLORS.accentWarm,
    jobs: [
      { customerId: "BL-MJ", arrival: "9:00 AM", minutes: 75 },
      { customerId: "BL-CD", arrival: "10:45 AM", minutes: 60 },
      { customerId: "BL-JZ", arrival: "12:30 PM", minutes: 90 },
      { customerId: "BL-JS", arrival: "2:30 PM", minutes: 60 },
    ],
    miles: 22,
    hours: 5.5,
  },
  {
    day: "Thursday",
    cluster: "Tampa / Lakewood Ranch",
    color: COLORS.success,
    jobs: [
      { customerId: "BL-JB", arrival: "9:30 AM", minutes: 75 },
      { customerId: "BL-MM", arrival: "11:30 AM", minutes: 60 },
      { customerId: "BL-TB", arrival: "1:30 PM", minutes: 75 },
    ],
    miles: 14,
    hours: 4,
  },
  {
    day: "Friday",
    cluster: "Naples / Punta Gorda",
    color: COLORS.accentSecondary,
    jobs: [
      { customerId: "BL-MX", arrival: "10:00 AM", minutes: 90 },
      { customerId: "BL-KM", arrival: "1:30 PM", minutes: 75 },
    ],
    miles: 31,
    hours: 3.5,
  },
];

export const ROUTE_COMPARISON = {
  withoutBatching: { trips: 9, miles: 487, hours: 14.5 },
  withBatching: { trips: 3, miles: 67, hours: 13 },
} as const;

// ---- Reviews (handoff §4 Beat 6) ----

export const REVIEW_VELOCITY = [
  { month: "Nov", count: 7 },
  { month: "Dec", count: 6 },
  { month: "Jan", count: 9 },
  { month: "Feb", count: 8 },
  { month: "Mar", count: 11 },
  { month: "Apr", count: 4 },
];

export const SPAM_REVIEWS = [
  {
    author: "Andrew Collins",
    excerpt:
      "Outstanding services from BoostMyAtlasPosition.com — they helped us rank #1 on Google for our category…",
    flagged: "promotional / SEO spam",
  },
  {
    author: "(unsigned)",
    excerpt: "amazing job ⭐⭐⭐⭐⭐ best service ever check out my crypto signals at telegram dot me slash …",
    flagged: "bot gibberish",
  },
  {
    author: "RankFasterNow",
    excerpt: "We loved the lighting! Also looking for SEO? Visit RankFasterNow.io for…",
    flagged: "promotional / SEO spam",
  },
];

// ---- Storm Mode (handoff §4 Beat 7) ----

export const STORM_HISTORY = [
  { name: "Helene", date: "September 2024", landfall: "Sept 26, 2024 · Big Bend FL → Sarasota outer bands" },
  { name: "Milton", date: "October 2024", landfall: "Oct 9, 2024 · Siesta Key direct hit" },
];

export const STORM_PLAYBOOK = {
  affectedCustomers: 247,
  guardianPriorityCount: 0, // they have no Guardian subs yet — pre-launch
  affectedZips: ["34239", "34243", "34232", "34234", "34231", "34241", "34242", "33955", "34209", "34202"],
  oneLineEnglish:
    "Hi {{first_name}} — checking in after the storm. If your Bright Lights system has any damage, reply or click below to book a priority repair window. — Cristian",
  oneLineSpanish:
    "Hola {{first_name}} — pasando a saludar después de la tormenta. Si su sistema Bright Lights tiene algún daño, responda o reserve una ventana de reparación prioritaria. — Cristian",
};

// ---- Gladius pricing tiers shown inside the demo (priority prompt §4.2 Beat 8) ----

export type GladiusTier = {
  id: "operate" | "grow";
  name: string;
  price: number; // $/mo
  bullets: string[];
  recommendedForBL?: boolean;
  tagline: string;
};

export const GLADIUS_TIERS: GladiusTier[] = [
  {
    id: "operate",
    name: "Operate",
    price: 199,
    tagline: "Run the shop — every job, every storm.",
    bullets: [
      "2 user seats — Cristian + Felipe",
      "Up to 250 active customers",
      "Quoting + invoicing + payments",
      "Online booking + scheduling",
      "Mobile crew app",
      "Branded client portal",
      "Bilingual templates (EN + ES)",
      "Route batching included",
      "Storm Mode included — Helene/Milton playbook",
    ],
  },
  {
    id: "grow",
    name: "Grow",
    price: 229,
    recommendedForBL: true,
    tagline: "Operate, plus the website + recurring revenue engine.",
    bullets: [
      "Everything in Operate",
      "Branded website + hosting + ongoing maintenance",
      "Maintenance plan engine (Bright Care campaigns)",
      "Reviews auto-ask + spam moderation",
      "Up to 500 active customers",
      "Founder-direct priority support",
    ],
  },
];

// ---- Helpers ----

export function customerById(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}

export function clustersOf(): Record<Cluster, number> {
  const out = {} as Record<Cluster, number>;
  for (const c of CUSTOMERS) {
    out[c.cluster] = (out[c.cluster] || 0) + 1;
  }
  return out;
}

export function colorForCluster(cluster: Cluster): string {
  switch (cluster) {
    case "Sarasota":
      return COLORS.accentWarm;
    case "Tampa":
    case "Bradenton":
    case "Lakewood Ranch":
      return COLORS.success;
    case "Naples":
    case "Punta Gorda":
      return COLORS.accentSecondary;
    case "Siesta Key":
      return "#7CC8E8";
    default:
      return COLORS.textOnDark;
  }
}

/**
 * Live ARR projection — used by the Maintenance Plans engine right rail.
 * Default seed values come from handoff §5: 30% conversion, all 3 tiers
 * offered with weighting toward Bright Care, yields $25,873/yr.
 */
export function projectARR(
  totalCustomers: number,
  conversionPct: number,
  tierWeighting: { basics: number; care: number; guardian: number },
): { newARR: number; firstMonth: number; subscribers: number; weightedAvg: number } {
  const subscribers = Math.round((totalCustomers * conversionPct) / 100);
  const sumWeights =
    tierWeighting.basics + tierWeighting.care + tierWeighting.guardian || 1;
  const weightedAvg =
    (tierWeighting.basics * 249 +
      tierWeighting.care * 349 +
      tierWeighting.guardian * 589) /
    sumWeights;
  const newARR = Math.round(subscribers * weightedAvg);
  const firstMonth = Math.round(newARR / 12);
  return { newARR, firstMonth, subscribers, weightedAvg };
}

export const DEFAULT_TIER_WEIGHTING = { basics: 30, care: 50, guardian: 20 };

// ---- Quote system: fixture / infrastructure / labor catalog ----
//
// Pricing reflects mid-2026 Florida residential landscape lighting market for
// Cast Lighting / Unique Lighting Systems / FX Luminaire-caliber brass fixtures
// (the brands Bright Lights actually installs). Prices are turnkey "installed,"
// inclusive of fixture cost + standard labor on existing low-voltage runs.
// Trenching, transformer upgrades, and demo of legacy fixtures bill separately.

export type CatalogItem = {
  sku: string;
  category: "fixture" | "infrastructure" | "labor";
  group: string; // sub-group label e.g. "Path", "Up-light"
  name: string;
  description: string;
  unit: "ea" | "ft";
  unitPrice: number; // in dollars
  brand?: string;
};

export const FIXTURE_CATALOG: CatalogItem[] = [
  {
    sku: "CAST-PATH-LED3W",
    category: "fixture",
    group: "Path",
    name: "Cast LED Path Light · 3W",
    description: "Solid brass, 3W LED MR16, frosted lens. Lifetime warranty.",
    unit: "ea",
    unitPrice: 185,
    brand: "Cast Lighting",
  },
  {
    sku: "CAST-UPLT-MR16-5W",
    category: "fixture",
    group: "Up-light",
    name: "Cast Up-light · 5W MR16",
    description: "Brass adjustable knuckle, 5W LED, 35° beam.",
    unit: "ea",
    unitPrice: 215,
    brand: "Cast Lighting",
  },
  {
    sku: "UNIQUE-WELL-7W",
    category: "fixture",
    group: "Well",
    name: "Unique Well Light · 7W",
    description: "In-ground brass, 7W LED, drive-over rated.",
    unit: "ea",
    unitPrice: 245,
    brand: "Unique Lighting Systems",
  },
  {
    sku: "CAST-STEP-LED",
    category: "fixture",
    group: "Step",
    name: "Cast Step / Deck Light",
    description: "Low-profile brass, hard-wired, surface mount.",
    unit: "ea",
    unitPrice: 195,
    brand: "Cast Lighting",
  },
  {
    sku: "FX-HARDSCAPE",
    category: "fixture",
    group: "Hardscape",
    name: "FX Hardscape Light",
    description: "Mortar-mounted under-cap, 1.5W LED, brass body.",
    unit: "ea",
    unitPrice: 265,
    brand: "FX Luminaire",
  },
  {
    sku: "UNIQUE-POND-9W",
    category: "fixture",
    group: "Underwater",
    name: "Unique Underwater · 9W",
    description: "Sealed brass for pond/pool, 9W LED, 50° beam.",
    unit: "ea",
    unitPrice: 385,
    brand: "Unique Lighting Systems",
  },
  {
    sku: "CAST-WALLWASH",
    category: "fixture",
    group: "Wall wash",
    name: "Cast Wall Wash · 6W",
    description: "Brass, asymmetric beam, ideal for stucco wall facades.",
    unit: "ea",
    unitPrice: 245,
    brand: "Cast Lighting",
  },
];

export const INFRASTRUCTURE_CATALOG: CatalogItem[] = [
  {
    sku: "TF-MULTI-300W",
    category: "infrastructure",
    group: "Transformer",
    name: "Multi-tap Transformer · 300W",
    description: "Stainless, 12/13/14/15V taps, photocell ready.",
    unit: "ea",
    unitPrice: 695,
  },
  {
    sku: "TF-MULTI-600W",
    category: "infrastructure",
    group: "Transformer",
    name: "Multi-tap Transformer · 600W",
    description: "Stainless, 12-22V taps, dual circuit, photocell ready.",
    unit: "ea",
    unitPrice: 895,
  },
  {
    sku: "TF-MULTI-900W",
    category: "infrastructure",
    group: "Transformer",
    name: "Multi-tap Transformer · 900W",
    description: "Stainless, 4-circuit, smart-controller ready.",
    unit: "ea",
    unitPrice: 1195,
  },
  {
    sku: "WIRE-12-2",
    category: "infrastructure",
    group: "Wire",
    name: "Low-voltage Wire · 12-2",
    description: "Direct-bury rated, copper.",
    unit: "ft",
    unitPrice: 1.95,
  },
  {
    sku: "CTRL-WIFI",
    category: "infrastructure",
    group: "Controller",
    name: "Smart Controller · Wi-Fi",
    description: "App + voice control, scheduling, vacation mode.",
    unit: "ea",
    unitPrice: 475,
  },
  {
    sku: "PHOTO-CELL",
    category: "infrastructure",
    group: "Sensor",
    name: "Photocell Sensor",
    description: "Dusk-to-dawn auto-on/off.",
    unit: "ea",
    unitPrice: 85,
  },
];

export const LABOR_CATALOG: CatalogItem[] = [
  {
    sku: "LABOR-TRENCH",
    category: "labor",
    group: "Trenching",
    name: "Trenching · per linear ft",
    description: "Hand-trench 6-8\" depth, restoration included.",
    unit: "ft",
    unitPrice: 4.5,
  },
  {
    sku: "LABOR-DEMO",
    category: "labor",
    group: "Removal",
    name: "Demo / removal · per fixture",
    description: "Disconnect, pull, dispose old halogen / dead fixture.",
    unit: "ea",
    unitPrice: 25,
  },
  {
    sku: "LABOR-PERMIT",
    category: "labor",
    group: "Permit",
    name: "Permit fee (if required)",
    description: "City of Sarasota permit for new transformer install.",
    unit: "ea",
    unitPrice: 175,
  },
];

export const ALL_CATALOG: CatalogItem[] = [
  ...FIXTURE_CATALOG,
  ...INFRASTRUCTURE_CATALOG,
  ...LABOR_CATALOG,
];

// ---- Sample quotes (loaded into /quotes for demo) ----

export type QuoteLine = {
  sku: string;
  qty: number;
  // Snapshot at time of quote — never mutates if catalog price changes.
  unitPrice: number;
  description: string;
  unit: "ea" | "ft";
};

export type QuoteStatus = "draft" | "sent" | "accepted" | "expired";

export type Quote = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  address: string;
  date: string; // ISO YYYY-MM-DD
  validThrough: string;
  status: QuoteStatus;
  notes?: string;
  lines: QuoteLine[];
};

export const SALES_TAX_RATE = 0.075; // 7.5% Florida

export const SAMPLE_QUOTES: Quote[] = [
  {
    id: "BL-Q-2026-0142",
    number: "BL-Q-2026-0142",
    customerId: "BL-MJ",
    customerName: "Marcus Jenson",
    address: "4108 Egret Point Cir, Sarasota, FL 34239",
    date: "2026-05-03",
    validThrough: "2026-06-02",
    status: "draft",
    notes:
      "Retrofit of 8 dead halogen path fixtures + 6 new up-lights on the oaks. Customer also wants the in-ground wells along the seawall that we discussed in 2025-09 walkthrough.",
    lines: [
      { sku: "CAST-PATH-LED3W", qty: 8, unitPrice: 185, description: "Cast LED Path Light · 3W (driveway run)", unit: "ea" },
      { sku: "CAST-UPLT-MR16-5W", qty: 6, unitPrice: 215, description: "Cast Up-light · 5W MR16 (oak / palm)", unit: "ea" },
      { sku: "UNIQUE-WELL-7W", qty: 3, unitPrice: 245, description: "Unique Well Light · 7W (seawall accent)", unit: "ea" },
      { sku: "TF-MULTI-600W", qty: 1, unitPrice: 895, description: "Multi-tap Transformer · 600W (replaces 300W)", unit: "ea" },
      { sku: "WIRE-12-2", qty: 250, unitPrice: 1.95, description: "Low-voltage Wire · 12-2", unit: "ft" },
      { sku: "CTRL-WIFI", qty: 1, unitPrice: 475, description: "Smart Controller · Wi-Fi", unit: "ea" },
      { sku: "LABOR-DEMO", qty: 8, unitPrice: 25, description: "Demo / removal · old halogen path fixtures", unit: "ea" },
    ],
  },
  {
    id: "BL-Q-2026-0141",
    number: "BL-Q-2026-0141",
    customerId: "BL-CD",
    customerName: "Charles Davenport",
    address: "3014 Heron Bay Cir, Sarasota, FL 34239",
    date: "2026-05-01",
    validThrough: "2026-05-31",
    status: "sent",
    lines: [
      { sku: "CAST-UPLT-MR16-5W", qty: 4, unitPrice: 215, description: "Cast Up-light · 5W MR16 (front facade)", unit: "ea" },
      { sku: "FX-HARDSCAPE", qty: 6, unitPrice: 265, description: "FX Hardscape Light (front step caps)", unit: "ea" },
      { sku: "TF-MULTI-300W", qty: 1, unitPrice: 695, description: "Multi-tap Transformer · 300W", unit: "ea" },
      { sku: "WIRE-12-2", qty: 120, unitPrice: 1.95, description: "Low-voltage Wire · 12-2", unit: "ft" },
    ],
  },
  {
    id: "BL-Q-2026-0140",
    number: "BL-Q-2026-0140",
    customerId: "BL-JZ",
    customerName: "John Zelinsky",
    address: "3247 Magnolia Cove Ln, Sarasota, FL 34231",
    date: "2026-04-26",
    validThrough: "2026-05-26",
    status: "accepted",
    lines: [
      { sku: "UNIQUE-POND-9W", qty: 4, unitPrice: 385, description: "Unique Underwater · 9W (pool wash)", unit: "ea" },
      { sku: "CAST-WALLWASH", qty: 3, unitPrice: 245, description: "Cast Wall Wash · 6W (stucco facade)", unit: "ea" },
      { sku: "CAST-PATH-LED3W", qty: 12, unitPrice: 185, description: "Cast LED Path Light · 3W (paver path)", unit: "ea" },
      { sku: "TF-MULTI-900W", qty: 1, unitPrice: 1195, description: "Multi-tap Transformer · 900W", unit: "ea" },
      { sku: "WIRE-12-2", qty: 380, unitPrice: 1.95, description: "Low-voltage Wire · 12-2", unit: "ft" },
      { sku: "CTRL-WIFI", qty: 1, unitPrice: 475, description: "Smart Controller · Wi-Fi", unit: "ea" },
      { sku: "LABOR-TRENCH", qty: 80, unitPrice: 4.5, description: "Trenching · paver run", unit: "ft" },
    ],
  },
  {
    id: "BL-Q-2026-0136",
    number: "BL-Q-2026-0136",
    customerId: "BL-KM",
    customerName: "Karen Maddox",
    address: "612 Coral Reef Way, Siesta Key, FL 34242",
    date: "2026-04-12",
    validThrough: "2026-05-12",
    status: "expired",
    lines: [
      { sku: "CAST-PATH-LED3W", qty: 6, unitPrice: 185, description: "Cast LED Path Light · 3W", unit: "ea" },
      { sku: "TF-MULTI-300W", qty: 1, unitPrice: 695, description: "Multi-tap Transformer · 300W", unit: "ea" },
    ],
  },
];

export function quoteSubtotal(quote: Quote): number {
  return quote.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
}

export function quoteTotal(quote: Quote): { subtotal: number; tax: number; total: number } {
  const subtotal = quoteSubtotal(quote);
  const tax = Math.round(subtotal * SALES_TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}
