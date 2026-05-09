import { ExternalLink, Star } from "lucide-react";
import { ReviewsBrowser } from "@/components/app/ReviewsBrowser";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { readAppSession } from "@/lib/app/session";
import { shortDate } from "@/lib/shared/format";
import { AddReviewDialog } from "./_components/AddReviewDialog";
import { ReviewRowActions } from "./_components/ReviewRowActions";
import { ReviewAskToggle } from "./_components/ReviewAskToggle";
import { VelocityBars } from "./_components/VelocityBars";
import {
  getReviewAskEnabled,
  getReviewsForTenant,
  publishedReviews,
  reviewVelocity12Months,
  spamSuspects,
  summarizeReviews,
} from "./_components/queries";
import { spamReason } from "./spam";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reviews · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const session = await readAppSession();

  // Demo + unauthenticated keep the curated demo browser. Tenants get the
  // real module backed by the `reviews` table.
  if (session.kind !== "tenant") {
    return <ReviewsBrowser product="demo" />;
  }

  const [rows, askEnabled] = await Promise.all([
    getReviewsForTenant(session.tenant.id),
    getReviewAskEnabled(session.tenant.id),
  ]);

  const kpis = summarizeReviews(rows);
  const velocity = reviewVelocity12Months(rows);
  const suspects = spamSuspects(rows);
  const recent = publishedReviews(rows).slice(0, 25);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Reputation`}
        title="Reviews"
        subtitle="Moderate the public-facing feed — spam goes here, replies are saved for posting once Google Business Profile is connected."
        actions={<AddReviewDialog />}
      />

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard
          label="Lifetime"
          value={String(kpis.lifetimeCount)}
          delta={`${kpis.lifetimeAverage.toFixed(1)}★`}
          trend={kpis.lifetimeAverage >= 4.5 ? "up" : "flat"}
        />
        <KPICard
          label="Avg rating"
          value={`${kpis.lifetimeAverage.toFixed(1)}★`}
          delta={kpis.lifetimeCount > 0 ? `${kpis.lifetimeCount} total` : "no data"}
          trend={kpis.lifetimeAverage >= 4.5 ? "up" : "flat"}
        />
        <KPICard
          label="Last 30d"
          value={String(kpis.last30Count)}
          delta={kpis.last30Count > 0 ? `${kpis.last30Average.toFixed(1)}★` : "—"}
          trend={kpis.last30Count > 0 ? "up" : "flat"}
        />
        <KPICard
          label="30d avg"
          value={`${kpis.last30Average.toFixed(1)}★`}
          delta={kpis.last30Count > 0 ? `${kpis.last30Count} reviews` : "—"}
          trend={kpis.last30Average >= 4.5 ? "up" : "flat"}
        />
        <KPICard
          label="Replied rate"
          value={`${kpis.repliedRatePct}%`}
          delta={kpis.repliedRatePct >= 50 ? "healthy" : "behind"}
          trend={kpis.repliedRatePct >= 50 ? "up" : "down"}
        />
      </section>

      <section className="g-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Velocity · last 12 months
          </span>
          <span className="text-[11px] text-g-text-muted font-geist-mono tabular-nums">
            {velocity.reduce((s, p) => s + p.count, 0)} total
          </span>
        </div>
        <VelocityBars data={velocity} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] font-medium text-g-text">
            Spam moderation queue
          </h2>
          <span className="text-[11px] text-g-text-muted">
            {suspects.length === 0
              ? "All clear."
              : `${suspects.length} suspect${suspects.length === 1 ? "" : "s"} surfaced`}
          </span>
        </div>
        {suspects.length === 0 ? (
          <div className="g-card p-6 text-[13px] text-g-text-muted text-center">
            Nothing flagged. Spam, all-caps shouting, and promo handles
            land here automatically.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {suspects.map((r) => {
              const reason = spamReason(r.body, r.reviewer_name);
              const isFlaggedInDb = r.status === "spam";
              return (
                <div key={r.id} className="g-card p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[12px] text-g-text-muted">
                        <span className="font-medium text-g-text">
                          {r.reviewer_name}
                        </span>
                        <span className="font-geist-mono tabular-nums">
                          {"★".repeat(r.rating)}
                          {"☆".repeat(5 - r.rating)}
                        </span>
                        <span className="text-g-text-faint">·</span>
                        <span className="capitalize">{r.source}</span>
                        <span className="text-g-text-faint">·</span>
                        <span>{shortDate(r.submitted_at)}</span>
                        {isFlaggedInDb ? (
                          <StatusPill tone="danger">flagged</StatusPill>
                        ) : (
                          <StatusPill tone="warning">suspect</StatusPill>
                        )}
                        {reason && (
                          <span className="text-[11px] text-g-text-faint italic">
                            {reason}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-g-text leading-snug line-clamp-3">
                        {r.body}
                      </p>
                    </div>
                    <ReviewRowActions
                      reviewId={r.id}
                      variant={isFlaggedInDb ? "spam" : "published"}
                      replyBody={r.reply_body}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] font-medium text-g-text">
            Recent reviews
          </h2>
          <span className="text-[11px] text-g-text-muted">
            Showing {recent.length} of {kpis.lifetimeCount} published
          </span>
        </div>
        {recent.length === 0 ? (
          <div className="g-card p-10 text-center text-[13px] text-g-text-muted flex flex-col items-center gap-2">
            <Star className="h-5 w-5 text-g-text-faint" />
            <span>
              No published reviews yet — backfill your Google reviews
              with the “Add review” button.
            </span>
          </div>
        ) : (
          <div className="g-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-g-border-subtle">
                    <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                      Rating
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                      Reviewer
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                      Body
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                      Replied
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                      Submitted
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-g-border-subtle last:border-b-0 align-top"
                    >
                      <td className="px-4 py-3 font-geist-mono tabular-nums whitespace-nowrap">
                        {"★".repeat(r.rating)}
                        <span className="text-g-text-faint">
                          {"☆".repeat(5 - r.rating)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-g-text">{r.reviewer_name}</span>
                          <span className="text-[11px] text-g-text-faint capitalize">
                            {r.source}
                            {r.source_url && (
                              <a
                                href={r.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center ml-1 text-g-text-muted hover:text-g-accent"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <p className="text-g-text leading-snug line-clamp-3">
                          {r.body}
                        </p>
                        {r.reply_body && (
                          <p className="mt-1.5 pl-2 border-l-2 border-g-accent/40 text-[12px] text-g-text-muted line-clamp-2">
                            <span className="text-g-text-faint">↳ </span>
                            {r.reply_body}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.replied ? (
                          <StatusPill tone="success">replied</StatusPill>
                        ) : (
                          <StatusPill tone="neutral">not yet</StatusPill>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-g-text-muted font-geist-mono tabular-nums">
                        {shortDate(r.submitted_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <ReviewRowActions
                          reviewId={r.id}
                          variant="published"
                          replyBody={r.reply_body}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="g-card p-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[13px] font-medium text-g-text">
            Auto-ask after every service visit
          </span>
          <span className="text-[12px] text-g-text-muted">
            Send a review-ask SMS three days after a job is marked complete.
            Quiet-hour rules and TCPA consent gates are honored automatically.
          </span>
        </div>
        <ReviewAskToggle initial={askEnabled} />
      </section>
    </div>
  );
}
