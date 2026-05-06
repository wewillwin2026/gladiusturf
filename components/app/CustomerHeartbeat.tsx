import {
  Calendar,
  CheckCircle2,
  type LucideIcon,
  MessageSquare,
  Repeat,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Customer Heartbeat — at-a-glance trust score for a single customer.
 * Per Product Director's #4 board recommendation: render the
 * relationship, not just the contact card. Each pulse is a binary
 * "this signal is good" / "we don't have evidence" — not a percentile,
 * not a 0-100 score, not a metric Felipe has to interpret. He sees four
 * dots and knows who his real fans are.
 *
 * v1: deterministic, derived from existing data (no AI scoring).
 *  - Active plan?  → has plan_subscriptions row with status='active'
 *  - Recent visit? → ≥1 schedule_items row in last 90 days
 *  - Quote engaged? → ≥1 proposal where status≥sent
 *  - On book ≥6mo? → acquired_at older than 180 days
 *
 * v2 will fold in payment latency (when invoices ship) and review
 * presence (when reviews ship).
 */

export type HeartbeatSignals = {
  hasActivePlan: boolean;
  hasRecentVisit: boolean;
  hasEngagedQuote: boolean;
  isLongTermCustomer: boolean;
};

const SIGNALS: {
  key: keyof HeartbeatSignals;
  icon: LucideIcon;
  label: string;
  hit: string;
  miss: string;
}[] = [
  {
    key: "hasActivePlan",
    icon: Repeat,
    label: "Active plan",
    hit: "On a maintenance plan — recurring revenue.",
    miss: "No plan yet — upsell candidate.",
  },
  {
    key: "hasRecentVisit",
    icon: Calendar,
    label: "Recent visit",
    hit: "Visited in the last 90 days.",
    miss: "No visit logged in 90+ days.",
  },
  {
    key: "hasEngagedQuote",
    icon: MessageSquare,
    label: "Quote engaged",
    hit: "At least one quote sent — pipeline relationship live.",
    miss: "No quotes sent yet.",
  },
  {
    key: "isLongTermCustomer",
    icon: TrendingUp,
    label: "6+ months on book",
    hit: "On the book for 6+ months — referral & review candidate.",
    miss: "New customer — first-impression window.",
  },
];

export function CustomerHeartbeat({ signals }: { signals: HeartbeatSignals }) {
  const score = SIGNALS.reduce(
    (s, sig) => s + (signals[sig.key] ? 1 : 0),
    0,
  );
  const tone =
    score >= 3 ? "strong" : score === 2 ? "warm" : score === 1 ? "cool" : "cold";
  const heading =
    score >= 3
      ? "Strong relationship"
      : score === 2
        ? "Warm relationship"
        : score === 1
          ? "Cool relationship"
          : "New or dormant";

  return (
    <div className="g-card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="inline-flex items-center gap-2">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              tone === "strong" && "bg-g-accent animate-pulse",
              tone === "warm" && "bg-g-accent/60",
              tone === "cool" && "bg-g-warning/70",
              tone === "cold" && "bg-g-text-faint",
            )}
          />
          Heartbeat
        </h3>
        <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
          {heading}
        </span>
      </div>

      <p className="mt-1 text-[12px] text-g-text-muted">
        Four signals — not a score. A pulse is on when we have evidence;
        off when we don&apos;t. Use this to pick who to call this week.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {SIGNALS.map((sig) => {
          const Icon = sig.icon;
          const on = signals[sig.key];
          return (
            <li key={sig.key} className="flex items-start gap-3">
              <span
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                  on
                    ? "bg-g-accent-faint text-g-accent border-g-accent/40"
                    : "bg-g-surface-2 text-g-text-faint border-g-border-subtle",
                )}
              >
                {on ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-[13px] font-medium",
                    on ? "text-g-text" : "text-g-text-muted",
                  )}
                >
                  {sig.label}
                </div>
                <p className="text-[12px] text-g-text-faint mt-0.5">
                  {on ? sig.hit : sig.miss}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
