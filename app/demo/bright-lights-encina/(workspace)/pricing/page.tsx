import { Check, Crown, Sparkles, TrendingUp } from "lucide-react";
import { GLADIUS_TIERS } from "@/lib/demo-data/bright-lights";

export const dynamic = "force-dynamic";

const PROJECTED_ARR = 25_873;
const ANNUAL_PRO = 4_788;
const ROI = (PROJECTED_ARR / ANNUAL_PRO).toFixed(1);

export default function PricingPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="bl-eyebrow-muted">The close</span>
        <h1
          className="bl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          Plans & Pricing — what to put in front of your dad on Monday.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--bl-text-muted)" }}>
          Independent is for solo operators. Enterprise is for 5+ crew shops.
          You&rsquo;re a Professional. The math says 5.4× year-one ROI.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {GLADIUS_TIERS.map((tier) => (
          <PricingCard key={tier.id} tier={tier} />
        ))}
      </section>

      <section
        className="bl-card-elevated p-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(244,184,96,0.10) 0%, rgba(244,184,96,0.0) 70%)",
          border: "1px solid rgba(244,184,96,0.4)",
        }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp
            className="h-4 w-4"
            style={{ color: "var(--bl-accent)" }}
          />
          <span className="bl-eyebrow">Year-1 ROI · Bright Lights</span>
        </div>
        <h2
          className="bl-serif mt-3 text-[26px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          ${PROJECTED_ARR.toLocaleString()} new ARR ÷ ${ANNUAL_PRO.toLocaleString()} cost
          ={" "}
          <span style={{ color: "var(--bl-accent)" }}>{ROI}× year-one ROI.</span>
        </h2>
        <p
          className="mt-3 text-[13px] leading-[1.6]"
          style={{ color: "var(--bl-text-muted)" }}
        >
          That&rsquo;s the conservative 30%-conversion estimate from the
          Maintenance Plans engine, weighted toward Bright Care. It assumes
          zero new customers — just the latent value already sitting in your
          247-customer book. Year 2 those subscribers stay on AND the new
          installs auto-enroll.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <RoiStat label="New ARR" value={`$${PROJECTED_ARR.toLocaleString()}`} accent />
          <RoiStat label="Annual Gladius" value={`$${ANNUAL_PRO.toLocaleString()}`} />
          <RoiStat label="Net year 1" value={`$${(PROJECTED_ARR - ANNUAL_PRO).toLocaleString()}`} />
          <RoiStat label="Payback" value="~2.2 months" success />
        </div>
      </section>

      <section
        className="bl-card flex flex-col items-start gap-4 p-6 md:flex-row md:items-center"
        style={{ background: "rgba(0,0,0,0.18)" }}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
          style={{
            background: "rgba(244,184,96,0.18)",
            color: "var(--bl-accent)",
            border: "1px solid rgba(244,184,96,0.4)",
          }}
        >
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3
            className="bl-serif text-[18px]"
            style={{ color: "var(--bl-text)" }}
          >
            Felipe — what would have to be true for your dad to say yes on Monday?
          </h3>
          <p
            className="mt-2 text-[13px] leading-[1.55]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            We&rsquo;ll spin up Cristian + Felipe as users this week, import your
            customer list, and have the first bilingual maintenance campaign
            sending before the end of the month — your branding, your voice,
            your customers.
          </p>
        </div>
        <button className="bl-btn-primary shrink-0">
          Move forward → Professional
        </button>
      </section>
    </div>
  );
}

function PricingCard({ tier }: { tier: (typeof GLADIUS_TIERS)[number] }) {
  const isPro = tier.recommendedForBL;
  return (
    <div
      className="bl-card relative flex flex-col gap-3 px-5 py-5"
      style={{
        background: isPro ? "var(--bl-bg-2)" : "var(--bl-bg)",
        border: isPro ? "1.5px solid var(--bl-accent)" : "1px solid var(--bl-border)",
        transform: isPro ? "translateY(-4px)" : "none",
      }}
    >
      {isPro && (
        <span
          className="absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em]"
          style={{
            background: "var(--bl-accent)",
            color: "#1a1208",
            fontWeight: 600,
          }}
        >
          ★ Recommended for Bright Lights
        </span>
      )}
      <div className="flex items-center gap-2">
        <Crown
          className="h-4 w-4"
          style={{
            color:
              tier.id === "enterprise"
                ? "#FFD56A"
                : isPro
                  ? "var(--bl-accent)"
                  : "rgba(245,239,230,0.45)",
          }}
        />
        <span className="bl-eyebrow">{tier.id}</span>
      </div>
      <h3
        className="bl-serif text-[22px]"
        style={{ color: "var(--bl-text)" }}
      >
        {tier.name}
      </h3>
      <div className="flex items-baseline gap-2">
        <span
          className="bl-mono text-[32px]"
          style={{ color: isPro ? "var(--bl-accent)" : "var(--bl-text)" }}
        >
          ${tier.price}
        </span>
        <span className="text-[12px]" style={{ color: "var(--bl-text-faint)" }}>
          /mo
        </span>
      </div>
      <span className="text-[11px]" style={{ color: "var(--bl-text-faint)" }}>
        Annual prepay: ${tier.price * 12} · cancel anytime after month 3
      </span>
      <ul className="mt-2 flex flex-col gap-2">
        {tier.bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2 text-[12px]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            <Check
              className="mt-0.5 h-3 w-3 shrink-0"
              style={{ color: "var(--bl-success)" }}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RoiStat({
  label,
  value,
  accent,
  success,
}: {
  label: string;
  value: string;
  accent?: boolean;
  success?: boolean;
}) {
  return (
    <div
      className="rounded-md px-3 py-2.5"
      style={{
        background: "rgba(0,0,0,0.18)",
        border: "1px solid var(--bl-border)",
      }}
    >
      <div className="bl-eyebrow-muted">{label}</div>
      <div
        className="bl-mono mt-1 text-[18px]"
        style={{
          color: accent
            ? "var(--bl-accent)"
            : success
              ? "var(--bl-success)"
              : "var(--bl-text)",
          fontWeight: accent || success ? 600 : 400,
        }}
      >
        {value}
      </div>
    </div>
  );
}
