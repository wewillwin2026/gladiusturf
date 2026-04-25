import type { Metadata } from "next";
import {
  ArrowRight,
  Brain,
  Database,
  DollarSign,
  Mail,
  Phone,
  Plug,
  Sparkles,
  Truck,
} from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "Integrations — Plays with the stack you already pay for",
  description:
    "QuickBooks, Stripe, Twilio, Aspire, LMN, Jobber, Service Autopilot, ServiceTitan, Samsara, Real Green imports — and a typed API for everything else.",
};

type IntegrationStatus = "Native" | "API" | "CSV" | "Coming";

type Integration = {
  name: string;
  status: IntegrationStatus;
  blurb: string;
};

type Category = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  icon: typeof DollarSign;
  tone: "moss" | "honey";
  bg: "deep" | "mid";
  items: Integration[];
};

const CATEGORIES: Category[] = [
  {
    id: "accounting",
    eyebrow: "Accounting",
    title: "The general ledger you already trust.",
    intro:
      "Books are the one place you can't afford a migration scare. We sync your invoices, payments, customers, and items two ways — so the GL your accountant has been reconciling for a decade keeps reconciling.",
    icon: DollarSign,
    tone: "moss",
    bg: "deep",
    items: [
      {
        name: "QuickBooks Online",
        status: "Native",
        blurb:
          "Sync invoices, payments, customers, items. Two-way sync. Match GL accounts to job-costed line items.",
      },
      {
        name: "QuickBooks Desktop",
        status: "API",
        blurb:
          "Sync via Web Connector. Supports invoices, customers, items.",
      },
      {
        name: "Xero",
        status: "API",
        blurb:
          "Sync invoices and payments. Customer match by email plus phone.",
      },
      {
        name: "Wave",
        status: "Coming",
        blurb:
          "On the roadmap for Q3. Email founders@gladiusturf.com to vote it forward.",
      },
      {
        name: "Sage Intacct",
        status: "API",
        blurb:
          "Available on Enterprise tier with custom mapping for multi-entity rooftops.",
      },
    ],
  },
  {
    id: "industry",
    eyebrow: "Industry software",
    title: "The CRMs you've been bolted to. Imported clean.",
    intro:
      "Aspire, LMN, Jobber, Service Autopilot, Real Green, Arborgold, HindSite. Whatever you ran for the last decade, your customers, properties, contracts, and route history come over — usually in 48 hours, never with a 'data corruption fee.'",
    icon: Database,
    tone: "honey",
    bg: "mid",
    items: [
      {
        name: "Aspire Software",
        status: "Native",
        blurb:
          "Pull contacts, properties, contracts, work orders. CSV one-time import for switchers plus ongoing API sync for hybrid setups.",
      },
      {
        name: "LMN",
        status: "API",
        blurb:
          "Estimate import, customer migration, route history.",
      },
      {
        name: "Service Autopilot",
        status: "CSV",
        blurb:
          "Customer plus service history import. Two-way API integration shipping in Q2.",
      },
      {
        name: "Jobber",
        status: "API",
        blurb:
          "Direct API sync for customers, jobs, invoices. Two-way for hybrid use during a phased cutover.",
      },
      {
        name: "Real Green",
        status: "CSV",
        blurb:
          "Customer plus service history import. Application records preserved.",
      },
      {
        name: "Arborgold",
        status: "CSV",
        blurb:
          "Customer migration. Tree-care job history preserved with original arborist notes.",
      },
      {
        name: "HindSite",
        status: "CSV",
        blurb:
          "Customer plus route data import. Recurring service schedules carried over.",
      },
      {
        name: "CompanyCam",
        status: "API",
        blurb:
          "Pull job photos into Site Memory. Tag automatically by property and crew visit.",
      },
    ],
  },
  {
    id: "field-fleet",
    eyebrow: "Field & fleet",
    title: "Where your trucks are, and what they're doing.",
    intro:
      "GPS, dispatch, telematics. We pipe crew location into the Field Crew App so dispatch decisions are based on where the truck actually is, not where someone said it would be at 7am.",
    icon: Truck,
    tone: "moss",
    bg: "deep",
    items: [
      {
        name: "ServiceTitan",
        status: "API",
        blurb:
          "Dispatch sync, customer record sync. For shops running both systems during a transition.",
      },
      {
        name: "Samsara",
        status: "API",
        blurb:
          "GPS fleet tracking. Crew location feeds Field Crew App and powers route compliance.",
      },
      {
        name: "GPS Insight",
        status: "API",
        blurb:
          "Same crew-location pipeline as Samsara, alternative provider.",
      },
      {
        name: "Verizon Connect",
        status: "API",
        blurb:
          "Fleet tracking integration. Geofence events trigger arrival SMS to customers.",
      },
      {
        name: "Garmin Fleet",
        status: "API",
        blurb:
          "Available on Enterprise tier on request, with custom event mapping.",
      },
    ],
  },
  {
    id: "communications",
    eyebrow: "Communications",
    title: "Voice, SMS, email — and the ledger of every word.",
    intro:
      "Every inbound call recorded, transcribed, scored. Every outbound SMS routed through dynamic numbers so you can attribute lead source down to the postcard. The communications stack is where Quote Intercept, Cadence, and Ghost Recovery live.",
    icon: Phone,
    tone: "honey",
    bg: "mid",
    items: [
      {
        name: "Twilio",
        status: "Native",
        blurb:
          "Voice plus SMS, call recording, DNI tracking, AI scoring. Powers QuickHook, Cadence, and Ghost Recovery.",
      },
      {
        name: "Resend",
        status: "Native",
        blurb:
          "Transactional email. Powers invoice delivery and Cadence email steps with deliverability monitoring.",
      },
      {
        name: "Mailgun",
        status: "API",
        blurb:
          "Alternative email provider for shops with existing Mailgun accounts and warm sender domains.",
      },
      {
        name: "Apple Business Chat",
        status: "Coming",
        blurb:
          "On the roadmap for Q4. Inbound iMessage routing for premium-tier customers.",
      },
    ],
  },
  {
    id: "payments",
    eyebrow: "Payments",
    title: "Card, ACH, marketplace payouts — one rail.",
    intro:
      "Stripe Connect runs your customer charges, your subscription billing, and your Surplus Yard marketplace payouts on a single rail. One reconciliation, one tax engine, one dashboard.",
    icon: DollarSign,
    tone: "moss",
    bg: "deep",
    items: [
      {
        name: "Stripe Connect",
        status: "Native",
        blurb:
          "Card plus ACH. Subscription billing. Marketplace payouts to crews on the Surplus Yard.",
      },
      {
        name: "Stripe Tax",
        status: "Native",
        blurb:
          "Auto sales-tax calculation by jurisdiction. Handles state-by-state exemptions for landscaping services.",
      },
      {
        name: "Plaid",
        status: "API",
        blurb:
          "Bank linking for ACH verification. Reduces returned-payment friction on annual prepay customers.",
      },
    ],
  },
  {
    id: "ai",
    eyebrow: "AI & intelligence",
    title: "The reasoning layer behind every engine.",
    intro:
      "Claude does the deep reasoning — call scoring, upsell detection, complaint triage. Embeddings power WinMemory's semantic store so a foreman's note from 2023 surfaces when a similar property gets quoted in 2026. NOAA and Google Maps round out the spatial intelligence.",
    icon: Brain,
    tone: "honey",
    bg: "mid",
    items: [
      {
        name: "Anthropic Claude",
        status: "Native",
        blurb:
          "Claude Sonnet 4.6 for deep reasoning, Claude Haiku 4.5 for fast batch scoring across thousands of records.",
      },
      {
        name: "OpenAI Embeddings",
        status: "Native",
        blurb:
          "text-embedding-3 powers the WinMemory semantic store across notes, photos, and call transcripts.",
      },
      {
        name: "NOAA Weather API",
        status: "Native",
        blurb:
          "Weather Pivot uses NOAA forecasts for service rescheduling and frost-line aware fertilization timing.",
      },
      {
        name: "Google Maps + Places",
        status: "Native",
        blurb:
          "Property addresses, geocoding, route optimization. Backs Referral Radar's neighbor-property matching.",
      },
    ],
  },
  {
    id: "marketing",
    eyebrow: "Marketing & growth",
    title: "Where leads come from, and what they cost.",
    intro:
      "Lead source attribution and cost tracking, with a privacy-first analytics stack. We don't drop a third-party cookie on your customers — and we don't need to.",
    icon: Mail,
    tone: "moss",
    bg: "deep",
    items: [
      {
        name: "Google Local Services",
        status: "Native",
        blurb:
          "Lead source attribution plus cost tracking. Real cost-per-booked-job, not cost-per-click.",
      },
      {
        name: "Plausible Analytics",
        status: "Native",
        blurb:
          "Privacy-first product analytics. No cookies, GDPR + CCPA clean by default.",
      },
      {
        name: "PostHog",
        status: "Native",
        blurb:
          "Product analytics plus feature flags. Powers staged rollouts of new engines per crew.",
      },
    ],
  },
];

