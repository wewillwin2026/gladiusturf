import * as React from "react";
import { MessageSquare, Star, ThumbsUp } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import { Avatar } from "./ui/Avatar";
import { type ProductKind } from "./engines";
import { demoState } from "@/lib/demo/state";
import { relTime } from "@/lib/shared/format";

const SOURCE_TONE: Record<string, "info" | "warning" | "success"> = {
  Google: "info",
  Yelp: "warning",
  Nextdoor: "success",
};

function blurbForNps(nps: number, name: string): string {
  if (nps >= 9)
    return `Crew showed up early, gave great recs. Best lawn service we've used. — ${name}`;
  if (nps >= 7)
    return `Yard always looks clean. Communication is solid. — ${name}`;
  return `Decent service, occasional miss on edges. — ${name}`;
}

function starsFromNps(nps: number): number {
  if (nps >= 9) return 5;
  if (nps >= 7) return 4;
  if (nps >= 5) return 3;
  return 2;
}

export function ReviewsBrowser({ product }: { product: ProductKind }) {
  const { customers } = demoState();
  const reviewed = customers
    .filter((c) => typeof c.npsScore === "number")
    .slice(0, 36);

  const reviews = reviewed.map((c, i) => ({
    id: `rev_${i}`,
    name: c.name,
    nps: c.npsScore!,
    stars: starsFromNps(c.npsScore!),
    source:
      i % 3 === 0 ? "Google" : i % 3 === 1 ? "Nextdoor" : "Yelp",
    blurb: blurbForNps(c.npsScore!, c.name.split(" ")[0]!),
    ts: c.lastVisit,
    crew:
      ["Riverside North", "Westshore", "Ballast Point", "Hyde Park", "Bayshore", "Tampa East"][
        i % 6
      ]!,
    replied: i % 4 !== 0,
  }));

  // NPS distribution bins (0–6 detractors, 7–8 passives, 9–10 promoters)
  const detractors = reviews.filter((r) => r.nps <= 6).length;
  const passives = reviews.filter((r) => r.nps >= 7 && r.nps <= 8).length;
  const promoters = reviews.filter((r) => r.nps >= 9).length;
  const total = reviews.length;
  const npsScore = total > 0
    ? Math.round(((promoters - detractors) / total) * 100)
    : 0;
  const avg = (
    reviews.reduce((s, r) => s + r.stars, 0) / Math.max(1, reviews.length)
  ).toFixed(2);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Reviews"
        subtitle="Google · Yelp · Nextdoor unified. Auto-asked from promoters via the Review engine."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Average rating"
          value={avg}
          delta="+0.07"
          trend="up"
        />
        <KPICard
          label="Reviews · this month"
          value="23"
          delta="+8 vs last"
          trend="up"
        />
        <KPICard
          label="Response rate"
          value="100%"
          delta="founder reply"
          trend="flat"
        />
        <KPICard
          label="NPS"
          value={String(npsScore)}
          delta={`${promoters} promoters`}
          trend="up"
        />
      </section>

      {/* NPS distribution bar */}
      <section className="g-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            NPS distribution · last 90 days
          </h3>
          <span className="font-mono text-[12px] text-g-text-muted">
            n = {total}
          </span>
        </div>
        <div className="flex h-6 rounded-md overflow-hidden border border-g-border-subtle">
          <div
            className="bg-g-danger/70 flex items-center justify-center text-[10px] text-g-text"
            style={{ width: `${(detractors / total) * 100}%` }}
            title={`${detractors} detractors`}
          >
            {detractors > 1 ? `${detractors}` : ""}
          </div>
          <div
            className="bg-g-warning/70 flex items-center justify-center text-[10px] text-obsidian"
            style={{ width: `${(passives / total) * 100}%` }}
            title={`${passives} passives`}
          >
            {passives > 1 ? `${passives}` : ""}
          </div>
          <div
            className="bg-g-success/70 flex items-center justify-center text-[10px] text-obsidian"
            style={{ width: `${(promoters / total) * 100}%` }}
            title={`${promoters} promoters`}
          >
            {promoters > 1 ? `${promoters}` : ""}
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
          <span>Detractors · 0–6</span>
          <span>Passives · 7–8</span>
          <span>Promoters · 9–10</span>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {reviews.slice(0, 18).map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </section>
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: {
    id: string;
    name: string;
    nps: number;
    stars: number;
    source: string;
    blurb: string;
    ts: string;
    crew: string;
    replied: boolean;
  };
}) {
  return (
    <div className="g-card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Avatar name={review.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-g-text font-medium truncate">{review.name}</span>
            <StatusPill tone={SOURCE_TONE[review.source] || "neutral"}>
              {review.source}
            </StatusPill>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-g-text-faint">
            <Stars n={review.stars} />
            <span>·</span>
            <span className="font-mono">NPS {review.nps}</span>
            <span>·</span>
            <span>{review.crew}</span>
          </div>
        </div>
      </div>
      <p className="text-[13px] text-g-text-muted leading-relaxed italic">
        &ldquo;{review.blurb}&rdquo;
      </p>
      <div className="flex items-center justify-between pt-2 border-t border-g-border-subtle/60">
        <div className="text-[11px] font-mono text-g-text-faint">
          {relTime(review.ts)}
        </div>
        {review.replied ? (
          <StatusPill tone="success">
            <ThumbsUp className="h-3 w-3" /> Replied
          </StatusPill>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-g-accent/40 bg-g-accent-faint px-2 py-1 text-[11px] text-g-accent hover:bg-g-accent/20"
          >
            <MessageSquare className="h-3 w-3" />
            Reply
          </button>
        )}
      </div>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < n
              ? "text-g-warning fill-g-warning"
              : "text-g-text-faint/30"
          }`}
          strokeWidth={i < n ? 1 : 1.5}
        />
      ))}
    </span>
  );
}
