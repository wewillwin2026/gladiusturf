import { BarChart3, Star, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { ReportsBrowser } from "@/components/app/ReportsBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { demoState } from "@/lib/demo/state";
import { money } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

type ProposalRow = {
  status: string;
  total_cents: number | null;
  sold_at: string | null;
  sent_at: string | null;
};
type PlanSubRow = {
  status: string;
  plans: { monthly_price_cents: number | null } | { monthly_price_cents: number | null }[] | null;
};
type ScheduleRow = {
  status: string;
  starts_at: string;
};
type ReviewRow = {
  rating: number | null;
  created_at: string;
};

function startOfWeekUtc(d: Date): Date {
  const x = new Date(d);
  const day = x.getUTCDay(); // 0=Sun
  // Anchor week on Mon (ISO-ish): subtract (day - 1 + 7) % 7
  const back = (day + 6) % 7;
  x.setUTCDate(x.getUTCDate() - back);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function fmtWeekLabel(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function asArray<T>(v: T | T[] | null | undefined): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function ReportsPage() {
  const session = await readAppSession();

  if (session.kind !== "tenant") {
    const state = demoState();
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Cypress Lawn"
          title="Reports"
          subtitle="Revenue · Margin · Churn · NPS · Routes. Five tabs, real charts, live data."
        />
        <ReportsBrowser
          customers={state.customers}
          jobs={state.jobs}
          quotes={state.quotes}
          invoices={state.invoices}
        />
      </div>
    );
  }

  const sb = supabaseAdmin();
  const tenantId = session.tenant.id;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 11 * 7); // last 12 weeks
  since.setUTCHours(0, 0, 0, 0);

  const [propsRes, plansRes, scheduleRes, reviewsRes] = await Promise.all([
    sb
      .from("proposals")
      .select("status, total_cents, sold_at, sent_at")
      .eq("tenant_id", tenantId)
      .or(`sold_at.gte.${since.toISOString()},sent_at.gte.${since.toISOString()}`)
      .limit(1000),
    sb
      .from("plan_subscriptions")
      .select("status, plans(monthly_price_cents)")
      .eq("tenant_id", tenantId)
      .limit(1000),
    sb
      .from("schedule_items")
      .select("status, starts_at")
      .eq("tenant_id", tenantId)
      .gte("starts_at", since.toISOString())
      .limit(2000),
    sb
      .from("reviews")
      .select("rating, created_at")
      .eq("tenant_id", tenantId)
      .gte("created_at", since.toISOString())
      .limit(500),
  ]);

  const proposals = (propsRes.data ?? []) as unknown as ProposalRow[];
  const planSubs = (plansRes.data ?? []) as unknown as PlanSubRow[];
  const scheduleItems = (scheduleRes.data ?? []) as unknown as ScheduleRow[];
  const reviews = (reviewsRes.data ?? []) as unknown as ReviewRow[];

  const hasAnyActivity =
    proposals.length > 0 ||
    planSubs.length > 0 ||
    scheduleItems.length > 0 ||
    reviews.length > 0;

  if (!hasAnyActivity) {
    return (
      <TenantEmptyState
        engine="Reports"
        tenant={session.tenant}
        icon={BarChart3}
        body="Revenue, plan ARR, route productivity, and review velocity charts appear here once you have activity. Send a quote, add a customer to a plan, or close a job and reports populate immediately."
      />
    );
  }

  // ---- 1. Weekly revenue (paid proposals by week, last 12 weeks) ----
  const weeklyRev = new Map<string, number>();
  for (let i = 0; i < 12; i++) {
    const d = startOfWeekUtc(new Date());
    d.setUTCDate(d.getUTCDate() - (11 - i) * 7);
    weeklyRev.set(d.toISOString().slice(0, 10), 0);
  }
  for (const p of proposals) {
    if ((p.status === "sold" || p.status === "installed") && p.sold_at) {
      const wk = startOfWeekUtc(new Date(p.sold_at))
        .toISOString()
        .slice(0, 10);
      if (weeklyRev.has(wk)) {
        weeklyRev.set(wk, (weeklyRev.get(wk) || 0) + (p.total_cents ?? 0));
      }
    }
  }
  const weeklyRevArr = Array.from(weeklyRev.entries()).sort();
  const maxWeeklyRev = Math.max(1, ...weeklyRevArr.map(([, v]) => v));

  const last4Total = weeklyRevArr.slice(-4).reduce((s, [, v]) => s + v, 0);
  const prior4Total = weeklyRevArr.slice(-8, -4).reduce((s, [, v]) => s + v, 0);
  const revDeltaPct =
    prior4Total === 0
      ? null
      : Math.round(((last4Total - prior4Total) / prior4Total) * 100);

  // ---- 2. Recurring plan ARR ----
  let monthlyRecurring = 0;
  let activeSubs = 0;
  for (const s of planSubs) {
    if (s.status === "active") {
      activeSubs++;
      const plan = asArray(s.plans)[0];
      monthlyRecurring += plan?.monthly_price_cents ?? 0;
    }
  }
  const annualRecurring = monthlyRecurring * 12;

  // ---- 3. Route productivity (completion rate on schedule_items) ----
  const totalScheduled = scheduleItems.length;
  const completed = scheduleItems.filter((s) => s.status === "completed").length;
  const canceled = scheduleItems.filter((s) => s.status === "canceled").length;
  const noShow = scheduleItems.filter((s) => s.status === "no_show").length;
  const completionPct =
    totalScheduled === 0 ? null : Math.round((completed / totalScheduled) * 100);

  // ---- 4. Review velocity (count by week) ----
  const weeklyReviews = new Map<string, number>();
  for (let i = 0; i < 12; i++) {
    const d = startOfWeekUtc(new Date());
    d.setUTCDate(d.getUTCDate() - (11 - i) * 7);
    weeklyReviews.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of reviews) {
    const wk = startOfWeekUtc(new Date(r.created_at))
      .toISOString()
      .slice(0, 10);
    if (weeklyReviews.has(wk)) {
      weeklyReviews.set(wk, (weeklyReviews.get(wk) || 0) + 1);
    }
  }
  const weeklyReviewsArr = Array.from(weeklyReviews.entries()).sort();
  const maxWeeklyReviews = Math.max(1, ...weeklyReviewsArr.map(([, v]) => v));

  const fiveStar = reviews.filter((r) => (r.rating ?? 0) >= 5).length;
  const avgRating =
    reviews.length === 0
      ? null
      : reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Reports`}
        title="Reports"
        subtitle="Last 12 weeks. Live data from your customers, plans, schedule, and reviews. Pulls update as activity comes in — no refresh button."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Revenue · last 4 weeks"
          value={money(last4Total)}
          delta={
            revDeltaPct == null
              ? "vs prior — no history"
              : `${revDeltaPct >= 0 ? "+" : ""}${revDeltaPct}% vs prior 4`
          }
        />
        <KPICard
          label="Recurring ARR"
          value={money(annualRecurring)}
          delta={`${activeSubs} active subscription${activeSubs === 1 ? "" : "s"}`}
        />
        <KPICard
          label="Completion rate"
          value={completionPct == null ? "—" : `${completionPct}%`}
          delta={`${completed} done · ${canceled + noShow} dropped`}
        />
        <KPICard
          label="Reviews (12w)"
          value={String(reviews.length)}
          delta={
            avgRating == null
              ? "—"
              : `${avgRating.toFixed(1)} ★ · ${fiveStar} five-star`
          }
        />
      </section>

      {/* 1. Weekly revenue bar chart */}
      <section className="g-card p-5">
        <header className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-g-accent" />
          <h2 className="text-[13px] text-g-text">Weekly revenue · paid</h2>
        </header>
        <ul className="flex h-32 items-end gap-1.5">
          {weeklyRevArr.map(([wk, v]) => {
            const heightPct = (v / maxWeeklyRev) * 100;
            return (
              <li
                key={wk}
                className="flex flex-1 flex-col items-center justify-end gap-1"
                title={`${fmtWeekLabel(new Date(wk))} — ${money(v)}`}
              >
                <span
                  className="w-full rounded-t-sm bg-g-accent/80"
                  style={{ height: `${Math.max(2, heightPct)}%` }}
                  aria-hidden
                />
                <span className="text-[9px] text-g-text-faint">
                  {fmtWeekLabel(new Date(wk))}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 2. Plan ARR card */}
      <section className="g-card p-5">
        <header className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-g-accent" />
          <h2 className="text-[13px] text-g-text">Recurring plan economics</h2>
        </header>
        <dl className="grid grid-cols-2 gap-4 text-[13px] md:grid-cols-4">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Active subscriptions
            </dt>
            <dd className="mt-1 text-g-text">{activeSubs}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Monthly recurring
            </dt>
            <dd className="mt-1 font-mono tabular-nums text-g-text">
              {money(monthlyRecurring)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              ARR
            </dt>
            <dd className="mt-1 font-mono tabular-nums text-g-text">
              {money(annualRecurring)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Avg sub value
            </dt>
            <dd className="mt-1 font-mono tabular-nums text-g-text">
              {activeSubs === 0
                ? "—"
                : money(Math.round(monthlyRecurring / activeSubs))}
            </dd>
          </div>
        </dl>
      </section>

      {/* 3. Route productivity bar */}
      <section className="g-card p-5">
        <header className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-g-accent" />
          <h2 className="text-[13px] text-g-text">
            Route productivity · last 12 weeks
          </h2>
        </header>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-g-surface-2">
          {totalScheduled > 0 && (
            <>
              <span
                className="bg-g-success"
                style={{ width: `${(completed / totalScheduled) * 100}%` }}
                title={`${completed} completed`}
              />
              <span
                className="bg-g-warning"
                style={{ width: `${(canceled / totalScheduled) * 100}%` }}
                title={`${canceled} canceled`}
              />
              <span
                className="bg-g-danger"
                style={{ width: `${(noShow / totalScheduled) * 100}%` }}
                title={`${noShow} no-show`}
              />
            </>
          )}
        </div>
        <p className="mt-3 text-[12px] text-g-text-muted">
          {totalScheduled} scheduled · {completed} done ·{" "}
          {canceled} canceled · {noShow} no-show.{" "}
          {completionPct != null && `${completionPct}% completion rate.`}
        </p>
      </section>

      {/* 4. Review velocity */}
      <section className="g-card p-5">
        <header className="mb-4 flex items-center gap-2">
          <Star className="h-4 w-4 text-g-accent" />
          <h2 className="text-[13px] text-g-text">Review velocity</h2>
        </header>
        <ul className="flex h-24 items-end gap-1.5">
          {weeklyReviewsArr.map(([wk, v]) => {
            const heightPct = (v / maxWeeklyReviews) * 100;
            return (
              <li
                key={wk}
                className="flex flex-1 flex-col items-center justify-end gap-1"
                title={`${fmtWeekLabel(new Date(wk))} — ${v} review${v === 1 ? "" : "s"}`}
              >
                <span
                  className="w-full rounded-t-sm bg-g-warning/80"
                  style={{ height: `${Math.max(2, heightPct)}%` }}
                  aria-hidden
                />
                <span className="text-[9px] text-g-text-faint">
                  {fmtWeekLabel(new Date(wk))}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[12px] text-g-text-muted">
          {reviews.length} reviews in the last 12 weeks ·{" "}
          {avgRating == null ? "—" : `${avgRating.toFixed(1)} ★ average`} ·{" "}
          {fiveStar} five-star.
        </p>
      </section>
    </div>
  );
}
