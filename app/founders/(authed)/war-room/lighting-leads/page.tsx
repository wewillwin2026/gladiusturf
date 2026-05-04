import { Database, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { supabaseAdmin } from "@/lib/supabase";
import { relTime } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

type LightingLead = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  business_name: string | null;
  service_area: string | null;
  crew_size: string | null;
  qualifying: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  source_page: string | null;
  created_at: string;
};

export default async function LightingLeadsPage() {
  let leads: LightingLead[] = [];
  let error: string | null = null;
  try {
    const sb = supabaseAdmin();
    const { data, error: e } = await sb
      .from("lighting_leads")
      .select(
        "id, full_name, email, phone, business_name, service_area, crew_size, qualifying, utm_source, utm_campaign, source_page, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (e) throw e;
    leads = (data ?? []) as LightingLead[];
  } catch (err) {
    error = err instanceof Error ? err.message : "supabase_offline";
  }

  const total = leads.length;
  const week = leads.filter(
    (l) => Date.now() - new Date(l.created_at).getTime() < 7 * 86400_000,
  ).length;
  const today = leads.filter((l) => isToday(l.created_at)).length;
  const withQualifying = leads.filter((l) => (l.qualifying ?? "").trim() !== "").length;

  const columns: Column<LightingLead>[] = [
    {
      key: "business",
      header: "Business",
      cell: (r) => r.business_name ?? "—",
    },
    {
      key: "name",
      header: "Contact",
      cell: (r) => (
        <span>
          <span className="text-g-text">{r.full_name ?? "—"}</span>
          <span className="text-g-text-faint"> · {r.email ?? "—"}</span>
        </span>
      ),
      className: "text-g-text-muted",
    },
    {
      key: "area",
      header: "Service area",
      cell: (r) => r.service_area ?? "—",
      className: "text-g-text-muted",
    },
    {
      key: "crew",
      header: "Crew",
      cell: (r) => r.crew_size ?? "—",
      align: "center",
    },
    {
      key: "phone",
      header: "Phone",
      cell: (r) => r.phone ?? "—",
      mono: true,
      align: "right",
    },
    {
      key: "ts",
      header: "Submitted",
      cell: (r) => relTime(r.created_at),
      mono: true,
      align: "right",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Lighting Vertical"
        title="Lighting Leads"
        subtitle="Inbound leads from /lighting. Reply within 24h with three slots and the Bright Lights workspace passcode."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Total leads"
          value={String(total)}
          delta={total ? "all time" : "—"}
          trend={total ? "up" : "flat"}
        />
        <KPICard
          label="This week"
          value={String(week)}
          delta="last 7 days"
          trend={week > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Today"
          value={String(today)}
          delta={today > 0 ? "fresh" : "—"}
          trend={today > 0 ? "up" : "flat"}
        />
        <KPICard
          label="With qualifying note"
          value={String(withQualifying)}
          delta={total ? `${Math.round((withQualifying / total) * 100)}% engagement` : "—"}
          trend={withQualifying > 0 ? "up" : "flat"}
        />
      </section>

      {error ? (
        <EmptyState
          icon={Database}
          title="Supabase unreachable"
          body="Couldn't load lighting_leads. Check NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in Vercel."
        />
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="First lighting lead will appear here"
          body="When a prospect submits the form at /lighting, the row lands in lighting_leads and shows up here within seconds. Founders also get an email alert via Resend."
        />
      ) : (
        <>
          <DataTable columns={columns} rows={leads} rowKey={(r) => r.id} />

          {/* Qualifying-question column is too long for the table; render the
              ones that have content as a separate stack underneath. This is
              the conversation fuel for the demo call (per /lighting spec §4.7). */}
          {leads.some((l) => (l.qualifying ?? "").trim() !== "") && (
            <section className="flex flex-col gap-3">
              <h2 className="text-[12px] uppercase tracking-[0.18em] text-g-text-faint">
                Qualifying answers
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {leads
                  .filter((l) => (l.qualifying ?? "").trim() !== "")
                  .map((l) => (
                    <article
                      key={l.id}
                      className="rounded-lg border border-g-border bg-g-surface p-4"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[13px] font-medium text-g-text">
                          {l.business_name ?? "—"}
                        </p>
                        <p className="font-geist-mono text-[10px] text-g-text-faint">
                          {relTime(l.created_at)}
                        </p>
                      </div>
                      <p className="mt-2 text-[14px] leading-[1.55] text-g-text-muted">
                        “{l.qualifying}”
                      </p>
                      <p className="mt-3 text-[11px] text-g-text-faint">
                        {l.full_name ?? "—"} · {l.email ?? "—"}
                      </p>
                    </article>
                  ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
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
