import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  Droplets,
  ExternalLink,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { shortDate } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Backflow Compliance Radar · GladiusTurf",
  robots: { index: false, follow: false },
};

const PORTAL_LABEL: Record<string, string> = {
  bsi_online: "BSI Online",
  aqua_backflow: "Aqua Backflow",
  jea: "JEA",
  sarasota_county: "Sarasota County",
  pinellas: "Pinellas County",
  hillsborough: "Hillsborough County",
  orange_ouc: "Orange County (OUC)",
  miami_dade_wasd: "Miami-Dade WASD",
  gru: "Gainesville Regional",
  tampa_bay_water: "Tampa Bay Water",
  fort_lauderdale: "Fort Lauderdale",
  davie: "Davie",
  boca_raton: "Boca Raton",
  hollywood: "Hollywood",
  dania_beach: "Dania Beach",
  palm_springs: "Palm Springs",
  manual: "Manual filing",
};

type DbAssembly = {
  id: string;
  customer_id: string | null;
  external_id: string | null;
  assembly_type: string | null;
  size_inches: string | null;
  utility: string | null;
  utility_portal: string | null;
  in_service_status: string;
  fixed_test_due_date: string | null;
  customers: { display_name: string } | { display_name: string }[] | null;
};

/**
 * Backflow Compliance Radar — irrigation vertical's #2 ship per
 * Product + Strategy boards (vertical #2 was the unanimous "ship this
 * before any other vertical" call). Mirrors Storm Mode's role for
 * lighting: a regulated-event-driven automation surface.
 *
 * Florida backflow assemblies require annual or semi-annual testing
 * filed with the local utility. Late tests trigger fines + service
 * shut-off. The Radar surfaces:
 *   - Total assemblies on file
 *   - Overdue tests (fixed_test_due_date < today)
 *   - Tests due in 30 days
 *   - Tests due in 90 days
 * + a triage list keyed to the appropriate utility portal so the
 * crew can file in 2 taps.
 *
 * v2 wires per-utility autosubmit (BSI Online + JEA + Sarasota County
 * already have public form endpoints). This page is the dashboard +
 * triage; auto-submit is its own engine behind canSend()-style
 * "this would file" preview.
 */

