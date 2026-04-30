import { rng } from "@/lib/shared/prng";
import type { Customer, Invoice, InvoiceStatus } from "@/lib/shared/types";

const STATUSES: InvoiceStatus[] = [
  "Paid", "Paid", "Paid", "Paid", "Paid",
  "Sent", "Sent", "Overdue", "Draft", "Void",
];

export function buildInvoices(customers: Customer[], count = 200): Invoice[] {
  const r = rng(2028);
  const list: Invoice[] = [];
  const active = customers.filter((c) => c.status !== "Cancelled");

  for (let i = 0; i < count; i++) {
    const c = r.pick(active);
    const status = r.pick(STATUSES);
    const issuedDays = r.int(0, 120);
    const issuedAt = isoDaysAgo(issuedDays);
    const dueAt = isoDaysAgo(issuedDays - 14); // due 14 days after issue
    const paidAt =
      status === "Paid"
        ? isoDaysAgo(Math.max(0, issuedDays - r.int(2, 18)))
        : undefined;
    const amount = r.int(85, 1450) * 100;

    list.push({
      id: `inv_${i + 1}`,
      customerId: c.id,
      amountCents: amount,
      status,
      issuedAt,
      dueAt,
      paidAt,
    });
  }

  list.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  return list;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}
