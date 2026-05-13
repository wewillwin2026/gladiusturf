import Link from "next/link";
import { Timer } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { TimesheetsBrowser } from "@/components/app/TimesheetsBrowser";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { money } from "@/lib/shared/format";
import { ClockInButton, ClockOutButton } from "./_components/ClockButton";

export const dynamic = "force-dynamic";

type CrewMemberRow = {
  id: string;
  display_name: string;
  role: string;
  active: boolean;
  hourly_rate_cents: number | null;
};

type EntryRow = {
  id: string;
  crew_member_id: string;
  schedule_item_id: string | null;
  status: string;
  started_at: string;
  ended_at: string | null;
  total_minutes: number | null;
  pay_cents: number | null;
  crew_members: { display_name: string } | { display_name: string }[] | null;
};

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function minutesToHHMM(m: number | null): string {
  if (m == null) return "—";
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm.toString().padStart(2, "0")}m`;
}

export default async function Page() {
  const session = await readAppSession();

  if (session.kind !== "tenant") {
    return <TimesheetsBrowser product="demo" />;
  }

  const sb = supabaseAdmin();

  const weekStart = new Date();
  weekStart.setUTCHours(0, 0, 0, 0);
  const dow = weekStart.getUTCDay(); // 0=Sun
  weekStart.setUTCDate(weekStart.getUTCDate() - ((dow + 6) % 7)); // Mon

  const [membersRes, openRes, weekRes] = await Promise.all([
    sb
      .from("crew_members")
      .select("id, display_name, role, active, hourly_rate_cents")
      .eq("tenant_id", session.tenant.id)
      .eq("active", true)
      .order("display_name", { ascending: true }),
    sb
      .from("timesheet_entries")
      .select(
        "id, crew_member_id, schedule_item_id, status, started_at, ended_at, total_minutes, pay_cents, crew_members(display_name)",
      )
      .eq("tenant_id", session.tenant.id)
      .eq("status", "open")
      .order("started_at", { ascending: true }),
    sb
      .from("timesheet_entries")
      .select(
        "id, crew_member_id, schedule_item_id, status, started_at, ended_at, total_minutes, pay_cents, crew_members(display_name)",
      )
      .eq("tenant_id", session.tenant.id)
      .gte("started_at", weekStart.toISOString())
      .order("started_at", { ascending: false })
      .limit(200),
  ]);

  const members = (membersRes.data ?? []) as unknown as CrewMemberRow[];
  const openEntries = (openRes.data ?? []) as unknown as EntryRow[];
  const weekEntries = (weekRes.data ?? []) as unknown as EntryRow[];

  if (members.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow={`${session.tenant.display_name} · Timesheets`}
          title="Timesheets"
          subtitle="Add crew members first, then they (or you) can clock in from this page."
        />
        <div className="g-card flex flex-col items-center gap-3 p-8 text-center">
          <Timer className="h-6 w-6 text-g-text-faint" />
          <p className="text-[13px] text-g-text-muted">
            No crew yet. Head to{" "}
            <Link
              href="/app/crew"
              className="text-g-accent hover:underline"
            >
              /app/crew
            </Link>{" "}
            to add your first member.
          </p>
        </div>
      </div>
    );
  }

  const openByMember = new Map<string, EntryRow>();
  for (const e of openEntries) {
    openByMember.set(e.crew_member_id, e);
  }

  // Week rollup
  const totalWeekMinutes = weekEntries
    .filter((e) => e.status === "closed")
    .reduce((s, e) => s + (e.total_minutes ?? 0), 0);
  const totalWeekPay = weekEntries
    .filter((e) => e.status === "closed")
    .reduce((s, e) => s + (e.pay_cents ?? 0), 0);

  // Per-member week minutes
  const perMember = new Map<string, number>();
  for (const e of weekEntries) {
    if (e.status !== "closed") continue;
    perMember.set(
      e.crew_member_id,
      (perMember.get(e.crew_member_id) ?? 0) + (e.total_minutes ?? 0),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Timesheets`}
        title="Timesheets"
        subtitle={`Week of ${fmtDate(weekStart.toISOString())}. ${openEntries.length} on the clock · ${members.length} active crew.`}
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="On the clock"
          value={String(openEntries.length)}
          delta={openEntries.length === 0 ? "No one clocked in" : "Live"}
        />
        <KPICard
          label="Week hours"
          value={minutesToHHMM(totalWeekMinutes)}
          delta={`${weekEntries.filter((e) => e.status === "closed").length} closed entries`}
        />
        <KPICard label="Week labor cost" value={money(totalWeekPay)} />
        <KPICard label="Active crew" value={String(members.length)} />
      </section>

      <section className="g-card overflow-hidden">
        <header className="border-b border-g-border-subtle px-5 py-3">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Clock board · today
          </h2>
        </header>
        <ul className="divide-y divide-g-border-subtle">
          {members.map((m) => {
            const open = openByMember.get(m.id);
            const wkMin = perMember.get(m.id) ?? 0;
            return (
              <li
                key={m.id}
                className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-g-text">
                      {m.display_name}
                    </span>
                    {open ? (
                      <StatusPill tone="success">
                        On clock since {fmtTime(open.started_at)}
                      </StatusPill>
                    ) : (
                      <StatusPill tone="neutral">Off</StatusPill>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-g-text-muted">
                    Week so far: {minutesToHHMM(wkMin)}
                  </div>
                </div>
                <span className="text-[11px] text-g-text-faint">
                  {m.hourly_rate_cents == null
                    ? ""
                    : `${money(m.hourly_rate_cents)}/hr`}
                </span>
                <span />
                {open ? (
                  <ClockOutButton entryId={open.id} />
                ) : (
                  <ClockInButton crewMemberId={m.id} />
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {weekEntries.length > 0 && (
        <section className="g-card overflow-hidden">
          <header className="border-b border-g-border-subtle px-5 py-3">
            <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
              This week&rsquo;s entries · {weekEntries.length}
            </h2>
          </header>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                <th className="px-5 py-3 font-semibold">Member</th>
                <th className="px-5 py-3 font-semibold">Started</th>
                <th className="px-5 py-3 font-semibold">Ended</th>
                <th className="px-5 py-3 font-semibold">Hours</th>
                <th className="px-5 py-3 font-semibold text-right">Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-g-border-subtle">
              {weekEntries.map((e) => {
                const cm = Array.isArray(e.crew_members)
                  ? e.crew_members[0]
                  : e.crew_members;
                return (
                  <tr key={e.id}>
                    <td className="px-5 py-2 text-g-text">
                      {cm?.display_name ?? "—"}
                    </td>
                    <td className="px-5 py-2 text-g-text-muted">
                      {fmtDate(e.started_at)} {fmtTime(e.started_at)}
                    </td>
                    <td className="px-5 py-2 text-g-text-muted">
                      {e.ended_at ? fmtTime(e.ended_at) : (
                        <StatusPill tone="success">Open</StatusPill>
                      )}
                    </td>
                    <td className="px-5 py-2 font-mono tabular-nums text-g-text">
                      {minutesToHHMM(e.total_minutes)}
                    </td>
                    <td className="px-5 py-2 text-right font-mono tabular-nums text-g-text">
                      {e.pay_cents == null ? "—" : money(e.pay_cents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
