import {
  AlertTriangle,
  CheckCircle2,
  Globe2,
  Languages,
  ShieldAlert,
  Star,
} from "lucide-react";
import {
  BRAND,
  REVIEW_VELOCITY,
  SPAM_REVIEWS,
} from "@/lib/demo-data/bright-lights";

export const dynamic = "force-dynamic";

export default function ReviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="bl-eyebrow-muted">Reputation engine</span>
        <h1
          className="bl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          {BRAND.reviewCount} reviews. {BRAND.reviewStars} stars. Zero on autopilot — yet.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--bl-text-muted)" }}>
          Your Google profile is bulletproof. Your own website&rsquo;s &ldquo;Latest
          Reviews&rdquo; section is full of SEO spam. Gladius fixes both: every job
          asks for a review in the customer&rsquo;s preferred language; the spam
          gets flagged for moderation.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="bl-card px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="bl-eyebrow">Lifetime · Google</span>
            <span
              className="bl-mono text-[11px]"
              style={{ color: "var(--bl-text-faint)" }}
            >
              5★ · 171 reviews
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <Star
              className="h-7 w-7"
              style={{ color: "var(--bl-accent)", fill: "var(--bl-accent)" }}
            />
            <span
              className="bl-mono text-[44px] leading-none"
              style={{ color: "var(--bl-text)" }}
            >
              {BRAND.reviewStars.toFixed(1)}
            </span>
            <span
              className="text-[12px]"
              style={{ color: "var(--bl-text-faint)" }}
            >
              average across {BRAND.reviewCount} reviews
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline justify-between">
              <span className="bl-eyebrow-muted">Monthly review velocity</span>
              <span
                className="bl-mono text-[11px]"
                style={{ color: "var(--bl-success)" }}
              >
                Trending up
              </span>
            </div>
            <Sparkline data={REVIEW_VELOCITY} />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Mini label="Promoters" value="100%" tone="success" />
            <Mini label="Avg. response" value="<24h" />
            <Mini label="Bilingual sends" value="EN + ES" />
          </div>
        </div>

        <div className="bl-card px-5 py-5">
          <div className="flex items-center gap-2">
            <Languages
              className="h-4 w-4"
              style={{ color: "var(--bl-accent)" }}
            />
            <span className="bl-eyebrow">Auto-ask flow</span>
          </div>
          <p
            className="mt-3 text-[13px] leading-[1.55]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            After every completed job, Gladius sends a review request — in the
            customer&rsquo;s preferred language — within 24 hours. No manual
            asks, no embarrassed silence.
          </p>
          <ol className="mt-4 flex flex-col gap-2.5">
            {[
              "Job marked complete (mobile or office)",
              "AI drafts thank-you note · EN or ES",
              "Cristian or Felipe approves with one tap",
              "Customer gets a Google review link · 24-hr SLA",
            ].map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-3 text-[12px]"
                style={{ color: "var(--bl-text)" }}
              >
                <span
                  className="bl-mono flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]"
                  style={{
                    background: "rgba(244,184,96,0.18)",
                    color: "var(--bl-accent)",
                    fontWeight: 600,
                  }}
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="bl-card overflow-hidden"
        style={{
          background: "rgba(232,95,95,0.06)",
          border: "1px solid rgba(232,95,95,0.32)",
        }}
      >
        <header
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(232,95,95,0.32)" }}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert
              className="h-4 w-4"
              style={{ color: "var(--bl-alert)" }}
            />
            <span className="bl-eyebrow" style={{ color: "var(--bl-alert)" }}>
              Spam detected on your own site
            </span>
          </div>
          <button className="bl-btn-primary">
            Auto-moderate {SPAM_REVIEWS.length}
          </button>
        </header>
        <div className="px-5 py-4">
          <p className="text-[13px]" style={{ color: "var(--bl-text-muted)" }}>
            Gladius watches{" "}
            <span className="bl-mono">{BRAND.website}/reviews</span> and flags
            comments that match SEO-spam, bot-gibberish, or off-topic
            promotional patterns. One click hides them from your public site
            until you approve.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {SPAM_REVIEWS.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-md px-3 py-3"
                style={{ background: "rgba(0,0,0,0.18)" }}
              >
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: "var(--bl-alert)" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="bl-mono text-[12px]"
                      style={{ color: "var(--bl-text)" }}
                    >
                      {s.author}
                    </span>
                    <span
                      className="bl-pill bl-pill-warn"
                      style={{ fontSize: 9 }}
                    >
                      {s.flagged}
                    </span>
                  </div>
                  <p
                    className="mt-1 text-[12px] italic leading-[1.5]"
                    style={{ color: "var(--bl-text-muted)" }}
                  >
                    &ldquo;{s.excerpt}&rdquo;
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="bl-card flex items-start gap-4 p-5"
        style={{
          background: "rgba(244,184,96,0.06)",
          border: "1px solid rgba(244,184,96,0.32)",
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          style={{
            background: "rgba(244,184,96,0.16)",
            color: "var(--bl-accent)",
          }}
        >
          <Globe2 className="h-5 w-5" />
        </div>
        <div>
          <h3
            className="bl-serif text-[18px]"
            style={{ color: "var(--bl-text)" }}
          >
            300+ reviews by next year — the math is just consistency.
          </h3>
          <p
            className="mt-2 text-[13px] leading-[1.55]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            171 today. ~10 jobs/wk × 60% review rate × 52 weeks ≈ 312 added.
            Auto-asked, bilingual, branded. You&rsquo;re still the same crew
            doing the same work — the system handles the follow-through.
          </p>
        </div>
      </section>
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div
      className="rounded-md px-3 py-2"
      style={{
        background: "rgba(0,0,0,0.18)",
        border: "1px solid var(--bl-border)",
      }}
    >
      <div className="bl-eyebrow-muted">{label}</div>
      <div
        className="bl-mono mt-1 text-[14px]"
        style={{
          color: tone === "success" ? "var(--bl-success)" : "var(--bl-text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count));
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.count / max) * 100;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="mt-3" style={{ height: 96 }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="bl-spark-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--bl-accent)" stopOpacity="0.4" />
            <stop offset="1" stopColor="var(--bl-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={`0,100 ${points} 100,100`}
          fill="url(#bl-spark-grad)"
          stroke="none"
        />
        <polyline
          points={points}
          fill="none"
          stroke="var(--bl-accent)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em]"
        style={{ color: "var(--bl-text-faint)" }}
      >
        {data.map((d) => (
          <span key={d.month}>
            {d.month} · <CheckCircle2 className="inline h-2.5 w-2.5" /> {d.count}
          </span>
        ))}
      </div>
    </div>
  );
}
