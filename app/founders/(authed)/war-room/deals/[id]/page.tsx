import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { supabaseAdmin } from "@/lib/supabase";
import { CopyShareButton } from "../_components/CopyShareButton";
import { relTime } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Deal · GladiusTurf",
  robots: { index: false, follow: false },
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://gladiusturf.com";

type DealRow = {
  id: string;
  token: string;
  status: string;
  prospect_email: string;
  prospect_company: string;
  prospect_phone: string | null;
  tier: string;
  custom_price_cents: number;
  addon_bdc: boolean;
  notes: string | null;
  founder_owner_email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  sent_at: string | null;
  paid_at: string | null;
  signed_at: string | null;
  activated_at: string | null;
  expires_at: string;
};

type DealEvent = {
  id: string;
  from_state: string | null;
  to_state: string | null;
  actor: string;
  actor_email: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = supabaseAdmin();

  const [{ data: deal }, { data: events }] = await Promise.all([
    sb
      .from("deals")
      .select(
        "id, token, status, prospect_email, prospect_company, prospect_phone, tier, custom_price_cents, addon_bdc, notes, founder_owner_email, stripe_customer_id, stripe_subscription_id, stripe_payment_intent_id, created_at, sent_at, paid_at, signed_at, activated_at, expires_at",
      )
      .eq("id", id)
      .maybeSingle(),
    sb
      .from("deal_events")
      .select(
        "id, from_state, to_state, actor, actor_email, metadata, created_at",
      )
      .eq("deal_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (!deal) {
    return (
      <div className="g-card p-6">
        <p className="text-[13px] text-g-text-muted">Deal not found.</p>
        <Link
          href="/founders/war-room/deals"
          prefetch
          className="mt-3 inline-flex text-[12px] text-g-accent hover:underline"
        >
          Back to deals
        </Link>
      </div>
    );
  }

  const d = deal as DealRow;
  const monthly = (d.custom_price_cents + (d.addon_bdc ? 49900 : 0)) / 100;
  const shareUrl = `${SITE}/close/${d.token}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Deal"
        title={d.prospect_company}
        subtitle={`${d.prospect_email}${d.prospect_phone ? ` · ${d.prospect_phone}` : ""}`}
        actions={
          <Link
            href="/founders/war-room/deals"
            prefetch
            className="inline-flex items-center gap-1 text-[12px] text-g-text-muted hover:text-g-text"
          >
            <ChevronLeft className="h-3 w-3" />
            All deals
          </Link>
        }
      />

      <section className="g-card flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Share with prospect
        </div>
        <div className="flex flex-col gap-2 rounded-md border border-g-border-subtle bg-g-surface-2 p-3 sm:flex-row sm:items-center">
          <code className="flex-1 break-all font-geist-mono text-[12px] text-g-text">
            {shareUrl}
          </code>
          <div className="flex shrink-0 items-center gap-2">
            <CopyShareButton url={shareUrl} />
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 rounded-md border border-g-border-subtle bg-g-surface px-3 py-1.5 text-[12px] text-g-text-muted hover:border-g-accent/60 hover:text-g-text"
            >
              <ExternalLink className="h-3 w-3" />
              Open
            </a>
          </div>
        </div>
        <p className="text-[11px] text-g-text-faint">
          Token expires {new Date(d.expires_at).toLocaleString()}. Anyone
          with this URL can complete payment — treat it as a bearer secret.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card label="Tier">
          <p className="font-geist-mono text-[14px] text-g-text capitalize">
            {d.tier}
            {d.addon_bdc && (
              <span className="ml-2 text-[11px] text-g-accent">+ BDC $499</span>
            )}
          </p>
        </Card>
        <Card label="First-month total">
          <p className="font-geist-mono text-[18px] text-g-text tabular-nums">
            ${monthly.toLocaleString()}
          </p>
        </Card>
        <Card label="Status">
          <p className="text-[14px] text-g-text capitalize">
            {d.status.replace(/_/g, " ")}
          </p>
        </Card>
      </section>

      {(d.stripe_customer_id || d.stripe_subscription_id) && (
        <section className="g-card flex flex-col gap-2 p-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Stripe linkage
          </div>
          <dl className="grid grid-cols-1 gap-2 text-[12px] sm:grid-cols-2">
            {d.stripe_customer_id && (
              <DlRow label="Customer" value={d.stripe_customer_id} />
            )}
            {d.stripe_subscription_id && (
              <DlRow label="Subscription" value={d.stripe_subscription_id} />
            )}
            {d.stripe_payment_intent_id && (
              <DlRow label="Payment intent" value={d.stripe_payment_intent_id} />
            )}
          </dl>
        </section>
      )}

      {d.notes && (
        <section className="g-card p-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Notes
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[13px] leading-[1.55] text-g-text-muted">
            {d.notes}
          </p>
        </section>
      )}

      <section className="g-card overflow-hidden">
        <div className="border-b border-g-border-subtle px-5 py-3 text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          State transitions ({(events ?? []).length})
        </div>
        <ul className="divide-y divide-g-border-subtle">
          {((events ?? []) as DealEvent[]).map((e) => (
            <li key={e.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
              <span className="font-geist-mono text-[11px] text-g-text-faint min-w-[120px]">
                {relTime(e.created_at)}
              </span>
              <span className="text-[13px] text-g-text">
                {e.from_state ?? "—"} →{" "}
                <span className="text-g-accent">{e.to_state ?? "—"}</span>
              </span>
              <span className="text-[11px] text-g-text-muted">
                by {e.actor}
                {e.actor_email && ` (${e.actor_email})`}
              </span>
            </li>
          ))}
          {(events ?? []).length === 0 && (
            <li className="px-5 py-4 text-[13px] text-g-text-muted">
              No state transitions recorded yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="g-card p-4">
      <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function DlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-g-text-faint">{label}</dt>
      <dd className="break-all font-geist-mono text-g-text">{value}</dd>
    </div>
  );
}
