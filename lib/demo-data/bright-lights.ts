/**
 * Bright Lights Landscape Lighting — demo fixture data.
 *
 * Sourced from /docs/bright-lights-demo-handoff.md sections 1, 3, 5.
 * Customer names lifted from Bright Lights' public Google + Facebook reviews.
 * No PII fabricated — addresses are placeholders documented as such.
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
    name: "Dave Caiati",
    address: "2840 Bay Shore Rd",
    city: "Sarasota",
    zip: "34234",
    cluster: "Sarasota",
    installYear: 2020,
    fixtures: 30,
    brand: "Cast LED",
    lastService: null,
    notes: "Finished install of over 30 lights in a single day.",
    language: "en",
    lat: 27.378,
    lng: -82.555,
  },
  {
    id: "BL-JZ",
    name: "John Zagelmeier",
    address: "6125 Hollywood Blvd",
    city: "Sarasota",
    zip: "34231",
    cluster: "Sarasota",
    installYear: 2019,
    fixtures: 22,
    brand: "Cast LED",
    lastService: "2024-08-12",
    notes: "Helped me to repair a sinking paver next to my pool — pool/cooking area system.",
    language: "en",
    lat: 27.295,
    lng: -82.524,
  },
  {
    id: "BL-TB",
    name: "Tom Brammeier",
    address: "4521 Riverview Blvd",
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
    name: "Manav Malik",
    address: "7204 Skyline Dr",
    city: "Sarasota",
    zip: "34243",
    cluster: "Sarasota",
    installYear: 2021,
    fixtures: 15,
    brand: "Cast LED",
    lastService: "2023-11-08",
    notes: "If there is any warranty repair or issue, he happily takes care of it.",
    language: "en",
    lat: 27.398,
    lng: -82.481,
  },
  {
    id: "BL-MJ",
    name: "Mike Jackson",
    address: "3315 Bayview Pkwy",
    city: "Sarasota",
    zip: "34239",
    cluster: "Sarasota",
    installYear: 2020,
    fixtures: 24,
    brand: "Cast LED",
    lastService: "2025-09-21",
    notes:
      "Watch for sinking paver near pool — repaired 2020. Customer prefers Tuesday afternoon visits. Cooking area system was 2 separate visits — keep an eye on those bulbs.",
    language: "en",
    referralSource: "Neighbor — John Zagelmeier",
    lat: 27.314,
    lng: -82.519,
  },
  {
    id: "BL-KS",
    name: "Kathleen Smith",
    address: "8819 Misty Creek Dr",
    city: "Sarasota",
    zip: "34241",
    cluster: "Sarasota",
    installYear: 2023,
    fixtures: 16,
    brand: "Cast LED",
    lastService: null,
    notes: "Cristian and his son did an awesome job — pool cage.",
    language: "en",
    lat: 27.260,
    lng: -82.395,
  },
  {
    id: "BL-KM",
    name: "Karen Magno",
    address: "412 Beach Rd",
    city: "Siesta Key",
    zip: "34242",
    cluster: "Siesta Key",
    installYear: 2017,
    fixtures: 12,
    brand: "Cast LED (older system)",
    lastService: "2024-03-19",
    notes: "Always get prompt service — came out the day I called. 7 years since install.",
    language: "en",
    lat: 27.260,
    lng: -82.557,
  },
  {
    id: "BL-JS",
    name: "Janice Scott",
    address: "5602 Macadamia Ln",
    city: "Sarasota",
    zip: "34232",
    cluster: "Sarasota",
    installYear: 2019,
    fixtures: 14,
    brand: "Unique",
    lastService: "2024-05-04",
    notes: "Came out promptly and fixed our problem.",
    language: "en",
    lat: 27.323,
    lng: -82.467,
  },
  {
    id: "BL-CD",
    name: "Charles Diehl",
    address: "2107 Bayshore Dr",
    city: "Sarasota",
    zip: "34239",
    cluster: "Sarasota",
    installYear: 2021,
    fixtures: 28,
    brand: "Cast LED",
    lastService: null,
    notes: "Five star service & then some — goes above & beyond.",
    language: "en",
    lat: 27.305,
    lng: -82.541,
  },
  {
    id: "BL-JB",
    name: "Jayant Bhalerao",
    address: "6730 Spring Hill Dr",
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
    name: "Allison Archer",
    address: "1815 Avenida del Mare",
    city: "Sarasota",
    zip: "34242",
    cluster: "Siesta Key",
    installYear: 2020,
    fixtures: 19,
    brand: "Cast LED + Unique",
    lastService: null,
    notes: "Christian is the best!",
    language: "en",
    lat: 27.276,
    lng: -82.553,
  },
  {
    id: "BL-MX",
    name: "Marc Matusewitch",
    address: "5102 Cape Cole Blvd",
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
  { id: "BL-MJ-024", type: "Replacement Up Light (in rain)", brand: "Cast", model: "CWL5", wattage: "5W", installDate: "2025-09-21", warrantyStatus: "active", warrantyEnd: "2030-09-21", note: "Replaced in the rain by Cristian — customer's note in their review." },
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
      "Cristian came out the day Mike called and replaced BL-MJ-024 in the rain. New 5-yr Cast warranty issued to 2030-09. Customer's Google review references this visit verbatim.",
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
    text: "Mike Jackson — fixture warranty expired 14 days ago — upgrade opportunity",
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
    text: "Karen Magno (Siesta Key) — 7 years since install, hasn't been serviced",
    tone: "warning",
  },
  {
    id: "act_4",
    ts: "this week",
    customerId: "BL-CD",
    text: "Charles Diehl — left a 5★ Google review · auto-routed for thank-you note",
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
    text: "Jayant Bhalerao — post-Helene check-in delivered, system intact",
    tone: "success",
  },
  {
    id: "act_7",
    ts: "today",
    customerId: "BL-DC",
    text: "Dave Caiati — 30-light system at 5 yrs · maintenance plan eligible",
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
  id: "independent" | "professional" | "enterprise";
  name: string;
  price: number; // $/mo
  bullets: string[];
  recommendedForBL?: boolean;
};

export const GLADIUS_TIERS: GladiusTier[] = [
  {
    id: "independent",
    name: "Independent",
    price: 99,
    bullets: [
      "1 user seat",
      "Up to 100 active customers",
      "Quoting + invoicing + payments",
      "Online booking + scheduling",
      "Branded client portal",
      "Mobile crew app",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 399,
    recommendedForBL: true,
    bullets: [
      "2 user seats — Cristian + Felipe",
      "Up to 500 active customers",
      "Maintenance plan engine included",
      "Bilingual templates included",
      "Storm Mode included",
      "Route batching included",
      "AI receptionist (coming Q3 2026)",
      "Centurion Live tracking (coming July 2026)",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    bullets: [
      "5+ user seats",
      "Unlimited customers",
      "Multi-branch support",
      "Outbound revenue agent (coming Q4 2026)",
      "Custom integrations",
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
