import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { registryFor } from "@/lib/vertical/registry";
import { dismissOnboardingStep } from "@/app/app/(authed)/page-actions";

/**
 * Day-1 onboarding checklist — Bright Lights pilot (2026-05-08).
 *
 * Renders ON the tenant dashboard once at least one customer exists
 * (TenantOnboardingHero takes over when customers.count === 0). Walks
 * Felipe through the six setup steps that turn an empty workspace into
 * a working CRM:
 *
 *   1. Customers imported (>= 5)        — table:  customers
 *   2. First fixture logged (>= 1)      — table:  lighting_fixtures (lighting only)
 *   3. First plan subscription (>= 1)   — table:  plan_subscriptions (status=active)
 *   4. Plans tier reviewed              — flag:   onboarding_steps.plans_reviewed
 *   5. First campaign drafted (>= 1)    — table:  campaigns
 *   6. Review-ask toggled               — column: review_ask_enabled OR
 *                                          flag:   onboarding_steps.review_ask_dismissed
 *
 * Once all six are complete, the card collapses into a "All set" green
 * confirmation tile that stays visible for 7 days (using tenants.created_at
 * as the anchor — the operator's first week) and then hides itself
 * automatically.
 *
 * Server component. All queries tenant-scoped to `tenantId`.
 *
 * Step #2 only renders for vertical=lighting. When we add more verticals
 * (irrigation, etc.) wire the equivalent through registryFor().
 */

type Step = {
  key: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
  /** Step is rendered if it applies to this tenant's vertical. */
  applicable: boolean;
  /** Step is dismissible — render a "Mark done" button instead of CTA when not done. */
  dismissibleAs?: "plans_reviewed" | "review_ask_dismissed";
};

