import type { Metadata } from "next";
import { ComparisonTable } from "@/components/comparison-table";
import { CtaBand } from "@/components/cta-band";
import { EnginesGrid } from "@/components/engines-grid";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { PricingSection } from "@/components/pricing-section";
import { QuoteBlock } from "@/components/quote-block";
import { StatRow } from "@/components/stat-row";

export const metadata: Metadata = {
  description:
    "Seven revenue engines for landscape crew owners. Recover six figures of leaked estimates, upsells, and referrals. Flat per-crew pricing. Not a CRM.",
};

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <StatRow />
        <EnginesGrid />
        <QuoteBlock />
        <ComparisonTable />
        <PricingSection />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
