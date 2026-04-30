import { TodayDashboard } from "@/components/app/TodayDashboard";
import { CREWS } from "@/lib/demo/seed-crews";
import { supabaseAdmin } from "@/lib/supabase";
import type { ActivityEvent, KPI } from "@/lib/shared/types";

export const dynamic = "force-dynamic";

type DemoBookingRow = {
  id: string;
  status: string | null;
  crew_name: string | null;
  owner_name: string | null;
  conversion_value_cents: number | null;
  tier_interest: string | null;
  created_at: string;
};

export default async function WarRoomTodayPage() {
  const { bookings, error } = await loadBookings();

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const greeting = `Today, ${dayName} ${monthDay}`;

  const todayCount = bookings.filter((b) => isToday(b.created_at)).length;
  const subtitle = error
    ? `War Room shell live. Real-data wiring resolves once Supabase is reachable.`
    : `${todayCount} new demo bookings today · ${bookings.length} total tracked · pipeline view live.`;

  // KPIs from the real demo_requests table.
  const totalPipelineCents = bookings.reduce(
    (s, b) => s + (b.conversion_value_cents ?? 0),
    0,
  );
  const won = bookings.filter((b) => b.status === "won").length;
  const newThisWeek = bookings.filter(
    (b) => Date.now() - new Date(b.created_at).getTime() < 7 * 86400_000,
  ).length;

  const kpis: KPI[] = [
    {
      label: "Pipeline · all time",
      value: dollar(totalPipelineCents),
      delta: bookings.length ? `${bookings.length} bookings` : "—",
      trend: bookings.length ? "up" : "flat",
      spark: bookings.length ? generateSpark(bookings.length) : Array(8).fill(0),
    },
    {
      label: "Closed Won",
      value: String(won),
      delta: won > 0 ? "+1 this month" : "—",
      trend: won > 0 ? "up" : "flat",
    },
    {
      label: "New this week",
      value: String(newThisWeek),
      delta: bookings.length ? `${bookings.length} all time` : "—",
      trend: newThisWeek > 0 ? "up" : "flat",
    },
    {
      label: "Founders online",
      value: "2",
      delta: "Ricardo · Joshua",
      trend: "flat",
    },
  ];

  const crews = CREWS.slice(0, 2).map((crew) => ({
    crew,
    status: "Off" as const,
    jobsToday: 0,
    revenueTodayCents: 0,
  }));

  const activity: ActivityEvent[] = bookings.slice(0, 12).map((b) => ({
    id: b.id,
    ts: b.created_at,
    kind: "customer_added",
    text: `${b.crew_name ?? "Unknown crew"} (${b.owner_name ?? "—"}) booked a demo · ${b.tier_interest ?? "Pro"}`,
    amountCents: b.conversion_value_cents ?? undefined,
  }));

  const funnel = {
    sent: bookings.length,
    viewed: bookings.filter((b) =>
      ["scheduled", "demoed", "won", "lost"].includes(b.status ?? ""),
    ).length,
    won,
    scheduled: bookings.filter((b) => b.status === "scheduled").length,
  };

  return (
    <TodayDashboard
      product="founders"
      greeting={greeting}
      subtitle={subtitle}
      kpis={kpis}
      crews={crews}
      activity={activity}
      funnel={funnel}
    />
  );
}

async function loadBookings(): Promise<{ bookings: DemoBookingRow[]; error?: string }> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("demo_requests")
      .select(
        "id, status, crew_name, owner_name, conversion_value_cents, tier_interest, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) throw error;
    return { bookings: (data ?? []) as DemoBookingRow[] };
  } catch (err) {
    return {
      bookings: [],
      error: err instanceof Error ? err.message : "supabase_offline",
    };
  }
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function dollar(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function generateSpark(seed: number): number[] {
  // Stable-ish spark from the booking count so it doesn't move on every render.
  const out: number[] = [];
  let v = seed;
  for (let i = 0; i < 8; i++) {
    v = (v * 9301 + 49297) % 233280;
    out.push(Math.floor((v / 233280) * 100));
  }
  return out;
}
