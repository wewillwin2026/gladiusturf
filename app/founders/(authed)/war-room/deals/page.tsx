import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { supabaseAdmin } from "@/lib/supabase";
import { relTime } from "@/lib/shared/format";
import { cn } from "@/lib/cn";
import { getStripeMode } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Deals · GladiusTurf",
  robots: { index: false, follow: false },
};

type DealRow = {
  id: string;
  token: string;
  status: string;
  prospect_email: string;
  prospect_company: string;
  tier: string;
  custom_price_cents: number;
  addon_bdc: boolean;
  founder_owner_email: string;
  created_at: string;
  paid_at: string | null;
  signed_at: string | null;
  activated_at: string | null;
};

const STATUS_TONE: Record<string, string> = {
  draft: "border-g-border bg-g-surface text-g-text-muted",
  sent: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  paying: "border-blue-400/40 bg-blue-400/10 text-blue-300",
  paid: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  awaiting_signature: "border-indigo-400/40 bg-indigo-400/10 text-indigo-300",
  signed: "border-indigo-400/40 bg-indigo-400/10 text-indigo-300",
  provisioning: "border-g-accent/40 bg-g-accent-faint/40 text-g-accent",
  active: "border-g-accent/60 bg-g-accent-faint text-g-accent",
  refunded: "border-g-text-faint/40 bg-g-surface-2 text-g-text-faint line-through",
  voided: "border-g-text-faint/40 bg-g-surface-2 text-g-text-faint line-through",
};

export default async function DealsListPage() {
  const sb = supabaseAdmin();
  const stripeMode = getStripeMode();

  let deals: DealRow[] = [];
  let error: string | null = null;
  try {
    const { data, error: e } = await sb
      .from("deals")
      .select(
        "id, token, status, prospect_email, prospect_company, tier, custom_price_cents, addon_bdc, founder_owner_email, created_at, paid_at, signed_at, activated_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (e) throw e;
    deals = (data ?? []) as DealRow[];
  } catch (err) {
    error = err instanceof Error ? err.message : "supabase_offline";
  }

  const counts = deals.reduce(
    (acc, d) => {
      acc.total += 1;
      if (d.status === "paid" || d.status === "signed" || d.status === "active") acc.paid += 1;
      if (d.status === "active") acc.active += 1;
      if (d.status === "draft" || d.status === "sent") acc.open += 1;
      return acc;
    },
    { total: 0, paid: 0, active: 0, open: 0 },
  );

  const lifetimeRevenueCents = deals
    .filter((d) => d.paid_at != null)
    .reduce((s, d) => s + d.custom_price_cents + (d.addon_bdc ? 49900 : 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Pipeline"
        title="Deals"
        subtitle="Close-during-demo pipeline. New deal → share /close/[token] mid-demo → paid → signed → active tenant."
        actions={
          <Link
            href="/founders/war-room/deals/new"
            prefetch
            className="inline-flex items-center gap-1.5 rounded-md bg-g-accent px-3 py-1.5 text-[12px] font-medium text-black hover:bg-g-accent-hover"
          >
            <Plus className="h-3 w-3" />
            New deal
          </Link>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard
          label="Total deals"
          value={String(counts.total)}
          delta="all time"
          trend={counts.total > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Open (draft + sent)"
          value={String(counts.open)}
          delta={counts.open > 0 ? "in flight" : "—"}
          trend="flat"
        />
        <KPICard
          label="Paid"
          value={String(counts.paid)}
          delta="incl. signed + active"
          trend={counts.paid > 0 ? "up" : "flat"}
        />
        <KPICard
          label="MRR booked"
          value={`$${(lifetimeRevenueCents / 100).toLocaleString()}`}
          delta="paid total"
          trend={lifetimeRevenueCents > 0 ? "up" : "flat"}
        />
      </section>

      {stripeMode === "unset" && (
        <section className="rounded-md border border-g-danger/40 bg-g-danger/10 p-3 text-[12px] text-g-danger">
          STRIPE_SECRET_KEY is not set. Deals can be created but the
          /close/[token] payment step will fail until Stripe env is wired.
        </section>
      )}

      {error ? (
        <EmptyState
          icon={Briefcase}
          title="Couldn't load deals"
          body="Migration 20260510_a_deals.sql may not be applied yet. Check Supabase."
        />
      ) : deals.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No deals yet"
          body="Hit New deal during a demo — system generates a /close/[token] URL you paste into screen-share."
        />
      ) : (
        <section className="g-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-g-border-subtle text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Company</th>
                  <th className="px-4 py-3 text-left font-medium">Tier</th>
                  <th className="px-4 py-3 text-right font-medium">Monthly</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Owner</th>
                  <th className="px-4 py-3 text-right font-medium">Age</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => {
                  const monthly = (d.custom_price_cents + (d.addon_bdc ? 49900 : 0)) / 100;
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-g-border-subtle/40 last:border-b-0 hover:bg-g-surface-2"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/founders/war-room/deals/${d.id}`}
                          prefetch
                          className="text-g-text hover:text-g-accent"
                        >
                          {d.prospect_company}
                        </Link>
                        <p className="text-[11px] text-g-text-faint">
                          {d.prospect_email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-g-text-muted capitalize">
                        {d.tier}
                        {d.addon_bdc && (
                          <span className="ml-1 text-[10px] text-g-accent">
                            +BDC
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-geist-mono tabular-nums text-g-text-muted">
                        ${monthly.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
                            STATUS_TONE[d.status] ?? STATUS_TONE.draft,
                          )}
                        >
                          {d.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-g-text-faint">
                        {d.founder_owner_email.split("@")[0]}
                      </td>
                      <td className="px-4 py-3 text-right font-geist-mono text-[11px] text-g-text-faint">
                        {relTime(d.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
