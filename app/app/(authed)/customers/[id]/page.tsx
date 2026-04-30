import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Star,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { demoState } from "@/lib/demo/state";
import { money, relTime, shortDate } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const state = demoState();
  const customer = state.customers.find((c) => c.id === id);
  if (!customer) notFound();

  const customerJobs = state.jobs.filter((j) => j.customerId === id);
  const customerInvoices = state.invoices.filter((i) => i.customerId === id);
  const customerMessages = state.messages.filter((m) => m.customerId === id);
  const completedJobs = customerJobs.filter((j) => j.status === "Complete");
  const totalRevenueCents = completedJobs.reduce((s, j) => s + j.priceCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/customers"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to customers
      </Link>

      <PageHeader
        eyebrow={customer.tier}
        title={customer.name}
        subtitle={
          <span className="inline-flex items-center gap-3 text-[12px]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {customer.address}, {customer.city} {customer.zip}
            </span>
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {customer.phone}
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {customer.email}
            </span>
            <StatusPill tone={customer.status === "Active" ? "accent" : "neutral"}>
              {customer.status}
            </StatusPill>
          </span>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="LTV"
          value={money(customer.ltvCents)}
          delta={`${customer.tier}`}
          trend="up"
        />
        <KPICard
          label="Visits · all time"
          value={String(completedJobs.length)}
          delta={`+${completedJobs.filter((j) => Date.now() - new Date(j.scheduledAt).getTime() < 30 * 86400_000).length} last 30d`}
          trend="up"
        />
        <KPICard
          label="Revenue · YTD"
          value={money(totalRevenueCents)}
          delta="+$420 vs Q1"
          trend="up"
        />
        <KPICard
          label="NPS"
          value={customer.npsScore != null ? String(customer.npsScore) : "—"}
          delta={customer.npsScore != null && customer.npsScore >= 8 ? "Promoter" : "—"}
          trend={customer.npsScore && customer.npsScore >= 8 ? "up" : "flat"}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 g-card p-5">
          <div className="flex items-baseline justify-between">
            <h2>Timeline</h2>
            <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
              Last 24 events
            </span>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {[...customerJobs, ...customerInvoices, ...customerMessages]
              .sort((a, b) => {
                const at = "scheduledAt" in a ? a.scheduledAt : "issuedAt" in a ? a.issuedAt : (a as { ts: string }).ts;
                const bt = "scheduledAt" in b ? b.scheduledAt : "issuedAt" in b ? b.issuedAt : (b as { ts: string }).ts;
                return bt.localeCompare(at);
              })
              .slice(0, 24)
              .map((e, i) => {
                const ts =
                  "scheduledAt" in e
                    ? e.scheduledAt
                    : "issuedAt" in e
                      ? e.issuedAt
                      : (e as { ts: string }).ts;
                let label = "Event";
                let detail = "";
                if ("scheduledAt" in e) {
                  label = `${e.service} · ${e.status}`;
                  detail = `${money(e.priceCents)} · crew ${e.crewId}`;
                } else if ("issuedAt" in e) {
                  label = `Invoice ${e.id} · ${e.status}`;
                  detail = `${money(e.amountCents)} · due ${shortDate(e.dueAt)}`;
                } else {
                  const m = e as { channel: string; direction: string; body: string };
                  label = `${m.channel.toUpperCase()} ${m.direction === "in" ? "from" : "to"} ${customer.name.split(" ")[0]}`;
                  detail = m.body;
                }
                return (
                  <li key={`${e.id}_${i}`} className="flex gap-3 text-[13px]">
                    <div className="h-7 w-7 shrink-0 rounded-md bg-g-surface-2 border border-g-border-subtle inline-flex items-center justify-center text-g-text-muted">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-g-text">{label}</p>
                      <p className="text-g-text-muted text-[12px] truncate">{detail}</p>
                    </div>
                    <span className="text-[11px] text-g-text-faint font-geist-mono shrink-0">
                      {relTime(ts)}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="g-card p-5">
            <div className="flex items-baseline justify-between">
              <h2>Property</h2>
              <Calendar className="h-3.5 w-3.5 text-g-text-faint" />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <dt className="text-g-text-faint">Lot size</dt>
              <dd className="text-right font-geist-mono">8,420 sqft</dd>
              <dt className="text-g-text-faint">Beds</dt>
              <dd className="text-right font-geist-mono">1,240 sqft</dd>
              <dt className="text-g-text-faint">Driveway</dt>
              <dd className="text-right font-geist-mono">580 sqft</dd>
              <dt className="text-g-text-faint">Trees</dt>
              <dd className="text-right font-geist-mono">7</dd>
              <dt className="text-g-text-faint">Route</dt>
              <dd className="text-right">{customer.routeId}</dd>
              <dt className="text-g-text-faint">Joined</dt>
              <dd className="text-right">{shortDate(customer.joinedAt)}</dd>
            </dl>
          </div>

          <div className="g-card p-5">
            <div className="flex items-baseline justify-between">
              <h2>Reviews</h2>
              <Star className="h-3.5 w-3.5 text-g-warning" />
            </div>
            {customer.npsScore != null ? (
              <p className="mt-3 text-[13px] text-g-text-muted leading-relaxed">
                &ldquo;{customer.npsScore >= 9 ? "Crew was on time and the yard looks unreal. Best service we've used in three years." : customer.npsScore >= 7 ? "Solid work, solid communication. Recommend." : "Decent. Sometimes misses the back fence line."}&rdquo;
                <br />
                <span className="text-g-text-faint text-[11px]">
                  NPS {customer.npsScore} · Google · {shortDate(customer.lastVisit)}
                </span>
              </p>
            ) : (
              <p className="mt-3 text-[12px] text-g-text-faint">
                No reviews yet. Auto-ask fires after next NPS &ge; 8 visit.
              </p>
            )}
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-g-accent hover:underline"
            >
              <MessageSquare className="h-3 w-3" />
              Send review request
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
