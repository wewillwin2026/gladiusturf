import Link from "next/link";
import {
  ArrowRight,
  CloudLightning,
  Inbox,
  Repeat,
  Star,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { AutomationsBrowser } from "@/components/app/AutomationsBrowser";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

// `verticals: undefined` means "all verticals." Use specific slugs from
// the tenants.vertical enum to gate. The audit (2026-05-13) flagged that
// a lawn-care tenant was seeing Storm Mode + Backflow Radar — both
// inappropriate. Now the sidebar shows only what a vertical actually
// runs.
const TENANT_AUTOMATIONS: {
  slug: string;
  href: string | null;
  icon: typeof Repeat;
  name: string;
  status: "live" | "soon";
  body: string;
  verticals?: string[];
}[] = [
  {
    slug: "storm",
    href: "/app/automations/storm",
    icon: CloudLightning,
    name: "Storm Mode",
    status: "live",
    body: "When a named storm hits your service area, queue a bilingual check-in to every customer in the affected ZIPs. Top-tier plan members jump the queue.",
    // Florida-storm-specific. Snow operators use snow-call lists, not
    // hurricane radar. Lawn-care + tree-care care less than lighting
    // because their assets aren't electrified.
    verticals: ["lighting", "irrigation", "pool", "landscape", "commercial"],
  },
  {
    slug: "backflow-radar",
    href: "/app/automations/backflow-radar",
    icon: Repeat,
    name: "Backflow Compliance Radar",
    status: "live",
    body: "Irrigation tenants only. Florida backflow assemblies need annual filings — late = shut-off + fines. Radar surfaces overdue + due-soon, routed to the right utility portal (BSI Online, JEA, Sarasota County, etc).",
    verticals: ["irrigation"],
  },
  {
    slug: "inbox-reply",
    href: null,
    icon: Inbox,
    name: "Inbox auto-reply",
    status: "soon",
    body: "Smart triage on inbound email + SMS — drafts a reply, routes urgent threads, holds the rest until a human approves. Ships behind the consent gate.",
  },
  {
    slug: "review-ask",
    href: null,
    icon: Star,
    name: "Post-job review-ask",
    status: "soon",
    body: "When a job closes with a positive note, a review-ask SMS fires within 6 hours — opted-in customers only. Drives Google + Facebook stars.",
  },
];

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    const tenantVertical = session.tenant.vertical;
    const filtered = TENANT_AUTOMATIONS.filter(
      (a) => !a.verticals || a.verticals.includes(tenantVertical),
    );
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow={`${session.tenant.display_name} · Automations`}
          title="Automations"
          subtitle="Workflows that run unattended. Each one fires only after explicit consent at the customer × channel level."
        />

        <div className="grid gap-3 md:grid-cols-3">
          {filtered.map((a) => {
            const Icon = a.icon;
            const Card = (
              <div className="g-card flex h-full flex-col gap-3 p-5 transition-colors hover:bg-g-surface-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-g-surface-2 text-g-text">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span
                    className={
                      a.status === "live"
                        ? "text-[10px] uppercase tracking-[0.12em] text-g-accent"
                        : "text-[10px] uppercase tracking-[0.12em] text-g-text-faint"
                    }
                  >
                    {a.status === "live" ? "Live" : "Coming soon"}
                  </span>
                </div>
                <div>
                  <div className="text-[15px] font-medium text-g-text">
                    {a.name}
                  </div>
                  <p className="mt-1 text-[13px] text-g-text-muted">{a.body}</p>
                </div>
                {a.href && (
                  <div className="mt-auto inline-flex items-center gap-1 text-[12px] font-medium text-g-accent">
                    Open
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            );
            return a.href ? (
              <Link key={a.slug} href={a.href} prefetch className="group">
                {Card}
              </Link>
            ) : (
              <div key={a.slug} className="opacity-70">{Card}</div>
            );
          })}
        </div>
      </div>
    );
  }
  return <AutomationsBrowser product="demo" />;
}
