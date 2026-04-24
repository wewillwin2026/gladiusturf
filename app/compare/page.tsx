import type { Metadata } from "next";
import { ComparisonTable } from "@/components/comparison-table";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "GladiusTurf vs. Jobber, LMN, Service Autopilot, Aspire, Zentive. Flat per-crew subscription vs. a fragmented $1,400/mo stack.",
};

const DETAILED: {
  feature: string;
  gladius: string;
  others: string;
}[] = [
  {
    feature: "Quote Intercept (routed + SLA'd estimates)",
    gladius: "Built in — routed + escalated",
    others: "Manual assignment, no SLA",
  },
  {
    feature: "Applicator Shield (pesticide compliance)",
    gladius: "State-by-state, license watched",
    others: "Paper logs or nothing",
  },
  {
    feature: "Upsell Whisperer (property inspection scan)",
    gladius: "AI-driven, photo-backed proposals",
    others: "Not offered",
  },
  {
    feature: "Weather Pivot (storm re-routing)",
    gladius: "Automatic, client-facing",
    others: "Manual reschedule",
  },
  {
    feature: "Surplus Yard marketplace",
    gladius: "Post + sell leftover materials",
    others: "Not offered",
  },
  {
    feature: "Seats",
    gladius: "Unlimited per crew",
    others: "$29–$49 per user / mo",
  },
  {
    feature: "Migration",
    gladius: "Free, 48 hours, we pay overlap month",
    others: "Paid onboarding or self-serve",
  },
  {
    feature: "Contract length",
    gladius: "Month-to-month",
    others: "Annual common",
  },
];

export default function ComparePage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Compare
            </p>
            <h1 className="max-w-4xl font-serif text-display-md text-forest md:text-display-lg">
              The fragmented stack vs. one flat subscription.
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] leading-[1.6] text-stone">
              Most landscaping shops juggle seven tools — scheduling, CRM,
              chemical logging, payroll, two-way SMS, estimating, dispatch.
              Each with a per-user fee. GladiusTurf replaces the whole stack
              with one subscription and ships the engines no incumbent has.
            </p>
          </div>
        </section>

        <ComparisonTable />

        <section className="border-b border-[rgba(15,61,46,0.12)] bg-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Feature by feature
            </p>
            <h2 className="font-serif text-h2-md text-forest md:text-h2-lg">
              What the incumbent stack doesn&apos;t ship.
            </h2>
            <div className="mt-12 overflow-x-auto rounded-[12px] border border-[rgba(15,61,46,0.12)]">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="bg-paper text-left text-[12px] uppercase tracking-[0.12em] text-stone">
                    <th className="px-4 py-4 font-medium">Capability</th>
                    <th className="px-4 py-4 font-medium">GladiusTurf</th>
                    <th className="px-4 py-4 font-medium">Legacy stack</th>
                  </tr>
                </thead>
                <tbody>
                  {DETAILED.map((r) => (
                    <tr
                      key={r.feature}
                      className="border-t border-[rgba(15,61,46,0.08)] align-top"
                    >
                      <td className="px-4 py-5 text-[14px] font-medium text-forest">
                        {r.feature}
                      </td>
                      <td className="px-4 py-5 text-[14px] text-forest">
                        {r.gladius}
                      </td>
                      <td className="px-4 py-5 text-[14px] text-stone">
                        {r.others}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
