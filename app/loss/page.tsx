import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { LossCalculator } from "@/components/loss-calculator";

export const metadata: Metadata = {
  title: "Loss Calculator — What your current stack is costing you",
  description:
    "Type your crew count + average ticket. See exactly what last year leaked through your current stack — quote by quote, late invoice by late invoice.",
  alternates: { canonical: "/loss" },
  openGraph: {
    title: "Loss Calculator — What your current stack is costing you",
    description:
      "Type your crew count + average ticket. See exactly what last year leaked through your current stack — quote by quote, late invoice by late invoice.",
  },
};

export default function LossPage() {
  return (
    <>
      <Nav />
      <main>
        <LossCalculator />
      </main>
      <Footer />
    </>
  );
}
