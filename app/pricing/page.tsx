import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { PricingSection } from "@/components/pricing-section";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "$397 Independent / $997 Professional / $2,997 Enterprise. Flat per crew. Unlimited seats. No per-user math.",
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "What counts as a crew?",
    a: "One mobile unit that leaves your yard in the morning. A truck, a trailer, and a route. If you split a crew in half for two trucks, that's two.",
  },
  {
    q: "What if I have more people on a crew than I thought?",
    a: "Everyone on the crew gets a seat. Unlimited. We charge per crew, not per person, because you shouldn't be punished for putting a laborer on the app.",
  },
  {
    q: "Does this replace QuickBooks?",
    a: "No. GladiusTurf feeds QuickBooks. We replace Jobber / LMN / Service Autopilot, not the books.",
  },
  {
    q: "Do I have to sign a contract?",
    a: "No annual contract. Month-to-month. Cancel any time. We pay for your final month with your old vendor during the switch.",
  },
  {
    q: "What if I'm on Aspire?",
    a: "Aspire customers get priority migration and a 45-day pilot at Professional pricing. Start a demo and mention Aspire.",
  },
  {
    q: "Is there a free trial?",
    a: "14-day pilot at Professional tier. No card required to start. If you don't see a dollar outcome by day 14, we refund any setup time we invoiced.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Pricing
            </p>
            <h1 className="max-w-4xl font-serif text-display-md text-forest md:text-display-lg">
              Flat per crew. Unlimited seats. No per-user math.
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] leading-[1.6] text-stone">
              You already pay $1,400+ a month for a stack of seven tools. We
              replace it with one subscription. Numbers below.
            </p>
          </div>
        </section>

        <PricingSection />

        <section className="border-b border-[rgba(15,61,46,0.12)] bg-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              ROI in one line
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              If we save one dying estimate a week, we pay for the year.
            </h2>
            <p className="mt-8 max-w-2xl text-[17px] leading-[1.6] text-stone">
              Average estimate in landscaping: $1,800. Average shop loses
              18–22 of them a month. One recovered quote a week covers
              Professional tier for a year. Everything else compounds.
            </p>
          </div>
        </section>

        <section className="border-b border-[rgba(15,61,46,0.12)] bg-paper">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Common questions
            </p>
            <h2 className="font-serif text-h2-md text-forest md:text-h2-lg">
              Pricing FAQ
            </h2>

            <dl className="mt-12 flex flex-col divide-y divide-[rgba(15,61,46,0.12)]">
              {FAQ.map((f) => (
                <div key={f.q} className="py-6">
                  <dt className="text-[17px] font-medium text-forest">
                    {f.q}
                  </dt>
                  <dd className="mt-3 max-w-3xl text-[16px] leading-[1.65] text-stone">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
