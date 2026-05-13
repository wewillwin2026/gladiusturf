import Link from "next/link";
import { Briefcase, Camera, CircleAlert, MapPin } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { JobsBoard } from "@/components/app/JobsBoard";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { demoState } from "@/lib/demo/state";
import { num } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

type JobRow = {
  id: string;
  customer_id: string | null;
  type: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  notes: string | null;
  completion_photos: string[] | null;
  customers: { display_name: string } | { display_name: string }[] | null;
};

const STATUS_TONE: Record<string, Tone> = {
  scheduled: "info",
  en_route: "warning",
  on_site: "accent",
  completed: "success",
  canceled: "neutral",
  no_show: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  en_route: "En route",
  on_site: "On site",
  completed: "Complete",
  canceled: "Canceled",
  no_show: "No-show",
};

const TYPE_LABEL: Record<string, string> = {
  install: "Install",
  service: "Service",
  warranty: "Warranty",
  plan_visit: "Plan visit",
  storm_response: "Storm response",
  holiday_install: "Holiday install",
  quote_visit: "Quote visit",
  other: "Other",
};

function fmtDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function dayBucket(iso: string): "today" | "tomorrow" | "week" | "later" | "past" {
  const t = new Date(iso).getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const endToday = now.getTime() + 24 * 60 * 60 * 1000;
  const endTomorrow = endToday + 24 * 60 * 60 * 1000;
  const endWeek = now.getTime() + 8 * 24 * 60 * 60 * 1000;
  if (t < now.getTime()) return "past";
  if (t < endToday) return "today";
  if (t < endTomorrow) return "tomorrow";
  if (t < endWeek) return "week";
  return "later";
}

