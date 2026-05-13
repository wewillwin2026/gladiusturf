import { GitFork, Trophy } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { ReferralsBrowser } from "@/components/app/ReferralsBrowser";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { money } from "@/lib/shared/format";
import { NewReferralForm } from "./_components/NewReferralForm";
import { AdvanceButton } from "./_components/AdvanceButton";

export const dynamic = "force-dynamic";

type ReferralRow = {
  id: string;
  status: string;
  referrer_customer_id: string;
  referred_name: string | null;
  referred_phone: string | null;
  referred_email: string | null;
  reward_cents: number | null;
  reward_kind: string | null;
  notes: string | null;
  created_at: string;
  customers: { display_name: string } | { display_name: string }[] | null;
};

const STATUS_TONE: Record<string, Tone> = {
  pending: "neutral",
  contacted: "info",
  quoted: "warning",
  won: "success",
  lost: "danger",
  reward_paid: "accent",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending outreach",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  reward_paid: "Reward paid",
};

const REWARD_LABEL: Record<string, string> = {
  credit: "Account credit",
  cash: "Cash",
  gift_card: "Gift card",
  free_visit: "Free visit",
  other: "Other",
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function Page() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return <ReferralsBrowser product="demo" />;
  }

  const sb = supabaseAdmin();
  const [referralsRes, customersRes] = await Promise.all([
    sb
      .from("customer_referrals")
      .select(
        "id, status, referrer_customer_id, referred_name, referred_phone, referred_email, reward_cents, reward_kind, notes, created_at, customers!customer_referrals_referrer_customer_id_fkey(display_name)",
      )
      .eq("tenant_id", session.tenant.id)
      .order("created_at", { ascending: false })
      .limit(200),
    sb
      .from("customers")
      .select("id, display_name")
      .eq("tenant_id", session.tenant.id)
      .order("display_name", { ascending: true })
      .limit(500),
  ]);

  if (referralsRes.error) console.warn("referrals query failed", referralsRes.error);
  const rows = (referralsRes.data ?? []) as unknown as ReferralRow[];
  const customers = (customersRes.data ?? []) as unknown as {
    id: string;
    display_name: string;
  }[];

  const won = rows.filter((r) => r.status === "won" || r.status === "reward_paid");
  const pendingOutreach = rows.filter(
    (r) => r.status === "pending" || r.status === "contacted",
  );
  const rewardsOwed = rows
    .filter((r) => r.status === "won")
    .reduce((s, r) => s + (r.reward_cents ?? 0), 0);
  const rewardsPaid = rows
    .filter((r) => r.status === "reward_paid")
    .reduce((s, r) => s + (r.reward_cents ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Referrals`}
        title="Referrals"
        subtitle={
          rows.length === 0
            ? "Log who referred who and watch the flywheel. Rewards live alongside the lead so nothing is forgotten."
            : `${rows.length} referral${rows.length === 1 ? "" : "s"} on file · ${pendingOutreach.length} pending outreach.`
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Referrals on file" value={String(rows.length)} />
        <KPICard label="Pending outreach" value={String(pendingOutreach.length)} />
        <KPICard label="Won" value={String(won.length)} />
        <KPICard
          label="Rewards owed / paid"
          value={`${money(rewardsOwed)} / ${money(rewardsPaid)}`}
        />
      </section>

      <NewReferralForm
        customers={customers.map((c) => ({
          id: c.id,
          name: c.display_name,
        }))}
      />

      <section className="g-card overflow-hidden">
        <header className="border-b border-g-border-subtle px-5 py-3">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            All referrals
          </h2>
        </header>
        {rows.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <GitFork className="mx-auto h-6 w-6 text-g-text-faint" />
            <p className="mt-2 text-[13px] text-g-text-muted">
              No referrals logged. Add one above and watch the flywheel start.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-g-border-subtle">
            {rows.map((r) => {
              const referrer = Array.isArray(r.customers)
                ? r.customers[0]
                : r.customers;
              const referredLabel =
                r.referred_name || r.referred_email || r.referred_phone || "Unnamed lead";
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto_auto] md:items-center md:gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-g-text">
                        {referrer?.display_name ?? "—"}
                      </span>
                      <span className="text-[11px] text-g-text-faint">
                        referred
                      </span>
                      <span className="text-[13px] text-g-text">
                        {referredLabel}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-g-text-muted">
                      {[r.referred_phone, r.referred_email]
                        .filter(Boolean)
                        .join(" · ")}
                      {r.notes && ` — ${r.notes}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-g-text-muted">
                    {r.reward_cents != null && (
                      <span className="inline-flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        {money(r.reward_cents)}{" "}
                        {r.reward_kind ? REWARD_LABEL[r.reward_kind] : ""}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] text-g-text-faint">
                      {fmtDate(r.created_at)}
                    </span>
                  </div>
                  <StatusPill tone={STATUS_TONE[r.status] ?? "neutral"}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </StatusPill>
                  <AdvanceButton id={r.id} currentStatus={r.status} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