export default async function BackflowRadarPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  // Vertical gate: irrigation only. Other verticals see a graceful
  // explainer, not a 404 (the operator might be checking the surface
  // before adding an irrigation-vertical sub-tenant).
  if (session.tenant.vertical !== "irrigation") {
    return (
      <TenantEmptyState
        engine="Backflow Compliance Radar"
        tenant={session.tenant}
        icon={Droplets}
        body={`Backflow Compliance Radar is the irrigation vertical's regulated-event surface — like Storm Mode for lighting. Your workspace is set to ${session.tenant.vertical}; switch verticals or add an irrigation tenant to see it activate.`}
      />
    );
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("irrigation_backflow_assemblies")
    .select(
      "id, customer_id, external_id, assembly_type, size_inches, utility, utility_portal, in_service_status, fixed_test_due_date, customers!inner(display_name)",
    )
    .eq("tenant_id", session.tenant.id)
    .eq("in_service_status", "in_service")
    .order("fixed_test_due_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.warn("backflow-radar query error", error);
  }
  const rows = (data ?? []) as unknown as DbAssembly[];

  if (rows.length === 0) {
    return (
      <TenantEmptyState
        engine="Backflow Compliance Radar"
        tenant={session.tenant}
        icon={Droplets}
        body="Add backflow assemblies under each customer to start the radar — model + serial + utility + last-test date + due date. Once you have 5+ on file, the dashboard surfaces overdue + due-soon at a glance and routes filings through the right utility portal (BSI Online, JEA, Sarasota County, etc.)."
      />
    );
  }

  const today = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const thirtyDays = 30 * day;
  const ninetyDays = 90 * day;

  let overdue = 0;
  let dueIn30 = 0;
  let dueIn90 = 0;
  for (const r of rows) {
    if (!r.fixed_test_due_date) continue;
    const due = new Date(r.fixed_test_due_date).getTime();
    const diff = due - today;
    if (diff < 0) overdue += 1;
    else if (diff <= thirtyDays) dueIn30 += 1;
    else if (diff <= ninetyDays) dueIn90 += 1;
  }

  const triageRows = rows
    .filter((r) => r.fixed_test_due_date != null)
    .slice(0, 25);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Compliance`}
        title="Backflow Compliance Radar"
        subtitle="Florida backflow assemblies need annual filings with the utility. Miss the date and the customer gets shut off. The radar surfaces what's overdue + what's about to fail, routed to the right portal."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Total assemblies"
          value={String(rows.length)}
          delta={`${rows.length} in service`}
          trend={rows.length > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Overdue"
          value={String(overdue)}
          delta={overdue > 0 ? "file today" : "all clear"}
          trend={overdue > 0 ? "down" : "flat"}
        />
        <KPICard
          label="Due in 30d"
          value={String(dueIn30)}
          delta={dueIn30 > 0 ? "schedule now" : "none soon"}
          trend={dueIn30 > 0 ? "down" : "flat"}
        />
        <KPICard
          label="Due in 90d"
          value={String(dueIn90)}
          delta={dueIn90 > 0 ? "plan ahead" : "none soon"}
          trend="flat"
        />
      </section>

      <section className="g-card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-g-accent" />
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Triage — earliest due date first
            </span>
          </div>
          <span className="text-[11px] font-geist-mono text-g-text-faint">
            {triageRows.length} of {rows.length}
          </span>
        </header>
        {triageRows.length === 0 ? (
          <div className="text-center py-10 text-g-text-muted text-[13px]">
            No assemblies have a due date set yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-g-border-subtle">
                  <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Assembly
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Utility / portal
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Test due
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {triageRows.map((r) => {
                  const cust = Array.isArray(r.customers) ? r.customers[0] : r.customers;
                  const due = r.fixed_test_due_date
                    ? new Date(r.fixed_test_due_date).getTime()
                    : null;
                  const diff = due != null ? due - today : null;
                  const tone =
                    diff == null
                      ? "text-g-text-muted"
                      : diff < 0
                        ? "text-g-danger font-medium"
                        : diff <= thirtyDays
                          ? "text-g-warning"
                          : "text-g-text";
                  const status =
                    diff == null
                      ? "—"
                      : diff < 0
                        ? `${Math.abs(Math.floor(diff / day))}d overdue`
                        : diff <= thirtyDays
                          ? `${Math.floor(diff / day)}d`
                          : diff <= ninetyDays
                            ? `${Math.floor(diff / day)}d`
                            : `${Math.floor(diff / day)}d`;
                  return (
                    <tr key={r.id} className="border-b border-g-border-subtle last:border-b-0">
                      <td className="px-4 py-2.5">
                        {r.customer_id ? (
                          <Link
                            href={`/app/customers/${r.customer_id}`}
                            prefetch
                            className="text-g-text hover:text-g-accent"
                          >
                            {cust?.display_name ?? "—"}
                          </Link>
                        ) : (
                          <span className="text-g-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-g-text-muted">
                        {r.assembly_type ?? "—"}
                        {r.size_inches ? ` · ${r.size_inches}"` : ""}
                        {r.external_id ? (
                          <span className="ml-2 font-geist-mono text-[11px] text-g-text-faint">
                            #{r.external_id}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2.5 text-g-text-muted">
                        {r.utility ?? "—"}
                        {r.utility_portal && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-g-surface-2 px-2 py-0.5 text-[10px] text-g-text">
                            <ExternalLink className="h-2.5 w-2.5" />
                            {PORTAL_LABEL[r.utility_portal] ?? r.utility_portal}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-geist-mono tabular-nums text-g-text-muted">
                        {r.fixed_test_due_date ? shortDate(r.fixed_test_due_date) : "—"}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-geist-mono tabular-nums ${tone}`}>
                        {status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="g-card flex items-start gap-3 p-4">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-g-accent-faint text-g-accent">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="text-[13px] text-g-text-muted">
          <strong className="text-g-text">Auto-submit ships next.</strong>{" "}
          Today the radar tells you what&apos;s due and where to file.
          v2 wires direct submission to BSI Online, JEA, Sarasota County,
          and the rest of the supported portals — preview-then-confirm
          gated by the same canSend()-style guardrail we use for
          customer messaging. ETA ships behind the irrigation tenant&apos;s
          first 30 days of usage so the autosubmit logic is grounded in
          real workflow data.
        </div>
      </section>

      <section className="flex items-center justify-between gap-2 text-[11px] text-g-text-faint">
        <span className="inline-flex items-center gap-1.5">
          <Gauge className="h-3 w-3" />
          Reads from <code className="font-geist-mono">irrigation_backflow_assemblies</code>{" "}
          for tenants where vertical = irrigation. Other verticals see a
          graceful explainer.
        </span>
        <span className="inline-flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Compliance liability: missed filings can trigger utility
          shut-off + fines.
        </span>
      </section>
    </div>
  );
}