export default async function JobsPage() {
  const session = await readAppSession();

  if (session.kind !== "tenant") {
    // Demo path unchanged.
    const state = demoState();
    const todayJobs = state.jobs.filter((j) => {
      const d = new Date(j.scheduledAt);
      const t = new Date();
      return (
        d.getFullYear() === t.getFullYear() &&
        d.getMonth() === t.getMonth() &&
        d.getDate() === t.getDate()
      );
    });
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Cypress Lawn"
          title="Jobs · Today"
          subtitle="Live job board across all crews. Tap any job for photos, signature, materials."
        />
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard label="Visits today" value={num(todayJobs.length)} delta={`${state.crews.length} crews`} trend="up" />
          <KPICard label="Complete" value={num(todayJobs.filter((j) => j.status === "Complete").length)} delta="on track" trend="up" />
          <KPICard label="On site / en-route" value={num(todayJobs.filter((j) => j.status === "OnSite" || j.status === "EnRoute").length)} delta="live" trend="flat" />
          <KPICard label="Skipped" value={num(todayJobs.filter((j) => j.status === "Skipped").length)} delta="needs follow-up" trend="down" />
        </section>
        <JobsBoard jobs={state.jobs} customers={state.customers} crews={state.crews} />
      </div>
    );
  }

  const sb = supabaseAdmin();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 30);
  const until = new Date();
  until.setUTCDate(until.getUTCDate() + 30);

  const { data, error } = await sb
    .from("schedule_items")
    .select(
      "id, customer_id, type, title, starts_at, ends_at, status, notes, completion_photos, customers(display_name)",
    )
    .eq("tenant_id", session.tenant.id)
    .gte("starts_at", since.toISOString())
    .lte("starts_at", until.toISOString())
    .order("starts_at", { ascending: true })
    .limit(300);

  if (error) console.warn("jobs query error", error);
  const rows = (data ?? []) as unknown as JobRow[];

  if (rows.length === 0) {
    return (
      <TenantEmptyState
        engine="Jobs"
        tenant={session.tenant}
        icon={Briefcase}
        body="A job is a scheduled visit — install, service, warranty, plan visit, storm response. Add one from /app/schedule or accept a quote and the install slot auto-creates here."
      />
    );
  }

  const buckets = {
    today: [] as JobRow[],
    tomorrow: [] as JobRow[],
    week: [] as JobRow[],
    later: [] as JobRow[],
    past: [] as JobRow[],
  };
  for (const r of rows) buckets[dayBucket(r.starts_at)].push(r);

  const completedThisMonth = rows.filter((r) => {
    if (r.status !== "completed") return false;
    const d = new Date(r.starts_at);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const liveCount = rows.filter(
    (r) => r.status === "en_route" || r.status === "on_site",
  ).length;
  const flagged = rows.filter(
    (r) => r.status === "no_show" || r.status === "canceled",
  ).length;
  const photosOnFile = rows.reduce(
    (s, r) => s + (Array.isArray(r.completion_photos) ? r.completion_photos.length : 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Jobs`}
        title="Jobs"
        subtitle={`${buckets.today.length} today · ${buckets.tomorrow.length} tomorrow · ${rows.length} total in the 60-day window.`}
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Today" value={String(buckets.today.length)} />
        <KPICard label="Live (en-route / on-site)" value={String(liveCount)} />
        <KPICard
          label="Completed this month"
          value={String(completedThisMonth)}
        />
        <KPICard
          label="Flagged"
          value={String(flagged)}
          delta="canceled or no-show"
        />
      </section>

      {(["today", "tomorrow", "week", "later"] as const).map((bucket) => {
        const items = buckets[bucket];
        if (items.length === 0) return null;
        const heading = {
          today: "Today",
          tomorrow: "Tomorrow",
          week: "Rest of the week",
          later: "Later (next 30 days)",
        }[bucket];
        return (
          <section key={bucket} className="g-card overflow-hidden">
            <header className="flex items-center justify-between border-b border-g-border-subtle px-5 py-3">
              <h2 className="text-[13px] text-g-text">
                {heading}
                <span className="ml-2 text-[11px] text-g-text-faint">
                  {items.length} job{items.length === 1 ? "" : "s"}
                </span>
              </h2>
            </header>
            <ul className="divide-y divide-g-border-subtle">
              {items.map((r) => {
                const cust = Array.isArray(r.customers)
                  ? r.customers[0]
                  : r.customers;
                const hasPhotos =
                  Array.isArray(r.completion_photos) &&
                  r.completion_photos.length > 0;
                return (
                  <li
                    key={r.id}
                    className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center md:gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-g-text">
                          {r.title || cust?.display_name || "Job"}
                        </span>
                        <StatusPill tone="neutral">
                          {TYPE_LABEL[r.type] ?? r.type}
                        </StatusPill>
                      </div>
                      <div className="mt-0.5 text-[11px] text-g-text-muted">
                        {cust?.display_name && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {cust.display_name}
                            <span className="mx-1">·</span>
                          </span>
                        )}
                        {fmtDateTime(r.starts_at)}
                      </div>
                    </div>
                    {hasPhotos && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] text-g-text-muted"
                        title={`${r.completion_photos!.length} photo${r.completion_photos!.length === 1 ? "" : "s"}`}
                      >
                        <Camera className="h-3 w-3" />
                        {r.completion_photos!.length}
                      </span>
                    )}
                    {r.notes && (
                      <span className="hidden text-[11px] text-g-text-faint md:inline-flex">
                        {r.notes.length > 50
                          ? `${r.notes.slice(0, 50)}…`
                          : r.notes}
                      </span>
                    )}
                    <StatusPill tone={STATUS_TONE[r.status] ?? "neutral"}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </StatusPill>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {buckets.past.length > 0 && (
        <section className="g-card overflow-hidden">
          <header className="border-b border-g-border-subtle px-5 py-3">
            <h2 className="text-[13px] text-g-text">
              Past 30 days
              <span className="ml-2 text-[11px] text-g-text-faint">
                {buckets.past.length} job{buckets.past.length === 1 ? "" : "s"}
              </span>
            </h2>
          </header>
          <ul className="divide-y divide-g-border-subtle">
            {buckets.past.slice(0, 12).map((r) => {
              const cust = Array.isArray(r.customers)
                ? r.customers[0]
                : r.customers;
              const flagged = r.status === "no_show" || r.status === "canceled";
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-g-text">
                        {r.title || cust?.display_name || "Job"}
                      </span>
                      {flagged && (
                        <CircleAlert
                          className="h-3 w-3 text-g-danger"
                          aria-label="Flagged"
                        />
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-g-text-muted">
                      {cust?.display_name && `${cust.display_name} · `}
                      {fmtDateTime(r.starts_at)}
                    </div>
                  </div>
                  <span className="text-[11px] text-g-text-faint">
                    {TYPE_LABEL[r.type] ?? r.type}
                  </span>
                  <StatusPill tone={STATUS_TONE[r.status] ?? "neutral"}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </StatusPill>
                </li>
              );
            })}
          </ul>
          {buckets.past.length > 12 && (
            <p className="px-5 py-3 text-[11px] text-g-text-faint">
              + {buckets.past.length - 12} earlier jobs ·{" "}
              <Link href="/app/schedule" className="text-g-accent hover:underline">
                Open schedule
              </Link>
            </p>
          )}
        </section>
      )}
    </div>
  );
}
