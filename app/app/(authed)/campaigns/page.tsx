import { Newspaper, Send } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { CampaignsBrowser } from "@/components/app/CampaignsBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { dispatcherMode } from "@/lib/messaging/dispatch";
import { emailDispatcherMode } from "@/lib/messaging/email";
import {
  CampaignLauncher,
  type LauncherCampaign,
  type PlanTierOption,
} from "./_components/CampaignLauncher";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Campaigns · GladiusTurf",
  robots: { index: false, follow: false },
};

/**
 * Maintenance plan campaign launcher — Bright Lights pilot Day-1
 * (2026-05-08), per signed contract §2.1.
 *
 * Tenant session → real launcher (this file). Demo session → the
 * existing CampaignsBrowser sales-call surface, untouched.
 */

type DbCampaign = {
  id: string;
  title: string;
  body_en: string;
  body_es: string;
  channel: string[] | null;
  target_tier: "basics" | "care" | "guardian" | null;
  audience_filter: "all" | "no_plan";
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduled_for: string | null;
  sent_at: string | null;
  sent_count: number;
  opened_count: number;
  conversion_count: number;
  created_at: string;
};

type DbPlan = {
  tier: "basics" | "care" | "guardian" | "custom";
  display_name: string;
  annual_price_cents: number;
  active: boolean;
};

function normalizeChannels(
  raw: string[] | null,
): ("sms" | "email")[] {
  if (!raw) return [];
  const out: ("sms" | "email")[] = [];
  for (const c of raw) {
    if (c === "sms" || c === "email") out.push(c);
  }
  return out;
}

function toLauncherCampaign(c: DbCampaign): LauncherCampaign {
  return {
    id: c.id,
    title: c.title,
    body_en: c.body_en ?? "",
    body_es: c.body_es ?? "",
    channel: normalizeChannels(c.channel),
    target_tier: c.target_tier,
    audience_filter: c.audience_filter,
    status: c.status,
    scheduled_for: c.scheduled_for,
    sent_at: c.sent_at,
    sent_count: c.sent_count ?? 0,
    opened_count: c.opened_count ?? 0,
    conversion_count: c.conversion_count ?? 0,
    created_at: c.created_at,
  };
}

