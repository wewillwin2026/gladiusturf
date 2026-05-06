import Link from "next/link";
import { ArrowRight, Coffee } from "lucide-react";
import { money } from "@/lib/shared/format";

/**
 * Owner's Daily One-Liner — Strategy + Product board mandate
 * (2026-05-08, ranked top-3 by both directors). The product's front
 * door at 6:47am: not a dashboard, a sentence.
 *
 * Computes a single readable sentence + one decisive next move from
 * data already in scope on /app home — customers, drafts in flight,
 * stale inventory, recent visits.
 *
 * v1: deterministic synthesis. v2 ships per-tenant SMS at 7am ET via
 * Twilio behind the canSend() gate (TCPA layer is already shipped) +
 * the inventory-aging cron's pattern.
 */

export type DailyBriefingInput = {
  tenantName: string;
  customerCount: number;
  draftQuotesCount: number;
  inFlightQuotesCount: number;
  recentVisitsCount: number;
  staleInventoryCount: number;
  staleInventoryDollarsCents: number;
  inStormZipCount: number;
  oldestStaleAgeDays: number | null;
};

function pickHeadline(now: Date, name: string): string {
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const hour = now.getHours();
  const slot =
    hour < 11 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return `Good ${day} ${slot}, ${name}.`;
}

function pickNextMove(b: DailyBriefingInput): {
  text: string;
  href: string;
  cta: string;
} {
  if (b.inStormZipCount > 0) {
    return {
      text: `${b.inStormZipCount} customer${b.inStormZipCount === 1 ? "" : "s"} in storm-watch ZIPs — review Storm Mode first.`,
      href: "/app/automations/storm",
      cta: "Open Storm Mode",
    };
  }
  if (b.staleInventoryCount > 0) {
    const dollars = money(b.staleInventoryDollarsCents);
    return {
      text: `${b.staleInventoryCount} fixture${b.staleInventoryCount === 1 ? "" : "s"} aging${b.oldestStaleAgeDays ? ` ${b.oldestStaleAgeDays}d+` : ""} on the shelf · ${dollars} tied up. Sell these first.`,
      href: "/app/inventory?sort=oldest",
      cta: "Open inventory",
    };
  }
  if (b.draftQuotesCount > 0) {
    return {
      text: `${b.draftQuotesCount} quote draft${b.draftQuotesCount === 1 ? "" : "s"} waiting for a final number — push them out.`,
      href: "/app/quotes",
      cta: "Review drafts",
    };
  }
  if (b.customerCount === 0) {
    return {
      text: "No customers in your book yet — drop a CSV and we'll bring them in.",
      href: "/app/import/customers",
      cta: "Import customers",
    };
  }
  if (b.recentVisitsCount === 0) {
    return {
      text: "No visits logged this month — log today's job from the customer's profile to start the timeline.",
      href: "/app/customers",
      cta: "Open customers",
    };
  }
  return {
    text: "Quiet day — good time to draft a quote you've been putting off, or run Storm Mode against your watch list.",
    href: "/app/quotes/draft",
    cta: "Draft a quote",
  };
}

export function OwnersDailyOneLiner({ briefing }: { briefing: DailyBriefingInput }) {
  const now = new Date();
  const headline = pickHeadline(now, briefing.tenantName);
  const move = pickNextMove(briefing);

  // Build the body line — short, scannable, no markdown.
  const body = [
    `${briefing.customerCount} customer${briefing.customerCount === 1 ? "" : "s"} on file`,
    briefing.inFlightQuotesCount > 0
      ? `${briefing.inFlightQuotesCount} quote${briefing.inFlightQuotesCount === 1 ? "" : "s"} in flight`
      : null,
    briefing.draftQuotesCount > 0
      ? `${briefing.draftQuotesCount} draft${briefing.draftQuotesCount === 1 ? "" : "s"}`
      : null,
    briefing.recentVisitsCount > 0
      ? `${briefing.recentVisitsCount} visit${briefing.recentVisitsCount === 1 ? "" : "s"} logged this month`
      : null,
    briefing.staleInventoryCount > 0
      ? `${briefing.staleInventoryCount} stale unit${briefing.staleInventoryCount === 1 ? "" : "s"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={move.href}
      prefetch
      className="g-card group relative block overflow-hidden p-5 transition-colors hover:bg-g-surface-2"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(0,210,106,0.10) 0%, rgba(0,210,106,0.03) 50%, transparent 80%)",
        }}
      />
      <div className="relative flex items-start gap-4">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-g-accent-faint text-g-accent border border-g-accent/40">
          <Coffee className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.14em] text-g-accent font-semibold">
            Today&apos;s briefing
          </div>
          <div className="mt-1 text-[16px] font-medium text-g-text">
            {headline}
          </div>
          {body && (
            <div className="mt-1 text-[12px] text-g-text-muted truncate">
              {body}
            </div>
          )}
          <p className="mt-3 text-[14px] text-g-text leading-snug">
            <span className="font-medium">Your one move: </span>
            {move.text}
          </p>
        </div>
        <div className="hidden sm:inline-flex flex-col items-end gap-1 shrink-0">
          <span className="text-[11px] text-g-text-muted group-hover:text-g-text">
            {move.cta}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-g-text-muted group-hover:text-g-text transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
