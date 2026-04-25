import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { RoiCalculator } from "@/components/roi-calculator";

export const metadata: Metadata = {
  title: "ROI Calculator — Run the math on your shop",
  description:
    "Type your crew count, average ticket, monthly inquiries. See exactly what GladiusTurf recovers per year — Quote Intercept, The FollowUp, Save Play, Referral Radar — and how fast it pays back at $397, $997, or $2,997/mo per crew.",
  alternates: { canonical: "/roi" },
  openGraph: {
    title: "ROI Calculator — Run the math on your shop",
    description:
      "Type your crew count + average ticket. See projected annual recovery + payback period at every tier.",
  },
};

export default function RoiPage() {
  return (
    <>
      <Nav />
      <main>
        <RoiCalculator />
      </main>
      <Footer />
    </>
  );
}