export default async function Page() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return <CampaignsBrowser product="demo" />;
  }

  const sb = supabaseAdmin();

  const [campaignsRes, plansRes, customersRes, subsRes] = await Promise.all([
    sb
      .from("campaigns")
      .select(
        "id, title, body_en, body_es, channel, target_tier, audience_filter, status, scheduled_for, sent_at, sent_count, opened_count, conversion_count, created_at",
      )
      .eq("tenant_id", session.tenant.id)
      .order("created_at", { ascending: false })
      .limit(25),
    sb
      .from("plans")
      .select("tier, display_name, annual_price_cents, active")
      .eq("tenant_id", session.tenant.id)
      .eq("active", true)
      .in("tier", ["basics", "care", "guardian"])
      .order("annual_price_cents", { ascending: true }),
    sb
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", session.tenant.id),
    sb
      .from("plan_subscriptions")
      .select("customer_id", { count: "exact", head: true })
      .eq("tenant_id", session.tenant.id)
      .eq("status", "active"),
  ]);

  const totalCustomers = customersRes.count ?? 0;

  if (totalCustomers === 0) {
    // No customer book — campaigns engine is wired but has nothing to
    // talk to. Sales-honest empty state pointing the operator at the
    // CSV importer.
    return (
      <TenantEmptyState
        engine="Campaigns"
        tenant={session.tenant}
        icon={Newspaper}
        body="Maintenance plan campaigns target your customer book — start by importing your customer list (CSV with bilingual preferred_language column). Once that's in, the launcher auto-segments by plan-tier eligibility and sends bilingual messages through the consent-gated dispatcher."
      />
    );
  }

  const campaigns = (campaignsRes.data ?? []).map((c) =>
    toLauncherCampaign(c as DbCampaign),
  );
  // Starters are the three pre-seeded tier-targeted drafts. Show them
  // separately so Cristian sees one-click load buttons at the top.
  const starters = campaigns.filter(
    (c) =>
      c.status === "draft" &&
      c.target_tier != null &&
      ["basics", "care", "guardian"].includes(c.target_tier),
  );
  const starterIds = new Set(starters.map((s) => s.id));
  const recent = campaigns.filter((c) => !starterIds.has(c.id));

  const plans: PlanTierOption[] = (plansRes.data ?? [])
    .filter((p): p is DbPlan & { tier: "basics" | "care" | "guardian" } => {
      const t = (p as DbPlan).tier;
      return t === "basics" || t === "care" || t === "guardian";
    })
    .map((p) => ({
      tier: p.tier,
      display_name: p.display_name,
      annual_price_cents: p.annual_price_cents,
    }));

  // Initial audience preview — default filter is "no_plan" (matches
  // the form default), so we surface the upsell opportunity count.
  const subscriberCount = subsRes.count ?? 0;
  const initialAudienceCount = Math.max(0, totalCustomers - subscriberCount);

  // Sample list — first 5 names for the audience preview rail. Use
  // the same filter as the default (customers without a plan).
  const { data: subRows } = await sb
    .from("plan_subscriptions")
    .select("customer_id")
    .eq("tenant_id", session.tenant.id)
    .eq("status", "active");
  const subscribedSet = new Set(
    (subRows ?? []).map((r) => r.customer_id as string),
  );
  const { data: sampleCustomers } = await sb
    .from("customers")
    .select("id, display_name, preferred_language")
    .eq("tenant_id", session.tenant.id)
    .order("display_name", { ascending: true })
    .limit(50);
  const initialAudienceSample = (sampleCustomers ?? [])
    .filter((c) => !subscribedSet.has(c.id as string))
    .slice(0, 5)
    .map((c) => ({
      id: c.id as string,
      displayName: (c.display_name as string | null) ?? "(unnamed)",
      language:
        (c.preferred_language as string | null) === "es"
          ? ("es" as const)
          : ("en" as const),
    }));

  const sentCampaigns = campaigns.filter((c) => c.status === "sent").length;
  const totalDispatched = campaigns.reduce((s, c) => s + c.sent_count, 0);

  const smsMode = dispatcherMode();
  const emailMode = emailDispatcherMode();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Recurring revenue`}
        title="Maintenance plan campaigns."
        subtitle="Bilingual outbound to your customer book — launch the maintenance plan campaign in one click. Consent-gated, audit-logged, dry-run safe."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Customer book"
          value={String(totalCustomers)}
          delta={`${subscriberCount} on a plan`}
          trend={subscriberCount > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Without an active plan"
          value={String(initialAudienceCount)}
          delta={
            totalCustomers > 0
              ? `${Math.round((initialAudienceCount / totalCustomers) * 100)}% of book`
              : "—"
          }
          trend={initialAudienceCount > 0 ? "down" : "flat"}
        />
        <KPICard
          label="Campaigns sent"
          value={String(sentCampaigns)}
          delta={
            totalDispatched > 0 ? `${totalDispatched} dispatches` : "none yet"
          }
          trend={sentCampaigns > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Plan tiers ready"
          value={String(plans.length)}
          delta={
            plans.length > 0
              ? plans
                  .map((p) => `$${(p.annual_price_cents / 100).toFixed(0)}`)
                  .join(" · ")
              : "—"
          }
          trend={plans.length > 0 ? "up" : "flat"}
          hint={
            <span className="inline-flex items-center gap-1 text-g-accent">
              <Send className="h-3 w-3" />
              Launcher below
            </span>
          }
        />
      </section>

      <CampaignLauncher
        recent={recent}
        starters={starters}
        plans={plans}
        initialAudienceCount={initialAudienceCount}
        initialAudienceSample={initialAudienceSample}
        smsMode={smsMode}
        emailMode={emailMode}
        totalCustomers={totalCustomers}
      />
    </div>
  );
}
