import Link from "next/link";
import { CircleAlert, Receipt } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { InvoicesBrowser } from "@/components/app/InvoicesBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { demoState } from "@/lib/demo/state";
import { money } from "@/lib/shared/format";
import { MarkPaidButton } from "./_components/MarkPaidButton";

export const dynamic = "force-dynamic";

type ProposalRow = {
  id: string;
  customer_id: string | null;
  status: string;
  total_cents: number | null;
  sent_at: string | null;
  sold_at: string | null;
  installed_at: string | null;
  language: string | null;
  customers: { display_name: string } | { display_name: string }[] | null;
};

const STATUS_TONE: Record<string, Tone> = {
  sent: "info",
  viewed: "info",
  sold: "success",
  installed: "success",
  walked: "warning",
  lost: "neutral",
  draft: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  sent: "Sent",
  viewed: "Viewed",
  sold: "Paid",
  installed: "Installed",
  walked: "Walked",
  lost: "Lost",
  draft: "Draft",
};

function daysBetween(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / (24 * 60 * 60 * 1000));
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default async function InvoicesPage() {
  const session = await readAppSession();

  if (session.kind !== "tenant") {
    // Demo path — unchanged (Cypress Lawn seeded fixture invoices).
    const state = demoState();
    const overdue = state.invoices.filter((i) => i.status === "Overdue");
    const ar30 = overdue.reduce((s, i) => s + i.amountCents, 0);
    const sent = state.invoices.filter((i) => i.status === "Sent");
    const arOpen = sent.reduce((s, i) => s + i.amountCents, 0);
    const paidThisMonth = state.invoices
      .filter(
        (i) =>
          i.status === "Paid" &&
          i.paidAt &&
          new Date(i.paidAt).getMonth() === new Date().getMonth(),
      )
      .reduce((s, i) => s + i.amountCents, 0);
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Cypress Lawn"
          title="Invoices"
          subtitle="AR aging, status tabs, one-click reminders. Click any invoice for the full timeline."
        />
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            label="Paid · this month"
            value={money(paidThisMonth)}
            delta="+18.2%"
            trend="up"
          />
          <KPICard label="Outstanding" value={money(arOpen)} delta={`${sent.length} sent`} trend="flat" />
          <KPICard
            label="AR · 30+ days"
            value={money(ar30)}
            delta={`${overdue.length} overdue`}
            trend="down"
          />
          <KPICard label="Days to pay" value="8.4" delta="−1.2 days" trend="down" />
        </section>
        <InvoicesBrowser invoices={state.invoices} customers={state.customers} />
      </div>
    );
  }

  // Tenant path — real proposals as canonical invoices.
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("proposals")
    .select(
      "id, customer_id, status, total_cents, sent_at, sold_at, installed_at, language, customers(display_name)",
    )
    .eq("tenant_id", session.tenant.id)
    .in("status", ["sent", "viewed", "sold", "installed", "walked", "lost"])
    .order("sent_at", { ascending: false, nullsFirst: false })
    .limit(200);

  if (error) {
    console.warn("invoices query error", error);
  }
  const rows = (data ?? []) as unknown as ProposalRow[];

  if (rows.length === 0) {
    return (
      <TenantEmptyState
        engine="Invoices"
        tenant={session.tenant}
        icon={Receipt}
        body="Once you send a quote and the customer accepts, the invoice lands here. Paid by Stripe → status flips automatically. Paid by check → one-click Mark paid. QuickBooks Online export ships next."
      />
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let paidThisMonth = 0;
  let arOpenCents = 0;
  let ar30Cents = 0;
  let overdueCount = 0;
  let sentCount = 0;
  const paydays: number[] = []; // sent_at -> sold_at delta in days

  for (const r of rows) {
    const total = r.total_cents ?? 0;
    if (r.status === "sold" || r.status === "installed") {
      if (r.sold_at && new Date(r.sold_at) >= startOfMonth) {
        paidThisMonth += total;
      }
      if (r.sent_at && r.sold_at) {
        paydays.push(daysBetween(new Date(r.sold_at), new Date(r.sent_at)));
      }
    } else if (r.status === "sent" || r.status === "viewed") {
      sentCount++;
      arOpenCents += total;
      if (r.sent_at && daysBetween(now, new Date(r.sent_at)) >= 30) {
        overdueCount++;
        ar30Cents += total;
      }
    }
  }

  const medianDaysToPay =
    paydays.length === 0
      ? null
      : paydays.sort((a, b) => a - b)[Math.floor(paydays.length / 2)];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Invoices`}
        title="Invoices"
        subtitle="Sent + paid quotes. Stripe payments flip status automatically; check payments use Mark paid."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Paid this month"
          value={money(paidThisMonth)}
        />
        <KPICard
          label="Outstanding"
          value={money(arOpenCents)}
          delta={`${sentCount} sent / viewed`}
        />
        <KPICard
          label="AR · 30+ days"
          value={money(ar30Cents)}
          delta={`${overdueCount} overdue`}
        />
        <KPICard
          label="Days to pay (median)"
          value={medianDaysToPay == null ? "—" : `${medianDaysToPay}d`}
        />
      </section>

      <section className="g-card overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-g-border-subtle px-5 py-3">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            All invoices · {rows.length}
          </h2>
          <span className="text-[11px] text-g-text-faint">
            Most recent first
          </span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Sent</th>
                <th className="px-5 py-3 font-semibold">Paid</th>
                <th className="px-5 py-3 font-semibold text-right">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-g-border-subtle">
              {rows.map((r) => {
                const cust = Array.isArray(r.customers) ? r.customers[0] : r.customers;
                const overdue =
                  (r.status === "sent" || r.status === "viewed") &&
                  r.sent_at != null &&
                  daysBetween(now, new Date(r.sent_at)) >= 30;
                const tone: Tone = overdue
                  ? "danger"
                  : STATUS_TONE[r.status] ?? "neutral";
                const label = overdue ? "Overdue" : STATUS_LABEL[r.status] ?? r.status;
                const showMarkPaid =
                  r.status === "sent" || r.status === "viewed";
                return (
                  <tr key={r.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-g-text">
                          {cust?.display_name || "—"}
                        </span>
                        {r.language === "es" && (
                          <StatusPill tone="neutral" title="Spanish-language quote">
                            ES
                          </StatusPill>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill tone={tone}>
                        {overdue && <CircleAlert className="h-3 w-3" />}
                        {label}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-3 text-g-text-muted">
                      {fmtDate(r.sent_at)}
                    </td>
                    <td className="px-5 py-3 text-g-text-muted">
                      {fmtDate(r.sold_at)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-g-text">
                      {money(r.total_cents ?? 0)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {showMarkPaid ? (
                        <MarkPaidButton id={r.id} />
                      ) : (
                        <span className="text-[11px] text-g-text-faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="g-card p-5">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-g-accent" />
          <h3 className="text-[13px] text-g-text">
            Payment + accounting
          </h3>
        </div>
        <p className="mt-2 text-[12px] leading-[1.55] text-g-text-muted">
          Stripe webhook flips status on successful card payment automatically.
          Check or cash payments → one-click <strong className="text-g-text">Mark paid</strong>{" "}
          on the row. QuickBooks Online sync (one-way export of paid rows)
          ships in week one of the QB integrations sprint.
        </p>
        <Link
          href="/app/quotes"
          className="mt-3 inline-flex items-center gap-1 text-[12px] text-g-accent hover:underline"
        >
          See quotes (pre-invoice) →
        </Link>
      </section>
    </div>
  );
}
