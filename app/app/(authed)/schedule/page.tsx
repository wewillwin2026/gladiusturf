import { Calendar, ChevronRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { ScheduleBoard } from "@/components/app/ScheduleBoard";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { demoState } from "@/lib/demo/state";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  install: "Install",
  service: "Service",
  quote_visit: "Quote visit",
  warranty: "Warranty",
  plan_visit: "Plan visit",
  holiday_install: "Holiday install",
  storm_response: "Storm response",
  other: "Other",
};

const STATUS_TONE: Record<string, Tone> = {
  scheduled: "info",
  en_route: "warning",
  on_site: "accent",
  completed: "success",
  canceled: "neutral",
  no_show: "danger",
};

type ScheduleRow = {
  id: string;
  customer_id: string | null;
  type: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: string;
  notes: string | null;
  customers: { display_name: string } | { display_name: string }[] | null;
};

export default async function SchedulePage() {
  const session = await readAppSession();

  if (session.kind === "tenant") {
    const sb = supabaseAdmin();
    const nowIso = new Date().toISOString();
    const horizonIso = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const { data, error } = await sb
      .from("schedule_items")
      .select(
        "id, customer_id, type, title, starts_at, ends_at, status, notes, customers(display_name)",
      )
      .eq("tenant_id", session.tenant.id)
      .gte("starts_at", nowIso)
      .lte("starts_at", horizonIso)
      .order("starts_at", { ascending: true })
      .limit(200);
    if (error) {
      console.warn("schedule query error", error);
    }
    const rows = (data ?? []) as unknown as ScheduleRow[];

    if (rows.length === 0) {
      return (
        <TenantEmptyState
          engine="Schedule"
          tenant={session.tenant}
          icon={Calendar}
          body="Nothing on the calendar in the next 30 days. Accepting a quote auto-creates a placeholder install slot. Storm Mode and warranty visits also land here."
        />
      );
    }

    // Bucket: today / tomorrow / next 7d / later
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const endOfTomorrow = new Date(
      startOfDay.getTime() + 2 * 24 * 60 * 60 * 1000,
    );
    const endOfWeek = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000);

    const bucket = (iso: string): "today" | "tomorrow" | "week" | "later" => {
      const t = new Date(iso).getTime();
      if (t < endOfToday.getTime()) return "today";
      if (t < endOfTomorrow.getTime()) return "tomorrow";
      if (t < endOfWeek.getTime()) return "week";
      return "later";
    };

    const buckets = {
      today: [] as ScheduleRow[],
      tomorrow: [] as ScheduleRow[],
      week: [] as ScheduleRow[],
      later: [] as ScheduleRow[],
    };
    for (const r of rows) buckets[bucket(r.starts_at)].push(r);

    const installs = rows.filter((r) => r.type === "install").length;
    const warrantyOrService = rows.filter(
      (r) => r.type === "warranty" || r.type === "service",
    ).length;
    const stormResponse = rows.filter((r) => r.type === "storm_response").length;

    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow={`${session.tenant.display_name} · Schedule`}
          title="Schedule"
          subtitle={`${rows.length} item${rows.length === 1 ? "" : "s"} in the next 30 days. Accepting a quote auto-creates an install slot.`}
        />

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            label="Today"
            value={String(buckets.today.length)}
            delta={
              buckets.today.length > 0 ? "in flight" : "nothing booked"
            }
            trend={buckets.today.length > 0 ? "up" : "flat"}
          />
          <KPICard
            label="This week"
            value={String(buckets.today.length + buckets.tomorrow.length + buckets.week.length)}
            delta={`${rows.length} total · 30d`}
            trend="up"
          />
          <KPICard
            label="Installs"
            value={String(installs)}
            delta={
              installs > 0
                ? "from accepted quotes"
                : "no installs queued"
            }
            trend={installs > 0 ? "up" : "flat"}
          />
          <KPICard
            label="Warranty / service"
            value={String(warrantyOrService)}
            delta={
              stormResponse > 0
                ? `+${stormResponse} storm response`
                : "no warranty calls"
            }
            trend={warrantyOrService > 0 ? "up" : "flat"}
          />
        </section>

        <ScheduleBucket title="Today" rows={buckets.today} />
        <ScheduleBucket title="Tomorrow" rows={buckets.tomorrow} />
        <ScheduleBucket title="Rest of this week" rows={buckets.week} />
        <ScheduleBucket title="Later this month" rows={buckets.later} />
      </div>
    );
  }

  const state = demoState();
  const today = new Date();
  const todayStr = today.toDateString();
  const visitsToday = state.jobs.filter(
    (j) => new Date(j.scheduledAt).toDateString() === todayStr,
  ).length;
  const next7days = state.jobs.filter((j) => {
    const t = new Date(j.scheduledAt).getTime();
    return t >= Date.now() && t < Date.now() + 7 * 86400_000;
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cypress Lawn"
        title="Schedule"
        subtitle="Week view, 6 crew swimlanes. Drag any job to reschedule. Auto-optimize to recompute the routes."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Visits today"
          value={String(visitsToday)}
          delta={`${next7days} this week`}
          trend="up"
        />
        <KPICard
          label="Crews active"
          value={String(state.crews.length)}
          delta="6 / 6"
          trend="flat"
        />
        <KPICard
          label="Open slots"
          value="11"
          delta="fillable"
          trend="flat"
        />
        <KPICard
          label="Drive-time savings"
          value="47 min"
          delta="auto-optimize"
          trend="down"
        />
      </section>

      <ScheduleBoard
        jobs={state.jobs}
        crews={state.crews}
        customers={state.customers}
      />
    </div>
  );
}

function ScheduleBucket({
  title,
  rows,
}: {
  title: string;
  rows: ScheduleRow[];
}) {
  if (rows.length === 0) return null;
  return (
    <section className="g-card overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 border-b border-g-border-subtle">
        <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          {title}
        </span>
        <span className="font-geist-mono text-[11px] text-g-text-faint">
          {rows.length}
        </span>
      </header>
      <ul>
        {rows.map((r) => {
          const cust = Array.isArray(r.customers) ? r.customers[0] : r.customers;
          const start = new Date(r.starts_at);
          const end = new Date(r.ends_at);
          const dateLabel = start.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          const timeLabel = `${start.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })} → ${end.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}`;
          const link = r.customer_id
            ? `/app/customers/${r.customer_id}`
            : null;

          const inner = (
            <div className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-g-surface-2 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-g-text truncate">
                    {r.title}
                  </span>
                  <StatusPill tone={STATUS_TONE[r.status] ?? "neutral"}>
                    {r.status}
                  </StatusPill>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-[11px] text-g-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {dateLabel} · {timeLabel}
                  </span>
                  {cust?.display_name && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {cust.display_name}
                    </span>
                  )}
                  <span className="text-g-text-faint">
                    {TYPE_LABEL[r.type] ?? r.type}
                  </span>
                </div>
              </div>
              {link && <ChevronRight className="h-4 w-4 text-g-text-faint" />}
            </div>
          );

          return (
            <li
              key={r.id}
              className="border-b border-g-border-subtle/60 last:border-b-0"
            >
              {link ? (
                <Link href={link} prefetch>
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
