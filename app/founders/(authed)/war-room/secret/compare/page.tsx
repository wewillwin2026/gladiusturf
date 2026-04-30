import { Crown, ShieldCheck, Swords, X } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusPill } from "@/components/app/ui/StatusPill";

export const dynamic = "force-dynamic";

type Battle = {
  competitor: string;
  pricing: string;
  pricingNote: string;
  weakness: string[];
  complaint: string;
  weWin: string[];
  badge: "ServiceTitan" | "Aspire" | "SA" | "RealGreen" | "Jobber" | "Hatch" | "FieldRoutes";
};

const BATTLES: Battle[] = [
  {
    competitor: "ServiceTitan",
    pricing: "$300–$400 / user / mo",
    pricingNote: "+ $5K–$25K implementation. 3-year contract typical.",
    weakness: [
      "Built for HVAC/plumbing — not landscape",
      "No quote-via-satellite measurement",
      "Onboarding takes 60–120 days",
    ],
    complaint:
      "&ldquo;Took 4 months to get our routes working. We migrated off in Q3.&rdquo; — G2 review · 2-star",
    weWin: [
      "48-hour migration with founders on the call",
      "AI Quote Drafter bundled, not bolt-on",
      "Per-crew flat pricing",
    ],
    badge: "ServiceTitan",
  },
  {
    competitor: "Aspire",
    pricing: "$1,000–$2,500 / mo / shop",
    pricingNote: "Tiered by revenue. Contracts annual.",
    weakness: [
      "No native AI quoting (Deep Lawn add-on $499/mo)",
      "Reporting requires consultant",
      "Mobile app is read-mostly",
    ],
    complaint:
      "&ldquo;Reports are powerful but we needed a paid consultant to build them.&rdquo;",
    weWin: [
      "Reports tab works on day one",
      "AI Quote Drafter + voice BDC included",
      "Cmd-K spine — every action one keystroke",
    ],
    badge: "Aspire",
  },
  {
    competitor: "Service Autopilot",
    pricing: "$249 / mo Pro · $499 add-on for AI",
    pricingNote: "Per-shop, separate AI surcharge.",
    weakness: [
      "Deep Lawn AI quote module is an extra $499/mo",
      "Routing engine slower than OptimoRoute",
      "UI looks like 2014",
    ],
    complaint:
      "&ldquo;Paying twice for AI features that should be standard.&rdquo;",
    weWin: [
      "Bundled AI in Professional tier — no extras",
      "Modern Linear-grade UX, dark + light themes",
      "Save Play retention engine — competitor doesn&rsquo;t have it",
    ],
    badge: "SA",
  },
  {
    competitor: "RealGreen",
    pricing: "$1,200 / mo + setup",
    pricingNote: "Mostly mid-Atlantic lawn care market.",
    weakness: [
      "Windows-only desktop legacy software",
      "No native iOS/Android crew app",
      "Sunsetting on-prem in 2026",
    ],
    complaint:
      "&ldquo;We can&rsquo;t see today&rsquo;s schedule from the truck. It&rsquo;s on a desktop in the office.&rdquo;",
    weWin: [
      "PWA-grade mobile that works on the truck",
      "Cloud-native — Vercel + Supabase, zero servers to babysit",
      "Same UI for the crew lead and the owner",
    ],
    badge: "RealGreen",
  },
  {
    competitor: "Jobber",
    pricing: "$129–$349 / mo / company",
    pricingNote: "All-in for &lt;5 crew shops.",
    weakness: [
      "Designed for solo trades, not multi-crew ops",
      "No territory or route-density analytics",
      "No outbound BDC engine",
    ],
    complaint:
      "&ldquo;Outgrew Jobber at crew #4 — couldn&rsquo;t see crew profitability.&rdquo;",
    weWin: [
      "Routes engine with revenue-per-mile ranking",
      "GladiusBDC voice engine bundled into Pro",
      "Per-crew margin in Reports",
    ],
    badge: "Jobber",
  },
  {
    competitor: "Hatch",
    pricing: "$1,200 / mo / company",
    pricingNote: "Outbound BDC point solution.",
    weakness: [
      "Doesn&rsquo;t know your CRM context",
      "No quote, no schedule, no invoicing",
      "Customers say it&rsquo;s a glorified Twilio wrapper",
    ],
    complaint:
      "&ldquo;Hatch sequences fired even after the customer already booked. Embarrassing.&rdquo;",
    weWin: [
      "BDC sees the same Save Play / Quote / Invoice context as the rest of the app",
      "No false outreach — engines coordinate",
      "Bundled at $499/mo (vs Hatch standalone)",
    ],
    badge: "Hatch",
  },
  {
    competitor: "FieldRoutes",
    pricing: "$1,800–$3,200 / mo",
    pricingNote: "Per-route pricing scales fast.",
    weakness: [
      "Pest-control–first; landscape is an afterthought",
      "Poor satellite-measurement support",
      "Heavy implementation overhead",
    ],
    complaint:
      "&ldquo;Their support told us &lsquo;you&rsquo;re not our ICP&rsquo; — politely.&rdquo;",
    weWin: [
      "Landscape-native data model",
      "Mapbox-based satellite integration shipped",
      "Founders run every demo and migration",
    ],
    badge: "FieldRoutes",
  },
];

export default function SecretComparePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Founders Only"
        title="Secret · Compare"
        subtitle="Live battle cards. Use these in calls. Editable from Supabase once you outgrow this seed."
        actions={
          <StatusPill tone="warning">
            <Swords className="h-3 w-3" />
            {BATTLES.length} competitors mapped
          </StatusPill>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {BATTLES.map((b) => (
          <section key={b.competitor} className="g-card p-5 flex flex-col gap-3">
            <header className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                  vs.
                </div>
                <h3 className="text-g-text font-medium">{b.competitor}</h3>
              </div>
              <div className="text-right">
                <div className="font-mono text-[14px] text-g-warning">
                  {b.pricing}
                </div>
                <div className="text-[10px] text-g-text-faint max-w-[180px]">
                  {b.pricingNote}
                </div>
              </div>
            </header>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint mb-1.5">
                Where they break
              </div>
              <ul className="flex flex-col gap-1">
                {b.weakness.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12px] text-g-text-muted"
                  >
                    <X className="h-3 w-3 text-g-danger mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <blockquote
              className="rounded-md border border-g-border-subtle bg-g-surface-2/40 px-3 py-2 text-[12px] text-g-text-muted italic"
              dangerouslySetInnerHTML={{ __html: b.complaint }}
            />

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-g-accent mb-1.5 inline-flex items-center gap-1">
                <Crown className="h-3 w-3" />
                How we win
              </div>
              <ul className="flex flex-col gap-1">
                {b.weWin.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12px] text-g-text"
                  >
                    <ShieldCheck className="h-3 w-3 text-g-accent mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