const STATUS_STYLES: Record<IntegrationStatus, string> = {
  Native:
    "border-moss/40 bg-moss/10 text-moss-bright",
  API: "border-honey/40 bg-honey/10 text-honey-bright",
  CSV: "border-bone/15 bg-bone/[0.04] text-bone/60",
  Coming: "border-bone/10 bg-bone/[0.02] text-stone",
};

function StatusPill({ status }: { status: IntegrationStatus }) {
  const cls = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${cls}`}
    >
      {status}
    </span>
  );
}

function IntegrationTile({
  item,
  Icon,
  tone,
}: {
  item: Integration;
  Icon: typeof DollarSign;
  tone: "moss" | "honey";
}) {
  const accent = tone === "honey" ? "text-honey-bright" : "text-moss-bright";
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-bone/10 bg-forest-deep ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <StatusPill status={item.status} />
      </div>
      <h3 className="font-serif text-xl text-bone tracking-[-0.01em]">
        {item.name}
      </h3>
      <p className="text-sm leading-[1.6] text-bone/60">{item.blurb}</p>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <>
      <Nav />
      <main className="bg-forest-deep text-bone">
        {/* Hero */}
        <section className="py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="mx-auto max-w-4xl text-center">
                <Pill tone="moss" className="mb-5">
                  <Plug className="h-3 w-3" />
                  Integrations
                </Pill>
                <h1 className="font-serif text-5xl tracking-[-0.02em] text-bone md:text-7xl">
                  Plays with the stack you already pay for.
                </h1>
                <p className="mt-8 text-lg leading-[1.65] text-bone/60 md:text-xl">
                  You don&apos;t have to rip out your accounting, fleet
                  tracking, or call recording the day you sign with
                  GladiusTurf. We import. We sync. We webhook. The team that
                  spent six years learning your existing tools doesn&apos;t
                  have to relearn anything on Monday morning.
                </p>
                <p className="mt-5 text-base leading-[1.65] text-bone/60 md:text-lg">
                  The 33 engines layer on top of what you have — Quote
                  Intercept reading from your existing CRM, Cadence dialing
                  through your existing Twilio account, Site Memory pulling
                  from CompanyCam photos. Over time, the engines replace what
                  isn&apos;t pulling its weight. Your call. Your timeline.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mx-auto mt-14 flex max-w-3xl flex-col items-center justify-center gap-3 rounded-2xl border border-bone/10 bg-bone/[0.02] px-6 py-5 font-mono text-sm text-bone/70 sm:flex-row sm:gap-8">
                <span>
                  <span className="text-moss-bright">32</span> integrations
                </span>
                <span aria-hidden className="hidden h-4 w-px bg-bone/10 sm:block" />
                <span>
                  <span className="text-moss-bright">4</span> native
                </span>
                <span aria-hidden className="hidden h-4 w-px bg-bone/10 sm:block" />
                <span>
                  <span className="text-honey-bright">28</span> via API / CSV
                </span>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Categories */}
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const bgCls =
            cat.bg === "mid"
              ? "border-t border-bone/5 bg-forest-mid"
              : "border-t border-bone/5 bg-forest-deep";
          return (
            <section key={cat.id} className={`${bgCls} py-28`}>
              <div className="mx-auto max-w-7xl px-6">
                <ScrollReveal>
                  <div className="mx-auto max-w-3xl text-center">
                    <Eyebrow tone={cat.tone} className="mb-3">
                      {cat.eyebrow}
                    </Eyebrow>
                    <h2 className="font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                      {cat.title}
                    </h2>
                    <p className="mt-6 text-base leading-[1.65] text-bone/60 md:text-lg">
                      {cat.intro}
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                  <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {cat.items.map((item) => (
                      <IntegrationTile
                        key={item.name}
                        item={item}
                        Icon={Icon}
                        tone={cat.tone}
                      />
                    ))}
                  </div>
                </ScrollReveal>
              </div>
            </section>
          );
        })}

        {/* API band */}
        <section className="border-t border-bone/5 bg-forest-mid py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
              <ScrollReveal className="md:col-span-5">
                <Eyebrow tone="honey" className="mb-3">
                  API
                </Eyebrow>
                <h2 className="font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                  Don&apos;t see your stack? Build with our API.
                </h2>
                <p className="mt-6 text-base leading-[1.65] text-bone/60">
                  Everything in GladiusTurf is exposed through a typed REST
                  plus tRPC API. The same router our internal apps call is
                  the one you call. No second-class undocumented surface.
                </p>
                <p className="mt-4 text-base leading-[1.65] text-bone/60">
                  Full webhook support — job created, customer updated,
                  invoice paid, quote viewed, crew checked in. Subscribe to
                  the events you care about, ignore the rest. We sign every
                  payload so you can verify it was us.
                </p>
                <p className="mt-4 text-base leading-[1.65] text-bone/60">
                  Authenticated with API keys plus per-key scopes. Rate-limited
                  at <span className="font-mono text-honey-bright">100/min</span>{" "}
                  on Pro and{" "}
                  <span className="font-mono text-honey-bright">1000/min</span>{" "}
                  on Enterprise. Sandbox keys are free and unlimited.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <CtaButton href="/demo">Talk to an engineer</CtaButton>
                  <a
                    href="mailto:founders@gladiusturf.com"
                    className="inline-flex items-center gap-1.5 text-sm text-bone/60 transition-colors hover:text-bone"
                  >
                    Or request docs access
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </ScrollReveal>

              <ScrollReveal className="md:col-span-7" delay={0.1}>
                <div className="overflow-hidden rounded-2xl border border-bone/10 bg-forest-deep shadow-pop">
                  <div className="flex items-center justify-between border-b border-bone/10 px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-honey-bright/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-moss-bright/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-lime-bright/80" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">
                      typescript · sdk
                    </span>
                  </div>
                  <pre className="overflow-x-auto px-6 py-6 font-mono text-[13px] leading-[1.7] text-bone/80">
                    <code>
                      <span className="text-stone">{`// install: npm i @gladiusturf/sdk`}</span>
                      {"\n"}
                      <span className="text-honey-bright">import</span>
                      <span> {"{"} </span>
                      <span className="text-moss-bright">GladiusTurf</span>
                      <span> {"}"} </span>
                      <span className="text-honey-bright">from</span>
                      <span className="text-bone"> {`"@gladiusturf/sdk"`}</span>
                      <span>;</span>
                      {"\n\n"}
                      <span className="text-honey-bright">const</span>
                      <span> gt = </span>
                      <span className="text-honey-bright">new</span>
                      <span> </span>
                      <span className="text-moss-bright">GladiusTurf</span>
                      <span>{`({`}</span>
                      {"\n  "}
                      <span>apiKey: process.env.</span>
                      <span className="text-bone">GT_API_KEY</span>
                      <span>,</span>
                      {"\n  "}
                      <span>scopes: [</span>
                      <span className="text-bone">{`"customers:write"`}</span>
                      <span>, </span>
                      <span className="text-bone">{`"jobs:read"`}</span>
                      <span>{"]"}</span>
                      ,
                      {"\n"}
                      <span>{`});`}</span>
                      {"\n\n"}
                      <span className="text-honey-bright">const</span>
                      <span> customer = </span>
                      <span className="text-honey-bright">await</span>
                      <span> gt.customers.</span>
                      <span className="text-lime-bright">create</span>
                      <span>{`({`}</span>
                      {"\n  "}
                      <span>name: </span>
                      <span className="text-bone">{`"Birchwood HOA"`}</span>
                      <span>,</span>
                      {"\n  "}
                      <span>email: </span>
                      <span className="text-bone">{`"ops@birchwood.org"`}</span>
                      <span>,</span>
                      {"\n  "}
                      <span>properties: [</span>
                      {"{"}
                      {"\n    "}
                      <span>address: </span>
                      <span className="text-bone">{`"42 Cedar Ln"`}</span>
                      <span>,</span>
                      {"\n    "}
                      <span>acreage: </span>
                      <span className="text-moss-bright">3.2</span>
                      <span>,</span>
                      {"\n    "}
                      <span>siteMemory: </span>
                      <span className="text-bone">{`"gate code 4421, dog Maggie"`}</span>
                      <span>,</span>
                      {"\n  "}
                      <span>{`}],`}</span>
                      {"\n"}
                      <span>{`});`}</span>
                      {"\n\n"}
                      <span className="text-stone">{`// fully typed: customer.id, customer.properties[0].id, ...`}</span>
                      {"\n"}
                      <span className="text-stone">{`// webhooks emit: customer.created, property.created`}</span>
                    </code>
                  </pre>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Migration help band */}
        <section className="border-t border-bone/5 bg-forest-deep py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow tone="moss" className="mb-3">
                  Onboarding
                </Eyebrow>
                <h2 className="font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                  We&apos;ll move your data for you.
                </h2>
                <p className="mt-6 text-base leading-[1.65] text-bone/60 md:text-lg">
                  No CSV homework on Sunday night. No &lsquo;export from
                  Aspire, reformat in Excel, hope it loads&rsquo; rituals. Our migration
                  team owns the cutover, end to end, on a one-week schedule.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-moss-bright">
                      Day 1
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl text-bone">
                    Discovery call
                  </h3>
                  <p className="mt-3 text-sm leading-[1.65] text-bone/60">
                    Review your current stack, identify migration scope,
                    flag the messy bits before they bite. 45 minutes,
                    screen-shared, founder-led.
                  </p>
                </div>
                <div className="rounded-2xl border border-honey/40 bg-gradient-to-b from-honey/10 to-transparent p-6 shadow-pop-honey">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-honey-bright">
                      Day 3
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl text-bone">
                    Sample import
                  </h3>
                  <p className="mt-3 text-sm leading-[1.65] text-bone/60">
                    First 50 customers plus 200 jobs imported. You verify
                    the data side-by-side with your old system. We fix
                    edge cases before the full cutover.
                  </p>
                </div>
                <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-moss-bright">
                      Day 7
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl text-bone">
                    Full cutover
                  </h3>
                  <p className="mt-3 text-sm leading-[1.65] text-bone/60">
                    All data live. Training session for office staff plus
                    a Loom library for foremen. Crews open the new app on
                    Monday morning without losing a mow.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-[1.65] text-bone/60">
                <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-honey-bright" />
                Free for every plan. White-glove for Enterprise — named
                project manager, custom integrations, multi-location
                rollout.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden border-t border-bone/5 bg-forest-mid py-32">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <ScrollReveal>
              <Pill tone="honey" className="mb-5">
                Bring it
              </Pill>
              <h2 className="font-serif text-5xl tracking-[-0.02em] text-bone md:text-7xl">
                Your stack is welcome. Bring it.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-bone/60 md:text-xl">
                We&apos;ll show you exactly how QuickBooks, Aspire, Twilio,
                Samsara, and Stripe slot in — on a screen-shared 30-minute
                demo with the founders, not an SDR.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <CtaButton href="/demo" size="lg">
                  Book the founder demo
                </CtaButton>
                <a
                  href="mailto:founders@gladiusturf.com"
                  className="text-base text-bone/60 transition-colors hover:text-bone"
                >
                  Or email founders@gladiusturf.com →
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
