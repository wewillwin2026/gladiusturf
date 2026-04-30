import * as React from "react";
import { GitCommit, Sparkles } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { Avatar } from "./ui/Avatar";
import { StatusPill } from "./ui/StatusPill";
import { type ProductKind } from "./engines";

type Entry = {
  date: string;
  who: "Ricardo Gamon" | "Joshua Pyorke";
  initials: string;
  title: string;
  body: string;
  tags: string[];
};

const ENTRIES: Entry[] = [
  {
    date: "2026-04-30",
    who: "Ricardo Gamon",
    initials: "RG",
    title: "Phase 4 ships — Ask Gladius LLM, Reports, Jobs detail, Invoices detail.",
    body: "Floating bot icon on every authed page. Real Anthropic streaming over seeded ops snapshot. 5 Recharts tabs. Photo grid + signature canvas on jobs. Payment timeline on invoices.",
    tags: ["LLM", "Reports", "Jobs"],
  },
  {
    date: "2026-04-30",
    who: "Ricardo Gamon",
    initials: "RG",
    title: "Phase 3 ships — AI Quote Drafter, Customers virtualized + map, kanban + DnD.",
    body: "Address autocomplete → satellite measure → Sonnet 4.6 streamed scope → preview rail → send. Mapbox Static Tiles on customer map. Quote kanban board with drag-and-drop. Schedule week view with auto-optimize.",
    tags: ["AI", "Mapbox", "DnD"],
  },
  {
    date: "2026-04-29",
    who: "Ricardo Gamon",
    initials: "RG",
    title: "Hybrid SaaS shipped — /app demo CRM + War Room behind real auth.",
    body: "One codebase, two products, shared component library. Phase 1 + 2 of the master build prompt. 33 sidebar engines, deterministic seed for Cypress Lawn.",
    tags: ["Auth", "Foundation"],
  },
  {
    date: "2026-04-22",
    who: "Ricardo Gamon",
    initials: "RG",
    title: "Slot collision prevention with DST correctness.",
    body: "ServiceTitan still doesn't have this. Fixed in a weekend. Spring-forward Sunday no longer double-books crews.",
    tags: ["Schedule", "Bug"],
  },
  {
    date: "2026-04-18",
    who: "Joshua Pyorke",
    initials: "JY",
    title: "Per-founder 2FA via TOTP.",
    body: "Replaces the shared admin cookie. Magic link + 6-digit code. Phone-stolen story stops here.",
    tags: ["Security", "Founders"],
  },
  {
    date: "2026-04-12",
    who: "Ricardo Gamon",
    initials: "RG",
    title: "Save Play · founder-call automation.",
    body: "Auto-flag at-risk customers based on reply latency + invoice slippage. 67% conversion to retained — best save metric we've measured.",
    tags: ["Save Play", "Retention"],
  },
  {
    date: "2026-03-30",
    who: "Ricardo Gamon",
    initials: "RG",
    title: "Ask Gladius rolled out internally.",
    body: "Natural-language queries over real Supabase data. Founders only for now. Pilot shops in May.",
    tags: ["LLM", "Beta"],
  },
  {
    date: "2026-03-12",
    who: "Joshua Pyorke",
    initials: "JY",
    title: "AI Quote Drafter — bundled, not bolted-on.",
    body: "Service Autopilot bolts on Deep Lawn for $499/mo extra. We bundled it. Customers stop paying twice.",
    tags: ["Pricing", "AI"],
  },
  {
    date: "2026-02-22",
    who: "Ricardo Gamon",
    initials: "RG",
    title: "Outbound voice via Twilio with AI transcription.",
    body: "Quote Intercept sub-60s callback wired end to end. Median voicemail-to-callback now 41 seconds.",
    tags: ["BDC", "Voice"],
  },
  {
    date: "2026-02-08",
    who: "Joshua Pyorke",
    initials: "JY",
    title: "Settings → Billing now shows what you replaced.",
    body: "Crossed-out logos for RealGreen, Hatch, SiteRecon, OptimoRoute. Total saved $1,799/mo. Customers love it.",
    tags: ["Pricing", "GTM"],
  },
  {
    date: "2026-01-22",
    who: "Ricardo Gamon",
    initials: "RG",
    title: "GladiusBDC live — 60-second AI callback.",
    body: "Plugs into any tier. $499/mo add-on. First two weeks: 84 callbacks placed, 31% converted to booked estimates.",
    tags: ["BDC", "Launch"],
  },
  {
    date: "2026-01-04",
    who: "Joshua Pyorke",
    initials: "JY",
    title: "Cmd-K spine across the app.",
    body: "Every action reachable in one keystroke. <120ms open. No competitor has this — they ship modal browsers from 2014.",
    tags: ["UX", "Speed"],
  },
];

const TAG_TONE: Record<string, "info" | "accent" | "warning" | "success" | "neutral" | "danger"> = {
  AI: "accent",
  LLM: "accent",
  Mapbox: "info",
  DnD: "info",
  Schedule: "info",
  Reports: "info",
  Jobs: "info",
  Auth: "warning",
  Security: "warning",
  Foundation: "neutral",
  Bug: "danger",
  "Save Play": "success",
  Retention: "success",
  Beta: "neutral",
  Pricing: "warning",
  GTM: "warning",
  Founders: "warning",
  BDC: "accent",
  Voice: "info",
  Launch: "success",
  UX: "info",
  Speed: "accent",
};

export function ChangelogBrowser({ product }: { product: ProductKind }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Changelog"
        subtitle="Public-style ship log. Dated, signed by Ricardo or Joshua."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Ships · 90 days" value={String(ENTRIES.length)} />
        <KPICard label="Median PRs / week" value="8.2" delta="+1.4" trend="up" />
        <KPICard label="Engines live" value="33 / 33" trend="up" />
        <KPICard label="Days since last ship" value="0" trend="flat" />
      </section>

      <section className="g-card overflow-hidden">
        <header className="px-5 py-3 border-b border-g-border-subtle flex items-center justify-between">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Ship log
          </h2>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-g-accent">
            <Sparkles className="h-3 w-3" /> Live
          </span>
        </header>
        <div className="px-5 py-4">
          <ol className="relative">
            <span className="absolute left-[15px] top-1 bottom-1 w-px bg-g-border-subtle" />
            {ENTRIES.map((e, i) => (
              <li key={i} className="relative pl-12 pb-6 last:pb-0">
                <span className="absolute left-2 top-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-g-accent/40 bg-g-accent-faint">
                  <GitCommit className="h-2.5 w-2.5 text-g-accent" />
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-g-text-faint">
                    {e.date}
                  </span>
                  <Avatar name={e.who} size="sm" tone="muted" />
                  <span className="text-[11px] text-g-text-muted">— {e.initials}</span>
                </div>
                <h3 className="mt-1.5 text-g-text font-medium">{e.title}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-g-text-muted">
                  {e.body}
                </p>
                {e.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {e.tags.map((t) => (
                      <StatusPill key={t} tone={TAG_TONE[t] || "neutral"}>
                        {t}
                      </StatusPill>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
