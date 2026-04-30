import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { InvoiceActions } from "@/components/app/InvoiceActions";
import { demoState } from "@/lib/demo/state";
import { money, shortDate } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const state = demoState();
  const invoice = state.invoices.find((i) => i.id === id);
  if (!invoice) notFound();

  const customer = state.customers.find((c) => c.id === invoice.customerId);
  if (!customer) notFound();

  const tone =
    invoice.status === "Paid"
      ? "accent"
      : invoice.status === "Sent"
        ? "info"
        : invoice.status === "Overdue"
          ? "danger"
          : invoice.status === "Void"
            ? "neutral"
            : "neutral";

  // Synthesized line items so the invoice looks real.
  const lineItems = [
    {
      desc: "Mowing · weekly maintenance",
      qty: 4,
      rate: Math.round(invoice.amountCents / 4 / 100),
    },
    {
      desc: "Edging · driveway + walks",
      qty: 4,
      rate: Math.round((invoice.amountCents / 100) * 0.05),
    },
  ];

  const events: { ts: string; label: string; icon: typeof FileText; tone: "accent" | "info" | "warning" | "neutral" }[] = [
    { ts: invoice.issuedAt, label: "Invoice generated", icon: FileText, tone: "neutral" },
  ];
  if (invoice.status !== "Draft") {
    events.push({
      ts: invoice.issuedAt,
      label: "Sent to customer · email + portal",
      icon: Send,
      tone: "info",
    });
  }
  if (invoice.status === "Overdue") {
    events.push({
      ts: invoice.dueAt,
      label: "Marked overdue · auto-reminder queued",
      icon: Mail,
      tone: "warning",
    });
  }
  if (invoice.status === "Paid" && invoice.paidAt) {
    events.push({
      ts: invoice.paidAt,
      label: "Payment received · Stripe ACH",
      icon: CreditCard,
      tone: "accent",
    });
    events.push({
      ts: invoice.paidAt,
      label: "Reconciled to QuickBooks",
      icon: CheckCircle2,
      tone: "accent",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/invoices"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to invoices
      </Link>

      <PageHeader
        eyebrow={`Invoice · ${shortDate(invoice.issuedAt)}`}
        title={`${invoice.id} · ${customer.name}`}
        subtitle={
          <span className="inline-flex items-center gap-3 text-[12px]">
            <StatusPill tone={tone}>{invoice.status}</StatusPill>
            <span className="text-g-text-muted">
              Due {shortDate(invoice.dueAt)} · {money(invoice.amountCents)}
            </span>
          </span>
        }
        actions={<InvoiceActions invoiceId={invoice.id} status={invoice.status} />}
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 g-card overflow-hidden">
          <div className="px-5 py-4 border-b border-g-border-subtle">
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-[18px] text-g-text">
                Cypress Lawn &amp; Landscape
              </span>
              <span className="text-[11px] text-g-text-faint font-geist-mono">
                {invoice.id}
              </span>
            </div>
            <p className="text-[11px] text-g-text-muted">
              Tampa, FL · {customer.address}, {customer.zip}
            </p>
          </div>

          <table className="w-full text-[13px]">
            <thead className="border-b border-g-border-subtle">
              <tr>
                <th className="px-5 py-2 text-left font-medium text-g-text-faint text-[10px] uppercase tracking-[0.14em]">
                  Description
                </th>
                <th className="px-5 py-2 text-right font-medium text-g-text-faint text-[10px] uppercase tracking-[0.14em]">
                  Qty
                </th>
                <th className="px-5 py-2 text-right font-medium text-g-text-faint text-[10px] uppercase tracking-[0.14em]">
                  Rate
                </th>
                <th className="px-5 py-2 text-right font-medium text-g-text-faint text-[10px] uppercase tracking-[0.14em]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li, i) => (
                <tr key={i} className="border-b border-g-border-subtle">
                  <td className="px-5 py-3 text-g-text">{li.desc}</td>
                  <td className="px-5 py-3 text-right font-geist-mono">{li.qty}</td>
                  <td className="px-5 py-3 text-right font-geist-mono">${li.rate}</td>
                  <td className="px-5 py-3 text-right font-geist-mono">
                    ${(li.qty * li.rate).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-5 py-3 text-right text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
                  Total due
                </td>
                <td className="px-5 py-3 text-right font-geist-mono text-[16px] text-g-accent">
                  {money(invoice.amountCents)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="g-card p-5">
          <h2>Payment timeline</h2>
          <ol className="mt-4 flex flex-col gap-3">
            {events.map((e, i) => {
              const Icon = e.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={
                      e.tone === "accent"
                        ? "h-7 w-7 rounded-full bg-g-accent text-black inline-flex items-center justify-center"
                        : e.tone === "info"
                          ? "h-7 w-7 rounded-full bg-g-info/15 text-g-info border border-g-info/30 inline-flex items-center justify-center"
                          : e.tone === "warning"
                            ? "h-7 w-7 rounded-full bg-g-warning/15 text-g-warning border border-g-warning/30 inline-flex items-center justify-center"
                            : "h-7 w-7 rounded-full bg-g-surface-2 border border-g-border-subtle text-g-text-faint inline-flex items-center justify-center"
                    }
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="flex-1">
                    <div className="text-[13px] text-g-text">{e.label}</div>
                    <div className="text-[11px] text-g-text-faint font-geist-mono">
                      {shortDate(e.ts)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
