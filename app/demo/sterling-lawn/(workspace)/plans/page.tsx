import Link from "next/link";
import { ArrowRight, Check, TrendingUp } from "lucide-react";
import { CUSTOMERS, KPIS, PLANS } from "@/lib/demo-data/sterling-lawn";

export const dynamic = "force-dynamic";

export default function PlansPage() {
  const onPlan = CUSTOMERS.filter((c) => c.plan !== "À la carte").length;
  const offPlan = CUSTOMERS.filter((c) => c.plan === "À la carte").length;
  const conversionTarget = Math.round(
    ((onPlan + offPlan) * 0.95 - onPlan) * 200,
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="sl-eyebrow-muted">Maintenance plans</span>
        <h1
          className="sl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--sl-text)" }}
        >
          Three plans, ${KPIS.monthlyRecurring.toLocaleString()} monthly recurring.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--sl-text-muted)" }}>
          {KPIS.planSubscribers} of {KPIS.activeCustomers} customers on a plan ·{" "}
          {Math.round((KPIS.planSubscribers / KPIS.activeCustomers) * 100)}%
          plan capture · ${conversionTarget.toLocaleString()}/mo opportunity in
          the remaining {offPlan} à-la-carte customers.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className="sl-card flex flex-col gap-4 p-5"
            style={
              p.id === "mow-fert"
                ? {
                    background:
                      "linear-gradient(180deg, rgba(127,226,122,0.10), rgba(127,226,122,0.02) 80%, transparent)",
                    border: "1px solid rgba(127,226,122,0.40)",
                  }
                : undefined
            }
          >
            <header className="flex flex-col gap-1">
              {p.id === "mow-fert" && (
                <span
                  className="sl-pill self-start"
                  style={{
                    background: "rgba(127,226,122,0.18)",
                    color: "var(--sl-accent)",
                    borderColor: "rgba(127,226,122,0.50)",
                  }}
                >
                  Most popular
                </span>
              )}
              <h2
                className="sl-serif text-[20px] leading-tight"
                style={{ color: "var(--sl-text)" }}
              >
                {p.name}
              </h2>
              <p
                className="text-[12px]"
                style={{ color: "var(--sl-text-muted)" }}
              >
                {p.description}
              </p>
            </header>

            <div className="flex items-baseline gap-1">
              <span
                className="sl-serif text-[32px] leading-none"
                style={{ color: "var(--sl-text)" }}
              >
                ${p.monthlyPrice}
              </span>
              <span
                className="text-[12px]"
                style={{ color: "var(--sl-text-faint)" }}
              >
                /mo
              </span>
            </div>

            <ul className="flex flex-col gap-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[12px]">
                  <Check
                    className="mt-0.5 h-3 w-3 shrink-0"
                    style={{ color: "var(--sl-accent)" }}
                  />
                  <span style={{ color: "var(--sl-text-muted)" }}>{f}</span>
                </li>
              ))}
            </ul>

            <div
              className="mt-auto rounded-md px-3 py-2 text-[12px]"
              style={{
                background: "rgba(0,0,0,0.18)",
                border: "1px solid var(--sl-border)",
              }}
            >
              <div
                className="flex items-center gap-1.5"
                style={{ color: "var(--sl-text-muted)" }}
              >
                <TrendingUp
                  className="h-3 w-3"
                  style={{ color: "var(--sl-success)" }}
                />
                <span>
                  <strong style={{ color: "var(--sl-text)" }}>
                    {p.subscribers}
                  </strong>{" "}
                  subscribers · $
                  {p.monthlyAccretion.toLocaleString()}/mo recurring
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="sl-card flex flex-col gap-3 p-5">
        <span className="sl-eyebrow">How Gladius grows your plan book</span>
        <ul className="grid gap-2 md:grid-cols-3">
          <Hint
            title="One-tap upsell after every visit"
            body="The crew chief flags a property (e.g., bare patches) from the truck. The customer gets a personalized SMS with a 1-tap approve link tied to the next visit."
          />
          <Hint
            title="Conversion of à-la-carte to plan"
            body="Customers who pay 3+ invoices in 90 days auto-enroll into a plan offer, priced from their historical spend. Two-thirds opt in."
          />
          <Hint
            title="Seasonal reminders timed to NOAA"
            body="When growing-degree-days cross thresholds for your zip, plan members get the upgrade nudge first — aeration, overseed, pre-emerge."
          />
        </ul>
        <Link
          href="/demo/sterling-lawn/customers"
          className="sl-btn-ghost mt-2 self-start"
        >
          See plan capture per customer <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </div>
  );
}

function Hint({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-md p-3 text-[12px]"
      style={{
        background: "rgba(0,0,0,0.18)",
        border: "1px solid var(--sl-border)",
      }}
    >
      <div
        className="sl-serif text-[14px] leading-tight"
        style={{ color: "var(--sl-text)" }}
      >
        {title}
      </div>
      <p className="mt-1.5" style={{ color: "var(--sl-text-muted)" }}>
        {body}
      </p>
    </div>
  );
}
