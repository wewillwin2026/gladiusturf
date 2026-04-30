import { rng } from "@/lib/shared/prng";
import type { ActivityEvent, Customer, Job, Invoice, Quote } from "@/lib/shared/types";

export function buildActivityFeed(args: {
  customers: Customer[];
  jobs: Job[];
  invoices: Invoice[];
  quotes: Quote[];
}): ActivityEvent[] {
  const { customers, jobs, invoices, quotes } = args;
  const r = rng(2030);
  const events: ActivityEvent[] = [];
  const now = Date.now();

  // Recent completed jobs.
  jobs
    .filter(
      (j) =>
        j.status === "Complete" &&
        new Date(j.scheduledAt).getTime() > now - 24 * 3600 * 1000,
    )
    .slice(0, 12)
    .forEach((j) => {
      const c = customers.find((x) => x.id === j.customerId);
      if (!c) return;
      events.push({
        id: `ev_${events.length + 1}`,
        ts: j.scheduledAt,
        kind: "job_completed",
        text: `${j.service} completed at ${c.name}`,
        customerId: c.id,
        amountCents: j.priceCents,
      });
    });

  // Recently paid invoices.
  invoices
    .filter((i) => i.status === "Paid" && i.paidAt)
    .slice(0, 8)
    .forEach((i) => {
      const c = customers.find((x) => x.id === i.customerId);
      if (!c) return;
      events.push({
        id: `ev_${events.length + 1}`,
        ts: i.paidAt!,
        kind: "invoice_paid",
        text: `${c.name} paid ${dollar(i.amountCents)}`,
        customerId: c.id,
        amountCents: i.amountCents,
      });
    });

  // Recently won/viewed quotes.
  quotes.slice(0, 12).forEach((q) => {
    const c = customers.find((x) => x.id === q.customerId);
    if (!c) return;
    if (q.stage === "Won" && q.closedAt) {
      events.push({
        id: `ev_${events.length + 1}`,
        ts: q.closedAt,
        kind: "quote_won",
        text: `${c.name} signed quote ${q.id} (${dollar(q.total)})`,
        customerId: c.id,
        amountCents: q.total,
      });
    } else if (q.stage === "Viewed" && q.viewedAt) {
      events.push({
        id: `ev_${events.length + 1}`,
        ts: q.viewedAt,
        kind: "quote_viewed",
        text: `${c.name} viewed quote ${q.id}`,
        customerId: c.id,
        amountCents: q.total,
      });
    } else if (q.stage === "Sent" && q.sentAt) {
      events.push({
        id: `ev_${events.length + 1}`,
        ts: q.sentAt,
        kind: "quote_sent",
        text: `Sent ${dollar(q.total)} quote to ${c.name}`,
        customerId: c.id,
        amountCents: q.total,
      });
    }
  });

  // A few sprinkled custom events.
  const reviewSamples = [
    "Earned a 5★ Google review from",
    "Earned a 5★ Nextdoor shout-out from",
    "Earned a 5★ Yelp from",
  ];
  for (let i = 0; i < 6; i++) {
    const c = customers[r.int(0, customers.length - 1)]!;
    events.push({
      id: `ev_${events.length + 1}`,
      ts: new Date(now - r.int(60, 22 * 60) * 60_000).toISOString(),
      kind: "review_received",
      text: `${r.pick(reviewSamples)} ${c.name}`,
      customerId: c.id,
    });
  }

  // Sort newest first.
  events.sort((a, b) => b.ts.localeCompare(a.ts));
  return events.slice(0, 28);
}

function dollar(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
