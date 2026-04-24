import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { TopographicBg } from "@/components/topographic-bg";
import { ENGINES } from "@/content/engines";

export const metadata: Metadata = {
  title: "Product · The seven-engine operating system for landscaping revenue",
  description:
    "GladiusTurf replaces Jobber, LMN, Service Autopilot and a stack of point tools with seven outcome-driven engines that share one data spine — quote to schedule to crew to invoice to review to upsell.",
};

// ─── Inline SVG icons (lucide style, RSC-safe, no extra deps) ──────

type IconProps = { className?: string };

function IconSparkles({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

function IconZap({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function IconTarget({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconShield({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function IconBrain({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 0 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 0 1 12 18Z" />
    </svg>
  );
}

function IconCloudRain({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 14v6" />
      <path d="M8 14v6" />
      <path d="M12 16v6" />
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    </svg>
  );
}

function IconBoxes({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
      <path d="m7 16.5-4.74-2.85" />
      <path d="m7 16.5 5-3" />
      <path d="M7 16.5v5.17" />
      <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
      <path d="m17 16.5-5-3" />
      <path d="m17 16.5 4.74-2.85" />
      <path d="M17 16.5v5.17" />
      <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0z" />
      <path d="M12 8 7.26 5.15" />
      <path d="m12 8 4.74-2.85" />
      <path d="M12 13.5V8" />
    </svg>
  );
}

function IconArrowRight({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconChevronRight({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

// ─── Engine icon map ───────────────────────────────────────────────

const ENGINE_ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  "quote-intercept": IconZap,
  "upsell-whisperer": IconSparkles,
  "referral-radar": IconTarget,
  "applicator-shield": IconShield,
  "site-memory": IconBrain,
  "weather-pivot": IconCloudRain,
  "surplus-yard": IconBoxes,
};

// ─── Engine deep copy (kept verbatim from prior page) ──────────────

type EngineCopy = {
  slug: string;
  tagline: string;
  paragraphs: string[];
  features: string[];
};

const ENGINE_COPY: EngineCopy[] = [
  {
    slug: "quote-intercept",
    tagline: "The first hour decides the deal.",
    paragraphs: [
      "Eighty percent of mowing, hardscape, and irrigation estimates are won or lost in the first sixty minutes after the request hits your inbox. Quote Intercept watches every channel — web form, Google LSA, Angi, voicemail transcript, ServiceTitan booking, even the foreman&rsquo;s scribbled note photographed from the truck — and pulls every inbound into one queue with a single owner and a hard SLA.",
      "The engine then reprices the request against your last twelve months of margin data. Within ninety seconds it produces a quote the rep can send as-is or sharpen in two clicks. The client gets a live, mobile-signable proposal — not a PDF buried in a Gmail thread.",
      "If the rep doesn&rsquo;t move on it, escalation does. Foreman at four hours. Owner at twelve. Lost-deal autopsy at seventy-two. The average shop running Intercept recovers eighteen to twenty-two estimates a month that would have rotted in voicemail — at $1,840 average ticket, that&rsquo;s the bill paid before week two.",
    ],
    features: [
      "Twelve-month margin model auto-prices mow, hardscape, irrigation, and tree work",
      "Live e-sign proposals replace PDF attachments and chasing phone tag",
      "SLA escalations route to rep, foreman, owner — with timestamps you can audit",
      "Lost-deal autopsy flags pricing or response gaps before they become patterns",
    ],
  },
  {
    slug: "upsell-whisperer",
    tagline: "The route is the salesfloor.",
    paragraphs: [
      "Every existing property under contract is a continuous inspection target. Upsell Whisperer pulls satellite imagery, soil-temperature data, the property&rsquo;s mow history, the irrigation controller&rsquo;s leak log, the last fertilization round, and a year of crew photo notes — then surfaces what each property needs this week.",
      "When the crew rolls up Monday morning, they don&rsquo;t open a clipboard. They open the property card and see a prioritized list of three to five whisper-upsells, each with a photo from last visit, a script written for that crew&rsquo;s reading level, and a price already approved by the office. The foreman walks the homeowner outside, points, takes one new photo, and the proposal is texted before the truck pulls away.",
      "Average shop adds $38,000 a month in unbooked revenue inside ninety days — without hiring a salesperson, without running a single outbound campaign, without a homeowner ever feeling sold. Whisper, don&rsquo;t pitch.",
    ],
    features: [
      "Satellite, soil, irrigation, and crew-photo data fused into a per-property work list",
      "Pre-priced add-ons for aeration, overseed, mulch refresh, drainage, tree, and irrigation repair",
      "Photo-backed text proposals signed in the driveway before the truck leaves",
      "Crew-readable scripts so foremen can pitch without a cold-call manager",
    ],
  },
  {
    slug: "referral-radar",
    tagline: "Every premium job is a billboard.",
    paragraphs: [
      "Referral Radar maps every active property to its neighbors, its HOA, and its referral lineage. It knows which crews and which reps generate referrals — and which ones quietly burn them.",
      "When a premium hardscape, install, or full-renovation job wraps, Radar fires the same afternoon. A geotargeted postcard hits the next-door and across-the-street addresses by Wednesday. A text drop reaches the HOA distribution list. A doorhanger queue prints to the foreman&rsquo;s next morning.",
      "Radar also publishes a weekly Referral Health score per crew and per rep. We&rsquo;ve seen single shops claw back $180,000 a year in referral revenue that was sitting on the table because nobody was measuring the silent leak.",
    ],
    features: [
      "Geo-graph of every property, neighbor, and HOA tied to historical referral revenue",
      "Same-day postcard, text, and doorhanger campaigns triggered by job completion",
      "Per-crew and per-rep Referral Health scoring with leak alerts",
      "Yard-sign-to-revenue attribution so you know what marketing is actually working",
    ],
  },
  {
    slug: "applicator-shield",
    tagline: "One missed renewal is one closed business.",
    paragraphs: [
      "Pesticide and fertilizer compliance is the silent business-killer in lawn maintenance. State applicator licenses, EPA product registrations, drift-risk wind windows, REI hold periods, organic-certified zone overrides, sensitive-site setbacks — all live in spreadsheets, sticky notes, and the head of one office manager.",
      "Applicator Shield watches every applicator&rsquo;s license, every chemical&rsquo;s registration, every spray ticket against real-time wind and humidity, and every renewal CEU your team is due. If a tech tries to log a 2,4-D application on a windy Thursday next to a school zone, Shield blocks the ticket. If an inspector calls, you produce a complete spray-and-license audit in under five minutes.",
      "One avoided fine pays for five years of GladiusTurf. One protected license keeps the doors open. This is the engine you don&rsquo;t notice — until the day it earns its keep ten times over.",
    ],
    features: [
      "Live license tracking with auto-renewal queues for every applicator and every state",
      "Per-product registration, REI, and sensitive-site rules enforced at ticket creation",
      "Real-time weather and wind blocks for drift-risk applications",
      "One-click inspector audit pack — every spray, every license, every CEU",
    ],
  },
  {
    slug: "site-memory",
    tagline: "Knowledge that survives turnover.",
    paragraphs: [
      "Every landscaping shop loses tribal knowledge to turnover. The gate code on the Henderson property. The dog that bites only when the gate is left open. The sprinkler zone that&rsquo;s been miswired since the pool install. The slope on the back lawn that flips a 36-inch zero-turn. Today this lives in the head of one ten-year foreman.",
      "Site Memory captures all of it on the first visit and every visit after. Every photo, every note, every gate code, every irrigation map, every chemical applied, every plant installed, every crew handoff — indexed against the property and searchable by any new hire from their phone. Onboarding for a new foreman drops from six months to six weeks.",
      "Memory also publishes a Site Health score per property — open issues, pending upsells, complaint history, payment cadence — so when a sales call comes in for renewal, the rep sees the truth, not a guess.",
    ],
    features: [
      "Per-property knowledge graph: gate codes, pets, irrigation maps, slope notes, client preferences",
      "Crew handoff capture on every visit — text, photo, voice memo",
      "Searchable from the foreman&rsquo;s phone in under three seconds",
      "Site Health score surfaces open issues, upsells, and risks before the renewal call",
    ],
  },
  {
    slug: "weather-pivot",
    tagline: "The forecast is a route plan.",
    paragraphs: [
      "Weather is the variable that breaks every landscaping schedule, and every shop manages it the same broken way: the dispatcher watches the radar, the crews wait for a phone call, the clients call angry when their Tuesday mow becomes a Friday-afternoon scramble. Weather Pivot ends it.",
      "Pivot watches a rolling seven-day forecast against every scheduled visit — mow, fert round, hardscape pour, irrigation start-up, leaf cleanup, snow plow, salt run. When a storm shifts, it reshuffles the route by service type and crew skill, holds chemical-sensitive applications until the wind drops, and texts every affected client the new arrival window before they wonder.",
      "Pivot also closes the loop on snow: pre-storm crew calls, mid-event push reports, post-event property photos, and an invoice generated against the actual storm depth pulled from NOAA. Storm Saturdays stop being Storm Saturdays.",
    ],
    features: [
      "Rolling seven-day forecast model against every scheduled visit",
      "Auto-reshuffle by service type, crew skill, and chemical-safe windows",
      "Client-facing arrival-window texts and post-service photo proofs",
      "Snow ops mode with NOAA-verified depths and auto-generated per-storm invoices",
    ],
  },
  {
    slug: "surplus-yard",
    tagline: "What rots in the yard becomes revenue.",
    paragraphs: [
      "Every landscaping shop runs a graveyard out back: pallets of leftover sod, three skids of mulch the homeowner didn&rsquo;t want, a stack of granite pavers from a returned hardscape, two used Stihl trimmers, a like-new aerator from a discontinued line. The accountant calls it shrinkage. The yard guy calls it Tuesday. Across the metro, ten other shops are paying retail for the exact same materials this week.",
      "Surplus Yard is the marketplace that closes the loop. List a pallet, a tree, a tool, or a load — set the price, set the pickup window, attach a photo. Other GladiusTurf shops in your radius see it instantly, pay through the platform, and pick up. GladiusTurf takes a 3% rail fee.",
      "Average shop recovers $20,000 to $60,000 a year in margin that was previously a write-off. It&rsquo;s also the engine that builds the network: every shop on Surplus Yard becomes a node in the Gladius operating crew.",
    ],
    features: [
      "Multi-shop marketplace for sod, mulch, stone, plants, trees, and equipment",
      "Stripe Connect rail with 3% platform fee, automatic 1099 tracking",
      "Geo-radius listings so material moves locally and pickup is same-day",
      "Inventory write-offs reclassified to revenue line — your CFO will smile",
    ],
  },
];

const INTEGRATIONS: { name: string; line: string }[] = [
  {
    name: "QuickBooks",
    line: "Two-way sync for customers, invoices, payments, and class tracking. Your bookkeeper doesn&rsquo;t change a workflow.",
  },
  {
    name: "Stripe",
    line: "Card-on-file, ACH, and Stripe Connect rails for Surplus Yard payouts. PCI scope stays out of your shop.",
  },
  {
    name: "Twilio",
    line: "Compliant client texting with A2P 10DLC handled, plus ringless voicemail for the dead-quote queue.",
  },
  {
    name: "ServiceTitan",
    line: "Native bridge for shops running Titan on tree, irrigation, or commercial divisions — bidirectional jobs and invoices.",
  },
  {
    name: "Aspire",
    line: "One-click migration of properties, contracts, and crew schedules. Most shops imported in under four hours.",
  },
];

const ARCHITECTURE_STEPS = [
  "Quote",
  "Schedule",
  "Crew",
  "Invoice",
  "Review",
  "Upsell",
];

function dangerouslyHTML(input: string) {
  return { __html: input };
}

// ─── Feature mock dispatcher (one tasteful mock per engine) ────────

function FeatureMock({ slug }: { slug: string }) {
  switch (slug) {
    case "quote-intercept":
      return <MockQuoteQueue />;
    case "upsell-whisperer":
      return <MockUpsellList />;
    case "referral-radar":
      return <MockReferralMap />;
    case "applicator-shield":
      return <MockComplianceLog />;
    case "site-memory":
      return <MockSiteCard />;
    case "weather-pivot":
      return <MockWeatherRoute />;
    case "surplus-yard":
      return <MockSurplusBoard />;
    default:
      return null;
  }
}

const MOCK_FRAME =
  "rounded-2xl border border-bone/10 bg-bone/[0.02] aspect-[4/3] p-6 overflow-hidden relative";

function MockQuoteQueue() {
  const rows = [
    { src: "Web form", addr: "412 Maple Ridge", min: "00:42", price: "$1,840" },
    { src: "Google LSA", addr: "8 Birchwood Ln", min: "01:18", price: "$2,940" },
    { src: "Voicemail", addr: "27 Cedar Ct", min: "03:07", price: "$640" },
    { src: "Angi", addr: "112 Oak Hollow", min: "04:55", price: "$3,210" },
  ];
  return (
    <div className={MOCK_FRAME}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss-bright">
          Inbound queue
        </span>
        <span className="font-mono text-[11px] text-bone/40">SLA · 60min</span>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.addr}
            className="flex items-center justify-between rounded-lg border border-bone/5 bg-forest-deep/40 px-3 py-2.5"
          >
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-wider text-bone/40">
                {r.src}
              </span>
              <span className="text-[13px] text-bone/80">{r.addr}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-moss-bright">{r.min}</span>
              <span className="font-mono text-[12px] font-semibold text-bone">
                {r.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockUpsellList() {
  const items = [
    { tag: "Aeration", label: "Cool-season turf, due", price: "$340" },
    { tag: "Tree", label: "Bradford pear · split limb", price: "$880" },
    { tag: "Irrigation", label: "Zone 4 · 30% over baseline", price: "$210" },
    { tag: "Mulch", label: "Front bed thinned", price: "$420" },
  ];
  return (
    <div className={MOCK_FRAME}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss-bright">
          412 Maple Ridge · today
        </span>
        <span className="font-mono text-[11px] text-bone/40">$1,850 ready</span>
      </div>
      <div className="space-y-2.5">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center gap-3 rounded-lg border border-bone/5 bg-forest-deep/40 px-3 py-2.5"
          >
            <span className="rounded-full border border-moss/30 bg-moss/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-moss-bright">
              {it.tag}
            </span>
            <span className="flex-1 text-[13px] text-bone/80">{it.label}</span>
            <span className="font-mono text-[12px] font-semibold text-bone">
              {it.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockReferralMap() {
  return (
    <div className={MOCK_FRAME}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss-bright">
          Birch cul-de-sac
        </span>
        <span className="font-mono text-[11px] text-bone/40">11 jobs · $46.2K</span>
      </div>
      <svg viewBox="0 0 320 180" className="w-full">
        {[
          [60, 60],
          [120, 40],
          [180, 70],
          [240, 50],
          [90, 110],
          [160, 130],
          [220, 110],
          [280, 90],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={i === 2 ? 9 : 5} fill="#9DFF8A" opacity={i === 2 ? 1 : 0.45} />
            {i > 0 && (
              <line
                x1={x}
                y1={y}
                x2={180}
                y2={70}
                stroke="#9DFF8A"
                strokeWidth="0.6"
                opacity="0.25"
              />
            )}
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-bone/40">
        <span>Source · Halls / Birch</span>
        <span className="text-moss-bright">Postcards · Wed</span>
      </div>
    </div>
  );
}

function MockComplianceLog() {
  const rows = [
    { tech: "M. Alvarez", lic: "FL · 1284", days: "62d", ok: true },
    { tech: "J. Park", lic: "GA · 4419", days: "expired", ok: false },
    { tech: "T. Reed", lic: "FL · 9912", days: "210d", ok: true },
    { tech: "S. Khan", lic: "AL · 0577", days: "47d", ok: true },
  ];
  return (
    <div className={MOCK_FRAME}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss-bright">
          Applicator log
        </span>
        <span className="font-mono text-[11px] text-bone/40">Wind 14mph · hold</span>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.tech}
            className="flex items-center justify-between rounded-lg border border-bone/5 bg-forest-deep/40 px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  r.ok ? "bg-moss-bright" : "bg-lime-bright"
                }`}
              />
              <span className="text-[13px] text-bone/80">{r.tech}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-bone/40">{r.lic}</span>
              <span
                className={`font-mono text-[12px] ${
                  r.ok ? "text-bone" : "text-lime-bright"
                }`}
              >
                {r.days}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockSiteCard() {
  return (
    <div className={MOCK_FRAME}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss-bright">
          27 Henderson Way
        </span>
        <span className="font-mono text-[11px] text-bone/40">Site Health · 92</span>
      </div>
      <div className="space-y-1.5 text-[12px]">
        {[
          ["Gate code", "8842 · north panel"],
          ["Dog", "Boxer · friendly · keep gate latched"],
          ["Slope", "Back lawn 18° — push, no zero-turn"],
          ["Irrigation", "Zone 3 miswired since 2019"],
          ["Client pref", "Calls before 7a only"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="flex items-baseline justify-between border-b border-bone/5 py-1.5"
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-bone/40">
              {k}
            </span>
            <span className="text-right text-[12px] text-bone/80">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockWeatherRoute() {
  const days = [
    { d: "Mon", v: 32, ok: true },
    { d: "Tue", v: 18, ok: false },
    { d: "Wed", v: 41, ok: true },
    { d: "Thu", v: 28, ok: true },
    { d: "Fri", v: 12, ok: false },
    { d: "Sat", v: 38, ok: true },
    { d: "Sun", v: 22, ok: true },
  ];
  return (
    <div className={MOCK_FRAME}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss-bright">
          7-day route plan
        </span>
        <span className="font-mono text-[11px] text-bone/40">2 reshuffles</span>
      </div>
      <div className="flex h-32 items-end gap-3">
        {days.map((day) => (
          <div key={day.d} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={`w-full rounded-t-md ${
                day.ok ? "bg-moss-bright/80" : "bg-lime-bright/30"
              }`}
              style={{ height: `${(day.v / 50) * 100}%` }}
            />
            <span className="font-mono text-[10px] uppercase tracking-wider text-bone/40">
              {day.d}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-bone/40">
        Tue + Fri · chemical hold · auto-text sent
      </p>
    </div>
  );
}

function MockSurplusBoard() {
  const listings = [
    { item: "Bermuda sod · 12 pal", mi: "4mi", price: "$680" },
    { item: "Granite paver · 220sf", mi: "9mi", price: "$1,120" },
    { item: "Stihl FS131 · used", mi: "11mi", price: "$240" },
    { item: "Red maple · 2.5\" cal", mi: "6mi", price: "$185" },
  ];
  return (
    <div className={MOCK_FRAME}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss-bright">
          Surplus near you
        </span>
        <span className="font-mono text-[11px] text-bone/40">3% rail · same-day</span>
      </div>
      <div className="space-y-2">
        {listings.map((l) => (
          <div
            key={l.item}
            className="flex items-center justify-between rounded-lg border border-bone/5 bg-forest-deep/40 px-3 py-2.5"
          >
            <span className="text-[13px] text-bone/80">{l.item}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-bone/40">{l.mi}</span>
              <span className="font-mono text-[12px] font-semibold text-bone">
                {l.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────

export default function ProductPage() {
  return (
    <>
      <Nav />
      <main className="bg-forest-deep">
        {/* 1. Hero */}
        <section className="relative overflow-hidden border-b border-bone/5 bg-forest-deep">
          <TopographicBg />
          <div className="relative mx-auto max-w-7xl px-6 py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-3 py-1 text-xs font-medium text-moss-bright">
              <IconSparkles className="h-3 w-3" /> The product
            </span>
            <h1 className="mt-6 max-w-5xl font-serif text-5xl tracking-[-0.02em] text-bone md:text-6xl">
              The seven-engine operating system for landscaping revenue.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-[1.55] text-bone/60">
              GladiusTurf replaces the scattered stack — Jobber for jobs, LMN for
              estimates, Service Autopilot for routes, a CRM for clients, a
              compliance binder for the state, a whiteboard for everything else
              — with one revenue intelligence layer. Seven engines, one data
              spine, one number going into your bank account every month.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href="/demo"
                className="inline-flex items-center gap-2 rounded-full bg-lime-bright px-7 py-3.5 text-base font-semibold text-forest hover:bg-moss transition-all shadow-cta"
              >
                Book a demo <IconArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-bone/15 px-6 py-3.5 text-base font-medium text-bone/80 hover:border-moss-bright hover:text-moss-bright transition-colors"
              >
                See pricing <IconArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* 2. The premise band */}
        <section className="border-b border-bone/5 bg-forest-mid">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss-bright">
                  The premise
                </p>
                <h2 className="mt-6 font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                  A feature is a button.
                  <br />
                  <span className="text-bone/40">An engine is an outcome.</span>
                </h2>
              </div>
              <div className="md:col-span-2">
                <p className="text-lg leading-[1.6] text-bone/60">
                  Legacy field-service software is a database with a paint job.
                  You log work, you bill it, you run a report. Nothing in the
                  product gets paid for performance. GladiusTurf inverts that.
                  Every engine ships against a specific dollar number — saved
                  deals, recovered referrals, prevented fines, recaptured
                  margin — and we write that number on the contract. If an
                  engine isn&rsquo;t moving its number inside ninety days, we
                  retire it. That&rsquo;s the deal.
                </p>
                <p className="mt-6 text-base leading-[1.7] text-bone/40">
                  The seven engines below share one data spine: every quote,
                  every schedule, every crew note, every invoice, every review
                  feeds the next loop. There is no double-entry. There is no
                  &ldquo;export to CSV.&rdquo; There is one revenue brain.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Engines section header */}
        <section id="engines" aria-label="Seven engines, in detail" className="bg-forest-deep">
          <div className="mx-auto max-w-7xl px-6 pt-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-3 py-1 text-xs font-medium text-moss-bright">
                <IconZap className="h-3 w-3" /> Seven engines, one spine
              </span>
              <h2 className="mt-6 font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                Every revenue gap your stack is leaking through.
                <br />
                <span className="text-bone/40">One engine per gap.</span>
              </h2>
            </div>
          </div>

          {/* 4. Per-engine alternating blocks */}
          <div className="mx-auto max-w-7xl px-6 pb-28">
            {ENGINES.map((engine, i) => {
              const copy = ENGINE_COPY.find((c) => c.slug === engine.slug);
              if (!copy) return null;
              const Icon = ENGINE_ICONS[engine.slug] ?? IconSparkles;
              const reverse = i % 2 === 1;
              return (
                <article
                  key={engine.slug}
                  id={engine.slug}
                  className="mt-24 grid scroll-mt-24 items-center gap-12 md:grid-cols-2 first:mt-20"
                >
                  {/* Copy side */}
                  <div className={reverse ? "md:order-2" : "md:order-1"}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-3 py-1 text-xs font-medium text-moss-bright">
                      <Icon className="h-3 w-3" />
                      <span className="font-mono">
                        {engine.number} · {engine.name}
                      </span>
                    </span>
                    <h3 className="mt-5 font-serif text-3xl tracking-tight text-bone md:text-4xl">
                      {copy.tagline}
                    </h3>
                    <p className="mt-5 text-lg leading-[1.55] text-bone/60">
                      {engine.description}
                    </p>
                    {copy.paragraphs.map((p, idx) => (
                      <p
                        key={idx}
                        className="mt-4 text-base leading-[1.7] text-bone/50"
                        dangerouslySetInnerHTML={dangerouslyHTML(p)}
                      />
                    ))}
                    <ul className="mt-6 space-y-3">
                      {copy.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-3 text-sm text-bone/70"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-moss-bright"
                          />
                          <span dangerouslySetInnerHTML={dangerouslyHTML(f)} />
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-bone/10 bg-bone/5 px-4 py-1.5">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-bone/40">
                        Outcome
                      </span>
                      <span className="font-mono text-[13px] font-semibold text-moss-bright">
                        {engine.outcome}
                      </span>
                    </div>
                  </div>

                  {/* Mock side */}
                  <div className={reverse ? "md:order-1" : "md:order-2"}>
                    <FeatureMock slug={engine.slug} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 5. Architecture flow */}
        <section
          id="architecture"
          className="border-y border-bone/5 bg-forest-mid"
        >
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-3 py-1 text-xs font-medium text-moss-bright">
                <IconBrain className="h-3 w-3" /> Architecture
              </span>
              <h2 className="mt-6 font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                One spine. Seven engines.
              </h2>
              <p className="mt-6 text-lg leading-[1.6] text-bone/60">
                The same property record feeds every screen. The same client
                identity follows every touch. There is one source of truth, and
                every engine writes back to it.
              </p>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
              {ARCHITECTURE_STEPS.map((step, idx) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] px-5 py-3 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">
                      Step {String(idx + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 font-serif text-lg text-bone">{step}</p>
                  </div>
                  {idx < ARCHITECTURE_STEPS.length - 1 && (
                    <IconChevronRight className="h-5 w-5 text-moss-bright" />
                  )}
                </div>
              ))}
            </div>

            <p className="mx-auto mt-12 max-w-3xl text-center text-base leading-[1.7] text-bone/50">
              A four-truck shop using GladiusTurf acts like a forty-truck operation.
              The completed job feeds the next-touch queue and the neighbor campaign.
              The property never goes quiet between renewals.
            </p>
          </div>
        </section>

        {/* 6. Integrations */}
        <section
          id="integrations"
          className="border-b border-bone/5 bg-forest-deep"
        >
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-3 py-1 text-xs font-medium text-moss-bright">
                <IconBoxes className="h-3 w-3" /> Integrations
              </span>
              <h2 className="mt-6 font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                Plays with the stack you already pay for.
              </h2>
              <p className="mt-6 text-lg leading-[1.6] text-bone/60">
                The fastest way to lose a switching customer is to demand a
                rip-and-replace on day one. We don&rsquo;t. Plug in and we&rsquo;ll
                retire what&rsquo;s redundant on your timeline.
              </p>
            </div>

            <ul className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-5">
              {INTEGRATIONS.map((it) => (
                <li
                  key={it.name}
                  className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-5 transition-colors hover:border-moss/30"
                >
                  <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-moss-bright">
                    {it.name}
                  </h3>
                  <p
                    className="mt-3 text-[13px] leading-[1.55] text-bone/60"
                    dangerouslySetInnerHTML={dangerouslyHTML(it.line)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
