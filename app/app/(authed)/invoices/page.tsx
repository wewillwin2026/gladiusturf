import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { InvoicesBrowser } from "@/components/app/InvoicesBrowser";
import { demoState } from "@/lib/demo/state";
import { money } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

export default function InvoicesPage() {
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

      <InvoicesBrowser
        invoices={state.invoices}
        customers={state.customers}
      />
    </div>
  );
}
