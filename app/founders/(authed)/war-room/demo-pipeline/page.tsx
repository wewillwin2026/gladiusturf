import { Activity, Inbox, MessageCircle } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { BookingRow } from "./BookingRow";
import {
  FullBookingForm,
  StatusQuickUpdate,
  type BookingFormDefaults,
} from "./UpdateBookingForm";

export const dynamic = "force-dynamic";

type DemoRequest = {
  id: string;
  crew_name: string | null;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  current_software: string | null;
  crew_size: string | null;
  tier_interest: string | null;
  wants_bdc: boolean | null;
  preferred_at: string | null;
  alt_time_note: string | null;
  status: string | null;
  assigned_to: string | null;
  conversion_value_cents: number | null;
  notes: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  source_page: string | null;
  created_at: string;
  updated_at: string | null;
};

type PipelineEvent = {
  id: string;
  booking_id: string;
  event_type: string;
  from_value: string | null;
  to_value: string | null;
  note: string | null;
  actor: string | null;
  created_at: string;
};

const ACTIVE_STATUSES: ReadonlyArray<DemoRequest["status"]> = [
  "new",
  "scheduled",
  "demoed",
];
const FUNNEL_ORDER = ["new", "scheduled", "demoed", "won"] as const;
const NEGATIVE_ORDER = ["lost", "no_show"] as const;

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function tierArrCents(tier: string | null, wantsBdc: boolean): number {
  const base =
    tier === "enterprise"
      ? 2997
      : tier === "professional"
        ? 997
        : tier === "independent"
          ? 397
          : 0;
  return (base + (wantsBdc ? 499 : 0)) * 12 * 100;
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function pipelineValueCents(b: DemoRequest): number {
  if (b.conversion_value_cents != null) return b.conversion_value_cents;
  return tierArrCents(b.tier_interest, !!b.wants_bdc);
}

function statusLabel(status: string | null): string {
  if (!status) return "—";
  if (status === "no_show") return "No-show";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function tierLabel(tier: string | null): string {
  if (!tier) return "Untiered";
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function tierPillClasses(tier: string | null): string {
  if (tier === "enterprise") {
    return "bg-champagne-bright/15 text-champagne-bright";
  }
  if (tier === "professional") {
    return "bg-moss-bright/15 text-moss-bright";
  }
  if (tier === "independent") {
    return "bg-bone/10 text-bone/70";
  }
  return "bg-bone/5 text-bone/50";
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function WarRoomPage() {
  const sb = supabaseAdmin();
  const [{ data: bookingsData }, { data: eventsData }] = await Promise.all([
    sb
      .from("demo_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    sb
      .from("pipeline_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const bookings: DemoRequest[] = (bookingsData ?? []) as DemoRequest[];
  const events: PipelineEvent[] = (eventsData ?? []) as PipelineEvent[];

  // KPI calcs
  const total = bookings.length;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = bookings.filter(
    (b) => new Date(b.created_at).getTime() >= sevenDaysAgo,
  ).length;

  const conversionDenom = bookings.filter((b) =>
    ["scheduled", "demoed", "won", "lost", "no_show"].includes(b.status ?? ""),
  ).length;
  const conversionNum = bookings.filter((b) =>
    ["won", "demoed"].includes(b.status ?? ""),
  ).length;
  const conversionRate =
    conversionDenom === 0
      ? "—"
      : `${Math.round((conversionNum / conversionDenom) * 100)}%`;

  const pipelineValue = bookings
    .filter((b) => ACTIVE_STATUSES.includes(b.status))
    .reduce((sum, b) => sum + pipelineValueCents(b), 0);

  const kpis: Array<{ label: string; value: string }> = [
    { label: "Total bookings", value: String(total) },
    { label: "This week", value: String(thisWeek) },
    { label: "Conversion rate", value: conversionRate },
    { label: "Pipeline value", value: formatUsd(pipelineValue) },
  ];

  // Funnel
  const statusCounts: Record<string, number> = {};
  for (const b of bookings) {
    const s = b.status ?? "new";
    statusCounts[s] = (statusCounts[s] ?? 0) + 1;
  }
  const activeCounts = FUNNEL_ORDER.map((s) => ({
    status: s,
    count: statusCounts[s] ?? 0,
  }));
  const negativeCounts = NEGATIVE_ORDER.map((s) => ({
    status: s,
    count: statusCounts[s] ?? 0,
  }));
  const activeMax = Math.max(1, ...activeCounts.map((c) => c.count));
  const negativeMax = Math.max(1, ...negativeCounts.map((c) => c.count));

  const funnelColor: Record<string, string> = {
    new: "bg-champagne-bright",
    scheduled: "bg-moss-bright",
    demoed: "bg-honey-bright",
    won: "bg-lime-bright",
  };

  const eventDot = (type: string) => {
    if (type === "status_changed") return "bg-moss-bright";
    if (type === "created") return "bg-champagne-bright";
    return "bg-bone/40";
  };

  return (
    <div>
      <header>
        <h1 className="font-serif text-4xl text-bone">War Room</h1>
        <p className="mt-1 text-bone/60">Pipeline. Conversions. Alerts.</p>
      </header>

      {/* KPI cards */}
      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6"
          >
            <div
              className={`text-xs uppercase tracking-[0.18em] ${
                idx % 2 === 0 ? "text-champagne-bright" : "text-moss-bright"
              }`}
            >
              {kpi.label}
            </div>
            <div className="mt-2 font-serif text-4xl text-bone">{kpi.value}</div>
          </div>
        ))}
      </section>

      {/* Funnel */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-bone">Funnel</h2>
          <p className="text-xs uppercase tracking-[0.18em] text-bone/45">
            New &rarr; Scheduled &rarr; Demoed &rarr; Won
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {activeCounts.map(({ status, count }) => {
            const pct = Math.round((count / activeMax) * 100);
            const showPct =
              total > 0 ? `${Math.round((count / Math.max(1, total)) * 100)}%` : "0%";
            return (
              <div key={status} className="flex items-center gap-4">
                <div className="w-28 text-xs uppercase tracking-[0.18em] text-bone/60">
                  {statusLabel(status)}
                </div>
                <div className="flex-1">
                  <div className="relative h-7 overflow-hidden rounded-md border border-bone/10 bg-bone/[0.02]">
                    <div
                      className={`absolute inset-y-0 left-0 ${funnelColor[status]}/70`}
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex h-full items-center justify-between px-3 text-xs text-bone">
                      <span className="font-medium">{count}</span>
                      <span className="text-bone/60">{showPct}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="text-xs uppercase tracking-[0.18em] text-bone/45">
            Negative outcomes
          </div>
          <div className="mt-3 space-y-3">
            {negativeCounts.map(({ status, count }) => {
              const pct = Math.round((count / negativeMax) * 100);
              const showPct =
                total > 0
                  ? `${Math.round((count / Math.max(1, total)) * 100)}%`
                  : "0%";
              return (
                <div key={status} className="flex items-center gap-4">
                  <div className="w-28 text-xs uppercase tracking-[0.18em] text-bone/45">
                    {statusLabel(status)}
                  </div>
                  <div className="flex-1">
                    <div className="relative h-7 overflow-hidden rounded-md border border-bone/10 bg-bone/[0.02]">
                      <div
                        className="absolute inset-y-0 left-0 bg-bone/20"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative flex h-full items-center justify-between px-3 text-xs text-bone/70">
                        <span className="font-medium">{count}</span>
                        <span className="text-bone/45">{showPct}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent bookings */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-bone">Recent bookings</h2>
          <span className="text-xs uppercase tracking-[0.18em] text-bone/45">
            {bookings.length} total
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-bone/10 bg-bone/[0.02] p-12 text-center">
            <Inbox className="mx-auto h-8 w-8 text-bone/30" />
            <p className="mt-4 text-bone/60">
              No bookings yet. The first one will land here the moment a prospect
              submits the demo form.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.02]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-bone/10 text-xs uppercase tracking-[0.18em] text-bone/45">
                <tr>
                  <th className="w-6 px-2 py-3" />
                  <th className="px-3 py-3 font-normal">When</th>
                  <th className="px-3 py-3 font-normal">Crew</th>
                  <th className="px-3 py-3 font-normal">Owner</th>
                  <th className="px-3 py-3 font-normal">Tier</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-3 py-3 font-normal">Pipeline $</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const defaults: BookingFormDefaults = {
                    id: b.id,
                    status: b.status,
                    assignedTo: b.assigned_to,
                    notes: b.notes,
                    conversionValueCents: b.conversion_value_cents,
                  };
                  const arr = pipelineValueCents(b);
                  const summary = (
                    <>
                      <td className="px-3 py-3 align-middle text-bone/70">
                        {relativeTime(b.created_at)}
                      </td>
                      <td className="px-3 py-3 align-middle text-bone">
                        {b.crew_name ?? "—"}
                      </td>
                      <td className="px-3 py-3 align-middle text-bone/70">
                        {b.owner_name ?? "—"}
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] ${tierPillClasses(b.tier_interest)}`}
                          >
                            {tierLabel(b.tier_interest)}
                          </span>
                          {b.wants_bdc && (
                            <span className="inline-flex items-center rounded-full bg-honey-bright/15 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-honey-bright">
                              + BDC
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <StatusQuickUpdate defaults={defaults} />
                      </td>
                      <td className="px-3 py-3 align-middle text-bone/80">
                        {arr > 0 ? `${formatUsd(arr)}/yr` : "—"}
                      </td>
                    </>
                  );

                  const details = (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3 text-sm">
                        <div className="text-xs uppercase tracking-[0.18em] text-bone/45">
                          Contact
                        </div>
                        <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-bone/80">
                          <span className="text-bone/45">Email</span>
                          <span>{b.email ?? "—"}</span>
                          <span className="text-bone/45">Phone</span>
                          <span>{b.phone ?? "—"}</span>
                          <span className="text-bone/45">Current SW</span>
                          <span>{b.current_software ?? "—"}</span>
                          <span className="text-bone/45">Crew size</span>
                          <span>{b.crew_size ?? "—"}</span>
                          <span className="text-bone/45">Preferred</span>
                          <span>{formatDateTime(b.preferred_at)}</span>
                          <span className="text-bone/45">Alt time</span>
                          <span>{b.alt_time_note ?? "—"}</span>
                        </div>

                        <div className="pt-3 text-xs uppercase tracking-[0.18em] text-bone/45">
                          Attribution
                        </div>
                        <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-bone/70">
                          <span className="text-bone/45">Source</span>
                          <span>{b.utm_source ?? "—"}</span>
                          <span className="text-bone/45">Medium</span>
                          <span>{b.utm_medium ?? "—"}</span>
                          <span className="text-bone/45">Campaign</span>
                          <span>{b.utm_campaign ?? "—"}</span>
                          <span className="text-bone/45">Term</span>
                          <span>{b.utm_term ?? "—"}</span>
                          <span className="text-bone/45">Content</span>
                          <span>{b.utm_content ?? "—"}</span>
                          <span className="text-bone/45">Referrer</span>
                          <span className="truncate">{b.referrer ?? "—"}</span>
                          <span className="text-bone/45">Page</span>
                          <span className="truncate">{b.source_page ?? "—"}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-bone/45">
                          Update
                        </div>
                        <div className="mt-3">
                          <FullBookingForm defaults={defaults} />
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <BookingRow key={b.id} summary={summary} details={details} />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pipeline events log */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-bone">Recent activity</h2>
          <span className="text-xs uppercase tracking-[0.18em] text-bone/45">
            {events.length} events
          </span>
        </div>

        {events.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 text-center">
            <Activity className="mx-auto h-7 w-7 text-bone/30" />
            <p className="mt-3 text-sm text-bone/60">
              No activity yet. Status changes and notes will stream here.
            </p>
          </div>
        ) : (
          <ol className="mt-5 space-y-3 border-l border-bone/10 pl-5">
            {events.map((e) => {
              const arrow =
                e.from_value || e.to_value
                  ? ` ${e.from_value ?? "—"} → ${e.to_value ?? "—"}`
                  : "";
              return (
                <li key={e.id} className="relative">
                  <span
                    className={`absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full ${eventDot(e.event_type)}`}
                  />
                  <div className="flex flex-wrap items-baseline gap-2 text-sm text-bone/80">
                    <span className="text-bone">{e.actor ?? "system"}</span>
                    <span className="text-bone/40">&middot;</span>
                    <span className="text-bone/70">{e.event_type}</span>
                    {arrow && (
                      <>
                        <span className="text-bone/40">&middot;</span>
                        <span className="font-mono text-xs text-bone/60">
                          {arrow.trim()}
                        </span>
                      </>
                    )}
                    <span className="text-bone/40">&middot;</span>
                    <span className="text-bone/45">
                      {relativeTime(e.created_at)}
                    </span>
                  </div>
                  {e.note && (
                    <div className="mt-1 flex items-start gap-1.5 text-xs text-bone/60">
                      <MessageCircle className="mt-0.5 h-3 w-3 text-bone/40" />
                      <span className="break-words">{e.note}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
