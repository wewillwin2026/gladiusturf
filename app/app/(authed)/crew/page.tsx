import { Building2, Mail, Phone, Plus, UserCog } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { CrewBrowser } from "@/components/app/CrewBrowser";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { money } from "@/lib/shared/format";
import { NewCrewMemberForm } from "./_components/NewCrewMemberForm";

export const dynamic = "force-dynamic";

type CrewMemberRow = {
  id: string;
  display_name: string;
  role: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  hourly_rate_cents: number | null;
  hire_date: string | null;
  active: boolean;
};

const ROLE_TONE: Record<string, Tone> = {
  owner: "accent",
  chief: "info",
  crew: "neutral",
  admin: "warning",
  apprentice: "neutral",
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  chief: "Crew chief",
  crew: "Crew",
  admin: "Admin",
  apprentice: "Apprentice",
};

export default async function Page() {
  const session = await readAppSession();

  if (session.kind !== "tenant") {
    return <CrewBrowser product="demo" />;
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("crew_members")
    .select(
      "id, display_name, role, title, email, phone, hourly_rate_cents, hire_date, active",
    )
    .eq("tenant_id", session.tenant.id)
    .order("active", { ascending: false })
    .order("display_name", { ascending: true });

  if (error) {
    console.warn("crew query failed", error);
  }
  const rows = (data ?? []) as unknown as CrewMemberRow[];
  const active = rows.filter((r) => r.active);

  const totalActive = active.length;
  const totalChiefs = active.filter((r) => r.role === "chief").length;
  const averageRate =
    active.filter((r) => r.hourly_rate_cents != null).length === 0
      ? null
      : Math.round(
          active.reduce((s, r) => s + (r.hourly_rate_cents ?? 0), 0) /
            active.filter((r) => r.hourly_rate_cents != null).length,
        );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Crew`}
        title="Crew"
        subtitle={
          totalActive === 0
            ? "Add your first crew member to start tracking hours, scheduling, and per-tech production."
            : `${totalActive} active · ${totalChiefs} crew chief${totalChiefs === 1 ? "" : "s"}. Hours roll up into Timesheets.`
        }
        actions={
          <Link href="/app/crew/new" prefetch>
            <Button variant="primary">
              <Plus className="h-3.5 w-3.5" />
              Add crew member
            </Button>
          </Link>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Active members" value={String(totalActive)} />
        <KPICard label="Crew chiefs" value={String(totalChiefs)} />
        <KPICard
          label="Avg hourly rate"
          value={averageRate == null ? "—" : money(averageRate)}
        />
        <KPICard label="Total roster" value={String(rows.length)} />
      </section>

      <NewCrewMemberForm />

      <section className="g-card overflow-hidden">
        <header className="border-b border-g-border-subtle px-5 py-3">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Roster
          </h2>
        </header>
        {rows.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Building2 className="mx-auto h-6 w-6 text-g-text-faint" />
            <p className="mt-2 text-[13px] text-g-text-muted">
              No crew members yet. Use the form above to add one.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-g-border-subtle">
            {rows.map((m) => (
              <li
                key={m.id}
                className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-g-text">
                      {m.display_name}
                    </span>
                    <StatusPill tone={ROLE_TONE[m.role] ?? "neutral"}>
                      <UserCog className="h-3 w-3" />
                      {ROLE_LABEL[m.role] ?? m.role}
                    </StatusPill>
                    {!m.active && (
                      <StatusPill tone="neutral">Inactive</StatusPill>
                    )}
                  </div>
                  {m.title && (
                    <div className="mt-0.5 text-[11px] text-g-text-muted">
                      {m.title}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-g-text-muted">
                  {m.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {m.email}
                    </span>
                  )}
                  {m.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {m.phone}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[12px] text-g-text">
                  {m.hourly_rate_cents == null
                    ? "—"
                    : `${money(m.hourly_rate_cents)}/hr`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
