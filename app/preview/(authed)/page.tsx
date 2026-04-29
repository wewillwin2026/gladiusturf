import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Cloud,
  DollarSign,
  Inbox,
  MessageSquare,
  Phone,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { ENGINE_TIERS } from "@/content/engine-tiers";
import { ENGINES } from "@/content/engines";

export const metadata = {
  title: "Dashboard · GladiusTurf",
  robots: { index: false, follow: false },
};

const KPIS = [
  {
    label: "Revenue · this month",
    value: "$148,420",
    delta: "+18.2%",
    icon: DollarSign,
    accent: "champagne",
  },
  {
    label: "Open quotes",
    value: "37",
    delta: "+9 this week",
    icon: Inbox,
    accent: "moss",
  },
  {
    label: "Jobs today",
    value: "23",
    delta: "4 crews dispatched",
    icon: Truck,
    accent: "honey",
  },
  {
    label: "Active customers",
    value: "412",
    delta: "+24 vs last quarter",
    icon: Users,
    accent: "champagne",
  },
] as const;

const ACTIVITY = [
  {
    icon: Phone,
    accent: "moss",
    title: "Quote Intercept · Maple Hollow Estates",
    detail:
      "Voicemail from a 0.6-acre commercial reroute closed by AI in 4m. Booked a Tuesday walkthrough.",
    when: "12 min ago",
    value: "+ $4,200 pipeline",
  },
  {
    icon: MessageSquare,
    accent: "champagne",
    title: "InstantText · Dana K.",
    detail:
      "Inbound web form replied to in 47s with crew availability. Booked aeration + overseed for Thursday.",
    when: "31 min ago",
    value: "+ $890",
  },
  {
    icon: Star,
    accent: "honey",
    title: "Upsell Whisperer · 14 properties scanned",
    detail:
      "Drainage issue flagged at 2231 Lakeshore. Mulch refresh suggested for 9 yards on the west route.",
    when: "1 hr ago",
    value: "+ $7,140 pipeline",
  },
  {
    icon: Cloud,
    accent: "moss",
    title: "Weather Pivot · Friday route reshuffled",
    detail:
      "NOAA flagged 70% rain probability. 18 visits rescheduled, all 18 customers texted the new window.",
    when: "2 hr ago",
    value: "0 complaint calls",
  },
  {
    icon: ArrowUpRight,
    accent: "champagne",
    title: "Save Play fired · Beaumont House",
    detail:
      "Customer flagged at-risk (slower replies + 2 invoice delays). Crew chief outreach scheduled.",
    when: "3 hr ago",
    value: "$8,400 LTV at risk",
  },
] as const;

const accentText: Record<string, string> = {
  champagne: "text-champagne-bright",
  moss: "text-moss-bright",
  honey: "text-honey-bright",
};

const accentBg: Record<string, string> = {
  champagne: "bg-champagne-bright/10",
  moss: "bg-moss-bright/10",
  honey: "bg-honey-bright/10",
};

