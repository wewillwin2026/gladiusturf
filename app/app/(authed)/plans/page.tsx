import Link from "next/link";
import { ArrowRight, Check, Repeat, Sparkles, Star } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

type DbPlan = {
  id: string;
  tier: string;
  display_name: string;
  annual_price_cents: number;
  visits_per_year: number | null;
  cadence: string | null;
  features: string[];
  badge: string | null;
  most_popular: boolean;
  recommended_for: string | null;
};

function dollar(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function PlansPage() {
  const session = await readAppSession();

  if (session.kind !== "tenant") {
    // Demo session — no plans data in the Cypress Lawn seed. Surface an
    // honest "this is a real-tenant feature" state so sales calls don't
    // accidentally pitch fictional plans.
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Demo · Cypress Lawn"
          title="Plans"
          subtitle="Maintenance plan engine — pre-seeded for real tenants only."
        />
        <div className="g-card p-8 text-center">
          <Repeat className="mx-auto h-8 w-8 text-g-text-faint" />
          <p className="mt-4 text-[14px] text-g-text-muted">
            The maintenance plan engine ships with three pre-built tiers
            seeded into every real tenant&apos;s workspace at signup.
          </p>
          <p className="mt-2 text-[12px] text-g-text-faint">
            Sign in as a real tenant to see the plan engine populated.
          </p>
        </div>
      </div>
    );
  }

  const sb = supabaseAdmin();
  const [plansRes, subsRes, customersRes] = await Promise.all([
    sb
      .from("plans")
      .select(
        "id, tier, display_name, annual_price_cents, visits_per_year, cadence, features, badge, most_popular, recommended_for",
      )
      .eq("tenant_id", session.tenant.id)
      .eq("active", true)
      .order("annual_price_cents", { ascending: true }),
    sb
      .from("plan_subscriptions")
      .select("plan_id, status", { count: "exact" })
      .eq("tenant_id", session.tenant.id)
      .eq("status", "active"),
    sb
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", session.tenant.id),
  ]);

  const plans = (plansRes.data ?? []) as DbPlan[];
  const subs = subsRes.data ?? [];
  const totalCustomers = customersRes.count ?? 0;
  const subscribersByPlan = new Map<string, number>();
  for (const s of subs) {
    subscribersByPlan.set(
      s.plan_id as string,
      (subscribersByPlan.get(s.plan_id as string) ?? 0) + 1,
    );
  }

  if (plans.length === 0) {
    return (
      <TenantEmptyState
        engine="Plans"
        tenant={session.tenant}
        icon={Repeat}
        body="Plan tiers haven't been seeded for your workspace yet. The default Bright Basics / Care / Guardian set is pre-built for lighting tenants on signup."
      />
    );
  }

  const totalSubscribers = subs.length;
  const totalArrCents = plans.reduce(
    (s, p) => s + p.annual_price_cents * (subscribersByPlan.get(p.id) ?? 0),
    0,
  );
  const customersWithoutPlan = Math.max(0, totalCustomers - totalSubscribers);
  // Plan-upsell potential: assume customers convert at the most-popular tier
  // price (Bright Care = $349). Conservative — Guardian at $589 would upsell
  // higher revenue but lower attach rate.
  const popular = plans.find((p) => p.most_popular) ?? plans[1] ?? plans[0]!;
  const upsellPotentialCents = customersWithoutPlan * popular.annual_price_cents;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Sales`}
        title="Plans"
        subtitle={`${plans.length} tiers · ${totalSubscribers} active subscribers · ${dollar(totalArrCents)} ARR booked.`}
        actions={
          <>
            <Button variant="secondary">Edit tiers</Button>
            <Button variant="primary">
              <Sparkles className="h-3.5 w-3.5" />
              Run plan-conversion campaign
              <ArrowRight className="h-3 w-3" />
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="ARR booked"
          value={dollar(totalArrCents)}
          delta={totalSubscribers > 0 ? `${totalSubscribers} subscribers` : "no subscribers yet"}
          trend={totalSubscribers > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Customers without plan"
          value={String(customersWithoutPlan)}
          delta={
            totalCustomers > 0
              ? `${Math.round((customersWithoutPlan / totalCustomers) * 100)}% of book`
              : "—"
          }
          trend={customersWithoutPlan > 0 ? "down" : "flat"}
        />
        <KPICard
          label="Upsell potential"
          value={dollar(upsellPotentialCents)}
          delta={`@ ${popular.display_name}`}
          trend={upsellPotentialCents > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Most popular tier"
          value={popular.badge ?? popular.display_name}
          delta={popular.recommended_for ?? "—"}
          trend="flat"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {plans.map((p) => {
          const subscriberCount = subscribersByPlan.get(p.id) ?? 0;
          const isPopular = p.most_popular;
          return (
            <article
              key={p.id}
              className={cn(
                "g-card p-6 flex flex-col",
                isPopular && "ring-1 ring-g-accent",
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-g-text-faint">
                    {p.badge ?? p.tier}
                  </p>
                  <h2 className="mt-1 text-[18px] font-medium text-g-text">
                    {p.display_name}
                  </h2>
                </div>
                {isPopular && (
                  <StatusPill tone="accent">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Most popular
                    </span>
                  </StatusPill>
                )}
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-tiempos text-[32px] font-medium text-g-text">
                  {dollar(p.annual_price_cents)}
                </span>
                <span className="text-[12px] text-g-text-faint">/year</span>
              </div>
              <p className="mt-1 text-[12px] text-g-text-muted">
                {p.cadence}
                {p.visits_per_year != null && ` · ${p.visits_per_year} visit${p.visits_per_year === 1 ? "" : "s"} per year`}
              </p>

              <ul className="mt-5 flex flex-col gap-2 text-[13px] text-g-text-muted">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-g-accent" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-5 border-t border-g-border-subtle flex items-center justify-between text-[12px]">
                <span className="text-g-text-faint">
                  {subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"}
                </span>
                <Link
                  href={`/app/customers?plan=${p.tier}`}
                  prefetch
                  className="text-g-accent hover:underline inline-flex items-center gap-1"
                >
                  Manage
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {p.recommended_for && (
                <p className="mt-3 text-[11px] text-g-text-faint italic">
                  Recommended for {p.recommended_for}
                </p>
              )}
            </article>
          );
        })}
      </section>

      {customersWithoutPlan > 0 && (
        <section className="g-card p-6 bg-g-accent-faint border-g-accent/40">
          <div className="flex items-baseline justify-between">
            <h2 className="inline-flex items-center gap-2 text-g-accent">
              <Sparkles className="h-4 w-4" />
              Plan upsell opportunity
            </h2>
            <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
              Untapped ARR
            </span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-g-text">
            <span className="font-medium">{customersWithoutPlan}</span> of your
            customers don&apos;t have a maintenance plan yet. At{" "}
            <span className="font-medium">{popular.display_name}</span> ({dollar(popular.annual_price_cents)}
            /yr), the slow season becomes your{" "}
            <span className="font-medium text-g-accent">
              {dollar(upsellPotentialCents)}
            </span>{" "}
            recurring-revenue motion.
          </p>
          <p className="mt-3 text-[12px] text-g-text-muted">
            The campaign builder pre-segments your book by install year +
            warranty status + cluster. Bilingual templates for EN/ES customers.
          </p>
        </section>
      )}
    </div>
  );
}