export async function OnboardingChecklist({ tenantId }: { tenantId: string }) {
  const sb = supabaseAdmin();

  // One round-trip per signal. We could collapse some of these into a
  // single rpc, but the dashboard is already running parallel queries
  // and Supabase pooler latency on small count(*) queries is negligible.
  const [
    tenantRes,
    customerCountRes,
    fixtureCountRes,
    planSubCountRes,
    campaignCountRes,
  ] = await Promise.all([
    sb
      .from("tenants")
      .select("display_name, vertical, review_ask_enabled, onboarding_steps, created_at")
      .eq("id", tenantId)
      .maybeSingle(),
    sb
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    sb
      .from("lighting_fixtures")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    sb
      .from("plan_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "active"),
    sb
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
  ]);

  // If tenants.* read fails we hide the card rather than render half-known
  // state. The dashboard owner-line + KPIs render fine without us.
  if (!tenantRes.data) return null;

  const tenant = tenantRes.data as {
    display_name: string;
    vertical: string;
    review_ask_enabled: boolean | null;
    onboarding_steps: Record<string, unknown> | null;
    created_at: string;
  };
  const flags = tenant.onboarding_steps ?? {};
  const reg = registryFor(tenant.vertical);

  const customerCount = customerCountRes.count ?? 0;
  const fixtureCount = fixtureCountRes.count ?? 0;
  const planSubCount = planSubCountRes.count ?? 0;
  const campaignCount = campaignCountRes.count ?? 0;

  const steps: Step[] = [
    {
      key: "customers_imported",
      title: "Import 5+ customers",
      description:
        customerCount >= 5
          ? `${customerCount} customers in your workspace.`
          : `${customerCount} of 5 imported. Drop a CSV or add manually.`,
      href: "/app/import/customers",
      cta: "Import CSV",
      done: customerCount >= 5,
      applicable: true,
    },
    {
      key: "first_fixture",
      title: `Log your first ${reg.assetLabel}`,
      description:
        fixtureCount >= 1
          ? `${fixtureCount} ${reg.assetLabelPlural} tracked.`
          : `Open a customer and add their first installed ${reg.assetLabel}.`,
      href: "/app/customers",
      cta: "Open customers",
      done: fixtureCount >= 1,
      applicable: tenant.vertical === "lighting",
    },
    {
      key: "first_plan_sub",
      title: "Sign your first plan customer",
      description:
        planSubCount >= 1
          ? `${planSubCount} active subscription${planSubCount === 1 ? "" : "s"}.`
          : "Pick a customer, attach a plan tier. The recurring revenue starts here.",
      href: "/app/plans",
      cta: "Open plans",
      done: planSubCount >= 1,
      applicable: true,
    },
    {
      key: "plans_reviewed",
      title: "Review your plan tiers",
      description:
        flags.plans_reviewed === true
          ? "Reviewed."
          : "Confirm your three tiers (Basics / Care / Guardian) match your service menu.",
      href: "/app/plans",
      cta: "Review tiers",
      done: flags.plans_reviewed === true,
      applicable: true,
      dismissibleAs: "plans_reviewed",
    },
    {
      key: "first_campaign",
      title: "Draft your first campaign",
      description:
        campaignCount >= 1
          ? `${campaignCount} campaign${campaignCount === 1 ? "" : "s"} in your workspace.`
          : "Bilingual SMS or email — pick a tier, write 2 sentences, schedule it.",
      href: "/app/campaigns",
      cta: "New campaign",
      done: campaignCount >= 1,
      applicable: true,
    },
    {
      key: "review_ask",
      title: "Decide on the review-ask",
      description:
        tenant.review_ask_enabled === true
          ? "Auto-ask is ON — every completed visit triggers a review request."
          : flags.review_ask_dismissed === true
            ? "Skipped for now. You can flip it on later in Reviews."
            : "Auto-text customers for a Google review after their visit. On or off?",
      href: "/app/reviews",
      cta: "Open reviews",
      done:
        tenant.review_ask_enabled === true || flags.review_ask_dismissed === true,
      applicable: true,
      dismissibleAs: "review_ask_dismissed",
    },
  ];

  const applicable = steps.filter((s) => s.applicable);
  const doneCount = applicable.filter((s) => s.done).length;
  const total = applicable.length;
  const allDone = doneCount === total;

  // Hide the green "All set" tile after 7 days from tenant creation so it
  // doesn't live forever on the dashboard. The checklist itself stays
  // visible until done, regardless of age — Felipe could take 3 weeks.
  if (allDone) {
    const ageDays =
      (Date.now() - new Date(tenant.created_at).getTime()) / (24 * 60 * 60 * 1000);
    if (ageDays > 7) return null;
    return (
      <div className="g-card flex items-center gap-3 border-g-accent/40 bg-g-accent-faint/30 p-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-g-accent text-black">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-g-text">
            All set — Day-1 setup complete.
          </div>
          <p className="text-[12px] text-g-text-muted">
            {tenant.display_name} is wired up. This card auto-hides 7 days
            after launch.
          </p>
        </div>
      </div>
    );
  }

  const pct = Math.round((doneCount / total) * 100);
  const titlePrefix =
    tenant.display_name.length > 0 ? `${tenant.display_name} · ` : "";

  return (
    <section
      aria-label="Day-1 setup checklist"
      className="g-card flex flex-col gap-3 p-4"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            Day-1 setup
          </div>
          <div className="mt-0.5 text-[15px] font-medium text-g-text truncate">
            {titlePrefix}
            {doneCount} of {total} steps complete
          </div>
        </div>
        <div className="text-[12px] text-g-text-muted shrink-0 tabular-nums">
          {pct}%
        </div>
      </header>

      <div className="h-1.5 overflow-hidden rounded-full bg-g-surface-2">
        <div
          className="h-full bg-g-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="flex flex-col gap-1.5">
        {applicable.map((step) => (
          <li
            key={step.key}
            className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-g-surface-2"
          >
            <span className="mt-0.5 shrink-0">
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-g-accent" />
              ) : (
                <Circle className="h-4 w-4 text-g-text-faint" />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <div
                className={`text-[13px] font-medium ${
                  step.done ? "text-g-text-muted line-through" : "text-g-text"
                }`}
              >
                {step.title}
              </div>
              <p className="text-[12px] text-g-text-muted">{step.description}</p>
            </div>
            {!step.done && (
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={step.href}
                  prefetch
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-g-accent hover:underline"
                >
                  {step.cta}
                  <ArrowRight className="h-3 w-3" />
                </Link>
                {step.dismissibleAs && (
                  <form
                    action={async (fd) => {
                      "use server";
                      await dismissOnboardingStep(fd);
                    }}
                  >
                    <input type="hidden" name="step" value={step.dismissibleAs} />
                    <button
                      type="submit"
                      className="text-[11px] text-g-text-faint hover:text-g-text-muted"
                    >
                      Mark done
                    </button>
                  </form>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
