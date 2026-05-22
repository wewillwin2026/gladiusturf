import * as React from "react";
import { Filter } from "lucide-react";

export type ConversionFunnelProps = {
  /** Total quotes sent in the window (the wide top of the funnel). */
  sent: number;
  /** Subset of `sent` that have been viewed. */
  viewed: number;
  /** Subset of `viewed` that converted to paid/won. */
  won: number;
  /** Estimated open-pipeline dollars (e.g. sum of `sent`+`viewed` total_cents). */
  openCents: number;
  windowDays?: number;
};

/**
 * Horizontal conversion funnel — replaces the flat pipeline list with
 * a single-glance "where is the leak" viz. Built for Felipe to spot
 * the worst conversion step at a glance. Reads real proposal counts
 * from the tenant page query; no new database call.
 */
export function ConversionFunnelCard({
  sent,
  viewed,
  won,
  openCents,
  windowDays = 30,
}: ConversionFunnelProps) {
  // Convert open pipeline to a $ string.
  const dollars = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(openCents / 100);

  // Conversion percentages step-to-step.
  const viewedPct = sent > 0 ? Math.round((viewed / sent) * 100) : 0;
  const wonPct = viewed > 0 ? Math.round((won / viewed) * 100) : 0;

  // Bar widths — top is 100%, each step is its share of the prior step
  // (so the visual funnel narrows). Minimum 12% width so a single tiny
  // bar is still legible.
  const topWidth = 100;
  const viewedWidth =
    sent > 0 ? Math.max(12, Math.round((viewed / sent) * 100)) : 12;
  const wonWidth =
    viewed > 0
      ? Math.max(12, Math.round((won / viewed) * viewedWidth))
      : 12;

  const empty = sent === 0;

  return (
    <section className="g-card overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 border-b border-g-border-subtle">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-g-accent" />
          <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
            Pipeline · conversion funnel
          </span>
        </div>
        <span className="text-[11px] font-geist-mono text-g-text-faint">
          last {windowDays}d · {dollars} in motion
        </span>
      </header>
      <div className="px-5 py-5">
        {empty ? (
          <p className="py-2 text-[13px] text-g-text-muted">
            Send your first quote and the funnel lights up. Visit
            conversion + revenue-paid figures appear here once you have
            real proposals moving.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            <FunnelRow
              label="Sent"
              count={sent}
              width={topWidth}
              tone="solid"
              suffix="100%"
            />
            <FunnelRow
              label="Viewed"
              count={viewed}
              width={viewedWidth}
              tone="solid-mid"
              suffix={`${viewedPct}% of sent`}
            />
            <FunnelRow
              label="Won &amp; Paid"
              count={won}
              width={wonWidth}
              tone="success"
              suffix={`${wonPct}% of viewed`}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function FunnelRow({
  label,
  count,
  width,
  tone,
  suffix,
}: {
  label: string;
  count: number;
  width: number;
  tone: "solid" | "solid-mid" | "success";
  suffix: string;
}) {
  // Tone styles map onto the Bourbon palette. Solid = copper. Mid =
  // amber-wash with copper text. Success = moss.
  const styles: Record<typeof tone, string> = {
    solid:
      "bg-g-accent text-white border-g-accent-hover",
    "solid-mid":
      "bg-g-accent-faint text-g-accent border-g-accent/30",
    success:
      "bg-[rgba(92,125,63,0.18)] text-g-success border-g-success/40",
  };
  return (
    <div className="flex items-center gap-3 text-[12px]">
      <span className="w-24 shrink-0 text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
        {label}
      </span>
      <div
        className={`flex h-7 items-center justify-between gap-3 rounded-md border px-3 transition-all ${styles[tone]}`}
        style={{ width: `${width}%`, minWidth: "120px" }}
      >
        <span className="font-geist-mono font-semibold tabular-nums">
          {count}
        </span>
        <span
          className="text-[10px] opacity-80 font-geist-mono"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: suffix }}
        />
      </div>
    </div>
  );
}
