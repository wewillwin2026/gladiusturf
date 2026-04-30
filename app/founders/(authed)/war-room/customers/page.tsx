import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { supabaseAdmin } from "@/lib/supabase";
import { money, relTime } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

type DemoBookingRow = {
  id: string;
  crew_name: string | null;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  tier_interest: string | null;
  status: string | null;
  conversion_value_cents: number | null;
  created_at: string;
};

export default async function WarRoomCustomersPage() {
  let bookings: DemoBookingRow[] = [];
  let error: string | null = null;
  try {
    const sb = supabaseAdmin();
    const { data, error: e } = await sb
      .from("demo_requests")
      .select(
        "id, crew_name, owner_name, email, phone, tier_interest, status, conversion_value_cents, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(80);
    if (e) throw e;
    bookings = (data ?? []) as DemoBookingRow[];
  } catch (err) {
    error = err instanceof Error ? err.message : "supabase_offline";
  }

  const total = bookings.length;
  const won = bookings.filter((b) => b.status === "won").length;
  const pipelineCents = bookings.reduce(
    (s, b) => s + (b.conversion_value_cents ?? 0),
    0,
  );

  const columns: Column<DemoBookingRow>[] = [
    { key: "crew", header: "Crew", cell: (r) => r.crew_name ?? "—" },
    { key: "owner", header: "Owner", cell: (r) => r.owner_name ?? "—", className: "text-g-text-muted" },
    {
      key: "tier",
      header: "Tier",
      cell: (r) => r.tier_interest ?? "—",
      align: "center",
    },
    { key: "status", header: "Status", cell: (r) => r.status ?? "—", align: "center" },
    {
      key: "value",
      header: "Pipeline",
      cell: (r) => money(r.conversion_value_cents ?? 0),
      mono: true,
      align: "right",
    },
    {
      key: "ts",
      header: "Booked",
      cell: (r) => relTime(r.created_at),
      mono: true,
      align: "right",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Customers"
        title="Customers"
        subtitle="Real Gladius demo bookings — your actual sales pipeline. Demo CRM uses seeded Cypress Lawn customers; this view is your real signups."
        actions={
          <Link
            href="/founders/war-room/demo-pipeline"
            prefetch
            className="inline-flex items-center gap-1.5 text-[12px] text-g-accent hover:underline"
          >
            Open full pipeline editor
            <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Total bookings" value={String(total)} delta={total ? "all time" : "—"} trend={total ? "up" : "flat"} />
        <KPICard label="Won" value={String(won)} delta={won > 0 ? "+1 this month" : "—"} trend={won > 0 ? "up" : "flat"} />
        <KPICard label="Pipeline" value={money(pipelineCents)} delta={total ? "all time" : "—"} trend={pipelineCents > 0 ? "up" : "flat"} />
        <KPICard label="This week" value={String(bookings.filter((b) => Date.now() - new Date(b.created_at).getTime() < 7 * 86400_000).length)} delta="last 7 days" trend="up" />
      </section>

      {error ? (
        <EmptyState
          icon={Database}
          title="Supabase unreachable"
          body="The War Room shell is live, but the demo_requests query failed. Check NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in Vercel."
        />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Database}
          title="First booking will appear here"
          body="When a prospect submits the form at /demo, it lands in the demo_requests table and shows up here within seconds."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={bookings}
          rowKey={(r) => r.id}
        />
      )}
    </div>
  );
}
