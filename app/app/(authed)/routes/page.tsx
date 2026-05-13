import Link from "next/link";
import { Calendar, MapPin, Route, Truck } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { RoutesBrowser } from "@/components/app/RoutesBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { AutoOrderButton } from "./_components/AutoOrderButton";

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

type RouteRow = {
  id: string;
  customer_id: string | null;
  type: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  route_position: number | null;
  notes: string | null;
  customers:
    | { display_name: string; service_address: unknown }
    | { display_name: string; service_address: unknown }[]
    | null;
};

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function extractZip(addr: unknown): string {
  if (!addr || typeof addr !== "object") return "";
  const a = addr as Record<string, unknown>;
  const zip = a.zip ?? a.postal_code ?? a.postalCode ?? a.postcode;
  if (typeof zip === "string") return zip.slice(0, 10);
  return "";
}

function extractStreet(addr: unknown): string {
  if (!addr || typeof addr !== "object") return "";
  const a = addr as Record<string, unknown>;
  const line1 = a.line1 ?? a.street ?? a.address ?? a.address1;
  if (typeof line1 === "string") return line1;
  return "";
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayLabel(key: string): string {
  const d = new Date(`${key}T12:00:00Z`);
  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);
  const diff = Math.round(
    (d.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function Page() {
  const session = await readAppSession();

  if (session.kind !== "tenant") {
    return <RoutesBrowser product="demo" />;
  }

  const sb = supabaseAdmin();
  // 7-day horizon starting yesterday (so completed routes are visible).
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 1);
  const end = new Date(start.getTime() + 8 * 24 * 60 * 60 * 1000);

  const { data, error } = await sb
    .from("schedule_items")
    .select(
      "id, customer_id, type, title, starts_at, ends_at, status, route_position, notes, customers(display_name, service_address)",
    )
    .eq("tenant_id", session.tenant.id)
    .gte("starts_at", start.toISOString())
    .lt("starts_at", end.toISOString())
    .order("starts_at", { ascending: true })
    .limit(300);

  if (error) {
    console.warn("routes query error", error);
  }

  const rows = (data ?? []) as unknown as RouteRow[];

  if (rows.length === 0) {
    return (
      <TenantEmptyState
        engine="Routes"
        tenant={session.tenant}
        icon={Route}
        body="No stops scheduled in the next 7 days. Accept a quote, add a maintenance visit, or activate Storm Mode and stops land here. Then auto-order by ZIP for the day."
      />
    );
  }

  const byDay = new Map<string, RouteRow[]>();
  for (const r of rows) {
    const k = dayKey(r.starts_at);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(r);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => {
      if (a.route_position != null && b.route_position != null) {
        return a.route_position - b.route_position;
      }
      if (a.route_position != null) return -1;
      if (b.route_position != null) return 1;
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    });
  }

  const totalStops = rows.length;
  const todayKey = dayKey(new Date().toISOString());
  const todaysStops = byDay.get(todayKey)?.length ?? 0;
  const orderedToday =
    byDay.get(todayKey)?.filter((r) => r.route_position != null).length ?? 0;
  const stormCount = rows.filter((r) => r.type === "storm_response").length;

  const dayKeys = Array.from(byDay.keys()).sort();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Routes`}
        title="Routes"
        subtitle={`${totalStops} stop${totalStops === 1 ? "" : "s"} across ${dayKeys.length} day${dayKeys.length === 1 ? "" : "s"}. Order by ZIP for clean neighborhood batches; proximity + drive-time optimizer ships next.`}
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Today" value={String(todaysStops)} />
        <KPICard
          label="Ordered today"
          value={`${orderedToday} / ${todaysStops}`}
        />
        <KPICard label="Next 7 days" value={String(totalStops)} />
        <KPICard label="Storm response" value={String(stormCount)} />
      </section>

      {dayKeys.map((key) => {
        const stops = byDay.get(key) ?? [];
        const ordered = stops.filter((r) => r.route_position != null).length;
        return (
          <section key={key} className="g-card overflow-hidden">
            <header className="flex items-center justify-between gap-3 border-b border-g-border-subtle px-5 py-3">
              <div className="min-w-0">
                <h2 className="text-[14px] text-g-text">
                  {dayLabel(key)}
                  <span className="ml-2 text-[11px] text-g-text-faint">
                    {key}
                  </span>
                </h2>
                <p className="text-[11px] text-g-text-muted">
                  {stops.length} stop{stops.length === 1 ? "" : "s"} ·{" "}
                  {ordered === stops.length
                    ? "fully ordered"
                    : `${ordered}/${stops.length} ordered`}
                </p>
              </div>
              <AutoOrderButton dayKey={key} />
            </header>

            <ul className="divide-y divide-g-border-subtle">
              {stops.map((s, idx) => {
                const cust = Array.isArray(s.customers)
                  ? s.customers[0]
                  : s.customers;
                const positionLabel =
                  s.route_position != null
                    ? String(s.route_position).padStart(2, "0")
                    : String(idx + 1).padStart(2, "0");
                const zip = extractZip(cust?.service_address);
                const street = extractStreet(cust?.service_address);
                return (
                  <li
                    key={s.id}
                    className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[40px_minmax(0,1fr)_auto_auto] md:items-center md:gap-4"
                  >
                    <span
                      className="font-mono text-[12px] tabular-nums text-g-text-faint"
                      aria-label="Stop position"
                    >
                      #{positionLabel}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-g-text">
                          {cust?.display_name || s.title}
                        </span>
                        <StatusPill tone="neutral">
                          {TYPE_LABEL[s.type] ?? s.type}
                        </StatusPill>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-g-text-muted">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {street || "Address on file"}
                          {zip ? ` · ${zip}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start text-[11px] text-g-text-muted md:items-end">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {fmtTime(s.starts_at)}
                        {s.ends_at && ` → ${fmtTime(s.ends_at)}`}
                      </span>
                    </div>
                    <StatusPill tone={STATUS_TONE[s.status] ?? "neutral"}>
                      {s.status.replace("_", " ")}
                    </StatusPill>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <section className="g-card p-5">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-g-accent" />
          <h3 className="text-[13px] text-g-text">
            How routes work right now
          </h3>
        </div>
        <p className="mt-2 text-[12px] leading-[1.55] text-g-text-muted">
          Today: 7-day view + ZIP-cluster auto-ordering. Drag-to-reorder, live
          truck telemetry, and proximity-aware optimization land in the next
          sprint. For now, hit{" "}
          <strong className="text-g-text">Auto-order by ZIP</strong> on each
          day to batch by neighborhood.
        </p>
        <Link
          href="/app/schedule"
          className="mt-3 inline-flex items-center gap-1 text-[12px] text-g-accent hover:underline"
        >
          See full schedule →
        </Link>
      </section>
    </div>
  );
}