export default function PreviewDashboard() {
  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-bone/45">
          Wednesday, April 29
        </p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-0.02em] text-bone">
          Good morning, Reggie.
        </h1>
        <p className="mt-2 text-[15px] text-bone/65">
          The crews are out. Three engines fired before 8am. Here&rsquo;s what
          moved.
        </p>
      </header>

      {/* KPI tiles */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-5"
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2 ${accentBg[kpi.accent]}`}>
                  <Icon className={`h-4 w-4 ${accentText[kpi.accent]}`} />
                </div>
                <span className={`text-xs font-medium ${accentText[kpi.accent]}`}>
                  {kpi.delta}
                </span>
              </div>
              <div className="mt-4 font-serif text-3xl text-bone">
                {kpi.value}
              </div>
              <div className="mt-1 text-[12px] uppercase tracking-[0.14em] text-bone/50">
                {kpi.label}
              </div>
            </div>
          );
        })}
      </section>

      {/* Two columns: activity feed + quick actions */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl text-bone">Live activity</h2>
            <span className="text-[11px] uppercase tracking-[0.18em] text-bone/45">
              Engines firing in real time
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.02]">
            <ol className="divide-y divide-bone/10">
              {ACTIVITY.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li
                    key={idx}
                    className="flex gap-4 p-5 transition-colors hover:bg-bone/[0.02]"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accentBg[item.accent]}`}
                    >
                      <Icon className={`h-4 w-4 ${accentText[item.accent]}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-medium text-bone">
                          {item.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-bone/40">
                          {item.when}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] leading-[1.5] text-bone/65">
                        {item.detail}
                      </p>
                      <p
                        className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${accentText[item.accent]}`}
                      >
                        {item.value}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <aside>
          <h2 className="font-serif text-2xl text-bone">Today&rsquo;s focus</h2>
          <div className="mt-4 flex flex-col gap-3">
            <FocusCard
              eyebrow="Pipeline · 7 quotes pending"
              title="3 quotes go cold today"
              body="Ghost Recovery has a play queued for Tom L., Maria Q., and Hampton Pools. Approve in one click."
              cta="Open Ghost Recovery"
              href="/preview/engines/ghost-recovery"
              accent="moss"
            />
            <FocusCard
              eyebrow="Save Play · 2 customers at risk"
              title="Beaumont House + 1 more"
              body="ToneRadar saw reply latency double, payment slip 4 days. Founder call recommended."
              cta="Open Save Play"
              href="/preview/engines/retention-radar"
              accent="champagne"
            />
            <FocusCard
              eyebrow="Crew · Riverside North"
              title="Friday route at risk"
              body="60% rain probability mid-day. Weather Pivot has a reshuffled route ready to text."
              cta="Open Weather Pivot"
              href="/preview/engines/weather-pivot"
              accent="honey"
            />
          </div>
        </aside>
      </section>

      {/* Engines library — full surface area */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-bone">Engines</h2>
          <span className="text-[11px] uppercase tracking-[0.18em] text-bone/45">
            33 engines · 5 tiers · click any to explore
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-8">
          {ENGINE_TIERS.map((tier) => {
            const tierEngines = ENGINES.filter((e) => e.tier === tier.slug);
            const accent =
              tier.accent === "moss" ? "moss" : "honey";
            return (
              <div key={tier.slug}>
                <div className="flex items-baseline gap-3">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${accentText[accent]}`}
                  >
                    {tier.name}
                  </span>
                  <span className="text-xs text-bone/40">
                    {tier.tagline}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {tierEngines.map((engine) => (
                    <Link
                      key={engine.slug}
                      href={`/preview/engines/${engine.slug}`}
                      className="group flex flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-champagne/30 hover:bg-bone/[0.04]"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-[10px] text-bone/35">
                          {engine.number}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-bone/30 transition-all group-hover:translate-x-0.5 group-hover:text-champagne-bright" />
                      </div>
                      <h3 className="mt-2 font-serif text-lg text-bone">
                        {engine.name}
                      </h3>
                      <p
                        className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${accentText[accent]}`}
                      >
                        {engine.outcome}
                      </p>
                      <p className="mt-3 line-clamp-3 text-[13px] leading-[1.5] text-bone/60">
                        {engine.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function FocusCard({
  eyebrow,
  title,
  body,
  cta,
  href,
  accent,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  accent: "moss" | "champagne" | "honey";
}) {
  return (
    <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-5">
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${accentText[accent]}`}
      >
        {eyebrow}
      </p>
      <p className="mt-2 font-serif text-lg leading-tight text-bone">{title}</p>
      <p className="mt-2 text-[13px] leading-[1.5] text-bone/60">{body}</p>
      <Link
        href={href}
        className={`mt-3 inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.14em] ${accentText[accent]} hover:underline`}
      >
        {cta}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
