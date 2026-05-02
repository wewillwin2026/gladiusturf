"use client";

import * as React from "react";
import {
  Calendar,
  Check,
  Filter,
  Mail,
  Send,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import {
  DEFAULT_TIER_WEIGHTING,
  EMAIL_EN,
  EMAIL_ES,
  projectARR,
  type Tier,
} from "@/lib/demo-data/bright-lights";

const FILTER_CHIPS = [
  "Install year ≥ 2018",
  "Last service > 12mo",
  "Has expired warranty",
  "Sarasota cluster",
  "Tampa cluster",
  "Naples cluster",
];

type Lang = "en" | "es";

export function MaintenancePlansClient({
  tiers,
  emails,
  totalCustomers,
}: {
  tiers: Tier[];
  emails: { en: typeof EMAIL_EN; es: typeof EMAIL_ES };
  totalCustomers: number;
}) {
  const [conversion, setConversion] = React.useState(30);
  const [activeTiers, setActiveTiers] = React.useState({
    basics: true,
    care: true,
    guardian: true,
  });
  const [audience, setAudience] = React.useState<"all" | "filtered">("all");
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [lang, setLang] = React.useState<Lang>("en");
  const [schedule, setSchedule] = React.useState<"today" | "tomorrow" | "custom">("today");

  const audienceCount =
    audience === "all"
      ? totalCustomers
      : Math.max(40, totalCustomers - activeFilters.length * 35);

  const projection = projectARR(audienceCount, conversion, DEFAULT_TIER_WEIGHTING);
  const subscribersAtCare = Math.round(
    (projection.subscribers * DEFAULT_TIER_WEIGHTING.care) /
      (DEFAULT_TIER_WEIGHTING.basics + DEFAULT_TIER_WEIGHTING.care + DEFAULT_TIER_WEIGHTING.guardian),
  );
  const email = emails[lang];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <span className="bl-eyebrow-muted">Engine</span>
        <h1
          className="bl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          Maintenance plans — your slow-season engine.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--bl-text-muted)" }}>
          247 customers, 0 on a plan. Beacon Outdoor charges $315/yr for what
          your dad gives away. This is how you launch a recurring-revenue
          program in one Sunday.
        </p>
      </header>

      {/* Tier cards */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {tiers.map((t) => (
          <TierCard key={t.id} tier={t} active={activeTiers[t.id]} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Campaign Builder */}
        <section className="bl-card">
          <header
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--bl-border)" }}
          >
            <div>
              <span className="bl-eyebrow">Campaign Builder</span>
              <h2
                className="bl-serif mt-1 text-[18px]"
                style={{ color: "var(--bl-text)" }}
              >
                Launch to existing customers
              </h2>
            </div>
            <Stepper current={step} onSelect={setStep} />
          </header>

          {/* Step 1 — Audience */}
          {step === 1 && (
            <div className="flex flex-col gap-4 px-5 py-5">
              <Field label="Audience">
                <div className="flex items-center gap-2 text-[12px]">
                  <RadioPill
                    active={audience === "all"}
                    onClick={() => setAudience("all")}
                  >
                    <Users className="h-3 w-3" />
                    All {totalCustomers} customers
                  </RadioPill>
                  <RadioPill
                    active={audience === "filtered"}
                    onClick={() => setAudience("filtered")}
                  >
                    <Filter className="h-3 w-3" />
                    Filter
                  </RadioPill>
                </div>
              </Field>

              {audience === "filtered" && (
                <Field label="Filter chips">
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_CHIPS.map((f) => {
                      const active = activeFilters.includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() =>
                            setActiveFilters((prev) =>
                              active ? prev.filter((x) => x !== f) : [...prev, f],
                            )
                          }
                          className="rounded-full px-2.5 py-1 text-[11px] transition-colors"
                          style={{
                            background: active
                              ? "rgba(244,184,96,0.16)"
                              : "rgba(0,0,0,0.18)",
                            color: active ? "var(--bl-accent)" : "var(--bl-text-muted)",
                            border: `1px solid ${active ? "rgba(244,184,96,0.5)" : "var(--bl-border)"}`,
                          }}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}

              <div
                className="rounded-md px-3 py-3"
                style={{
                  background: "rgba(244,184,96,0.08)",
                  border: "1px solid rgba(244,184,96,0.32)",
                }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="bl-eyebrow">Sending to</span>
                  <span
                    className="bl-mono text-[20px]"
                    style={{ color: "var(--bl-accent)" }}
                  >
                    {audienceCount} customers
                  </span>
                </div>
              </div>

              <NextButton onClick={() => setStep(2)} />
            </div>
          )}

          {/* Step 2 — Tiers offered */}
          {step === 2 && (
            <div className="flex flex-col gap-4 px-5 py-5">
              <Field label="Tiers in this campaign">
                <div className="flex flex-col gap-2">
                  {tiers.map((t) => (
                    <Checkbox
                      key={t.id}
                      label={`${t.name} · $${t.price}/yr`}
                      checked={activeTiers[t.id]}
                      onChange={(v) =>
                        setActiveTiers((prev) => ({ ...prev, [t.id]: v }))
                      }
                    />
                  ))}
                </div>
              </Field>
              <NextButton onClick={() => setStep(3)} />
            </div>
          )}

          {/* Step 3 — Customize message + email preview */}
          {step === 3 && (
            <div className="flex flex-col gap-4 px-5 py-5">
              <div className="flex items-center justify-between">
                <Field label="Subject preview">
                  <span
                    className="bl-mono text-[12px]"
                    style={{ color: "var(--bl-text-muted)" }}
                  >
                    Auto-personalized per recipient
                  </span>
                </Field>
                <div
                  className="flex overflow-hidden rounded-full text-[11px]"
                  style={{ border: "1px solid var(--bl-border-strong)" }}
                >
                  {(["en", "es"] as const).map((opt) => {
                    const active = lang === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setLang(opt)}
                        className="px-3 py-1.5 transition-colors"
                        style={{
                          background: active ? "var(--bl-accent)" : "transparent",
                          color: active ? "#1a1208" : "var(--bl-text-muted)",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {opt === "en" ? "🇺🇸 English" : "🇪🇸 Español"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <EmailPreview email={email} lang={lang} />

              <NextButton onClick={() => setStep(4)} />
            </div>
          )}

          {/* Step 4 — Schedule + launch */}
          {step === 4 && (
            <div className="flex flex-col gap-4 px-5 py-5">
              <Field label="Send when">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: "today", label: "Today, 6:00 PM" },
                      { id: "tomorrow", label: "Tomorrow, 9:00 AM" },
                      { id: "custom", label: "Pick a date…" },
                    ] as const
                  ).map((opt) => (
                    <RadioPill
                      key={opt.id}
                      active={schedule === opt.id}
                      onClick={() => setSchedule(opt.id)}
                    >
                      <Calendar className="h-3 w-3" />
                      {opt.label}
                    </RadioPill>
                  ))}
                </div>
              </Field>
              <div
                className="rounded-md px-4 py-4"
                style={{
                  background: "rgba(156,216,110,0.08)",
                  border: "1px solid rgba(156,216,110,0.32)",
                }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="bl-eyebrow">Ready to launch</span>
                  <span
                    className="bl-mono text-[12px]"
                    style={{ color: "var(--bl-success)" }}
                  >
                    Bilingual · branded · {audienceCount} recipients
                  </span>
                </div>
                <p
                  className="mt-2 text-[13px]"
                  style={{ color: "var(--bl-text-muted)" }}
                >
                  Auto-personalized subject lines, English + Spanish copy,
                  Cristian&rsquo;s signature, sent from your reply-to address. Replies
                  land in your inbox.
                </p>
                <button className="bl-btn-primary mt-4">
                  <Send className="h-4 w-4" /> Launch campaign
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right rail — projection */}
        <aside className="flex flex-col gap-3">
          <ProjectionCard
            conversion={conversion}
            setConversion={setConversion}
            projection={projection}
            subscribersAtCare={subscribersAtCare}
          />
          <RoiCard projection={projection} />
        </aside>
      </div>
    </div>
  );
}

function TierCard({ tier, active }: { tier: Tier; active: boolean }) {
  const isCare = tier.id === "care";
  return (
    <div
      className="bl-card relative flex flex-col gap-3 px-5 py-5 transition-all"
      style={{
        background: isCare ? "var(--bl-bg-2)" : "var(--bl-bg)",
        border: isCare
          ? "1.5px solid var(--bl-accent)"
          : "1px solid var(--bl-border)",
        opacity: active ? 1 : 0.5,
        transform: isCare ? "translateY(-4px)" : "none",
      }}
    >
      {tier.mostPopular && (
        <span
          className="absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em]"
          style={{
            background: "var(--bl-accent)",
            color: "#1a1208",
            fontWeight: 600,
          }}
        >
          ★ Most Popular
        </span>
      )}
      <div className="flex items-center gap-2">
        <Trophy
          className="h-4 w-4"
          style={{
            color:
              tier.id === "guardian"
                ? "#FFD56A"
                : tier.id === "care"
                  ? "var(--bl-accent)"
                  : "rgba(245,239,230,0.45)",
          }}
        />
        <span className="bl-eyebrow">{tier.badge}</span>
      </div>
      <h3
        className="bl-serif text-[22px] leading-tight"
        style={{ color: "var(--bl-text)" }}
      >
        {tier.name}
      </h3>
      <div className="flex items-baseline gap-2">
        <span
          className="bl-mono text-[32px]"
          style={{
            color: isCare ? "var(--bl-accent)" : "var(--bl-text)",
          }}
        >
          ${tier.price}
        </span>
        <span
          className="text-[12px]"
          style={{ color: "var(--bl-text-faint)" }}
        >
          /yr
        </span>
      </div>
      <span className="text-[12px]" style={{ color: "var(--bl-text-muted)" }}>
        {tier.cadence}
      </span>
      <ul className="mt-2 flex flex-col gap-1.5">
        {tier.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-[12px]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            <Check
              className="mt-0.5 h-3 w-3 shrink-0"
              style={{ color: "var(--bl-success)" }}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {tier.recommendedFor && (
        <span
          className="mt-2 text-[10px] uppercase tracking-[0.14em]"
          style={{ color: "var(--bl-text-faint)" }}
        >
          Recommended for {tier.recommendedFor}
        </span>
      )}
    </div>
  );
}

function ProjectionCard({
  conversion,
  setConversion,
  projection,
  subscribersAtCare,
}: {
  conversion: number;
  setConversion: (v: number) => void;
  projection: ReturnType<typeof projectARR>;
  subscribersAtCare: number;
}) {
  return (
    <div
      className="bl-card-elevated p-5"
      style={{
        background:
          "linear-gradient(180deg, rgba(244,184,96,0.10) 0%, rgba(244,184,96,0.0) 60%)",
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles
          className="h-4 w-4"
          style={{ color: "var(--bl-accent)" }}
        />
        <span className="bl-eyebrow">Projection</span>
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <span className="bl-eyebrow-muted">Conversion rate</span>
        <input
          type="range"
          min={10}
          max={60}
          step={5}
          value={conversion}
          onChange={(e) => setConversion(Number(e.target.value))}
          className="bl-range w-full"
          aria-label="Conversion rate"
        />
        <div className="flex justify-between">
          <span
            className="bl-mono text-[12px]"
            style={{ color: "var(--bl-text-faint)" }}
          >
            10%
          </span>
          <span
            className="bl-mono text-[18px]"
            style={{ color: "var(--bl-accent)", fontWeight: 600 }}
          >
            {conversion}%
          </span>
          <span
            className="bl-mono text-[12px]"
            style={{ color: "var(--bl-text-faint)" }}
          >
            60%
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <BigNumber
          label="Projected new ARR"
          value={`$${projection.newARR.toLocaleString()}`}
          accent
        />
        <BigNumber
          label="First-month revenue"
          value={`$${projection.firstMonth.toLocaleString()}`}
        />
        <BigNumber
          label="Bright Care subscribers"
          value={`${subscribersAtCare}`}
        />
        <BigNumber
          label="Total subscribers"
          value={`${projection.subscribers}`}
        />
      </div>

      <p
        className="mt-3 text-[10px] leading-[1.5]"
        style={{ color: "var(--bl-text-faint)" }}
      >
        Based on industry benchmarks for FL low-voltage lighting maintenance
        plans (Beacon Outdoor, Landscape Lighting Pro). Default weighting:
        30% Basics · 50% Care · 20% Guardian.
      </p>
    </div>
  );
}

function RoiCard({ projection }: { projection: ReturnType<typeof projectARR> }) {
  const annualGladius = 4788;
  const roi = (projection.newARR / annualGladius).toFixed(1);
  return (
    <div className="bl-card p-4">
      <span className="bl-eyebrow">Year-1 ROI</span>
      <div
        className="bl-mono mt-1 text-[28px]"
        style={{ color: "var(--bl-success)" }}
      >
        {roi}×
      </div>
      <p
        className="mt-1 text-[11px] leading-[1.5]"
        style={{ color: "var(--bl-text-faint)" }}
      >
        Projected new ARR vs. Gladius Professional ($4,788/yr).
      </p>
    </div>
  );
}

function BigNumber({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="bl-eyebrow-muted">{label}</div>
      <div
        className="bl-mono mt-1 text-[22px]"
        style={{
          color: accent ? "var(--bl-accent)" : "var(--bl-text)",
          fontWeight: accent ? 600 : 400,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Stepper({
  current,
  onSelect,
}: {
  current: 1 | 2 | 3 | 4;
  onSelect: (n: 1 | 2 | 3 | 4) => void;
}) {
  const labels = ["Audience", "Tiers", "Message", "Schedule"];
  return (
    <div className="flex items-center gap-1.5">
      {labels.map((l, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4;
        const active = current === n;
        const done = current > n;
        return (
          <button
            key={l}
            onClick={() => onSelect(n)}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-colors"
            style={{
              background: active
                ? "rgba(244,184,96,0.16)"
                : "transparent",
              color: active
                ? "var(--bl-accent)"
                : done
                  ? "var(--bl-success)"
                  : "var(--bl-text-faint)",
              border: `1px solid ${
                active ? "rgba(244,184,96,0.5)" : "var(--bl-border)"
              }`,
            }}
          >
            <span
              className="bl-mono text-[10px]"
              style={{ fontWeight: 600 }}
            >
              {n}
            </span>
            {l}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="bl-eyebrow-muted">{label}</span>
      {children}
    </div>
  );
}

function RadioPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] transition-colors"
      style={{
        background: active ? "rgba(244,184,96,0.16)" : "rgba(0,0,0,0.18)",
        color: active ? "var(--bl-accent)" : "var(--bl-text-muted)",
        border: `1px solid ${active ? "rgba(244,184,96,0.5)" : "var(--bl-border)"}`,
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[13px]">
      <span
        className="flex h-4 w-4 items-center justify-center rounded"
        style={{
          background: checked ? "var(--bl-accent)" : "transparent",
          border: `1px solid ${checked ? "var(--bl-accent)" : "var(--bl-border-strong)"}`,
        }}
      >
        {checked && <Check className="h-3 w-3" style={{ color: "#1a1208" }} />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span style={{ color: "var(--bl-text)" }}>{label}</span>
    </label>
  );
}

function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end">
      <button onClick={onClick} className="bl-btn-primary">
        Next →
      </button>
    </div>
  );
}

function EmailPreview({
  email,
  lang,
}: {
  email: { from: string; replyTo: string; subject: string; body: string };
  lang: Lang;
}) {
  const sampleFirstName = "Mike";
  const sampleAge = "5";
  const subject = email.subject
    .replace("{{first_name}}", sampleFirstName)
    .replace("{{install_age}}", sampleAge);
  const body = email.body
    .replace(/{{first_name}}/g, sampleFirstName)
    .replace(/{{install_age}}/g, sampleAge);
  const cta = lang === "en" ? "See My Plan Options" : "Ver mis opciones de plan";

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{
        background: "var(--bl-bg)",
        border: "1px solid var(--bl-border-strong)",
      }}
    >
      <header
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(0,0,0,0.32)",
          borderBottom: "1px solid var(--bl-border)",
        }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{
            background: "rgba(244,184,96,0.18)",
            color: "var(--bl-accent)",
            fontWeight: 600,
          }}
        >
          <Mail className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-[12px]"
            style={{ color: "var(--bl-text)" }}
          >
            {email.from}
          </div>
          <div
            className="bl-mono truncate text-[10px]"
            style={{ color: "var(--bl-text-faint)" }}
          >
            reply-to: {email.replyTo}
          </div>
        </div>
      </header>
      <div className="px-5 py-5">
        <h4
          className="bl-serif text-[16px] leading-snug"
          style={{ color: "var(--bl-text)" }}
        >
          {subject}
        </h4>
        <pre
          className="mt-4 whitespace-pre-wrap text-[13px] leading-[1.6]"
          style={{
            color: "var(--bl-text-muted)",
            fontFamily: "inherit",
          }}
        >
          {body.replace(
            /\[See My Plan Options\]|\[Ver mis opciones de plan\]/,
            "",
          )}
        </pre>
        <button className="bl-btn-primary mt-4">
          {cta} →
        </button>
        <p
          className="mt-4 text-[10px]"
          style={{ color: "var(--bl-text-faint)" }}
        >
          Hero photo replaced with brightlightslandscapelighting.com gallery
          shot before final demo.
        </p>
      </div>
    </div>
  );
}
