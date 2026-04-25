import type { Metadata } from "next";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for GladiusTurf. Enterprise MSA + DPA available on request from legal@gladiusturf.com.",
  alternates: { canonical: "/legal/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-pitch text-bone">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <Eyebrow tone="champagne">Legal</Eyebrow>
        <h1 className="mt-4 font-serif text-5xl font-semibold tracking-[-0.02em] text-bone md:text-6xl">
          Terms of Service
        </h1>
        <div className="mt-6">
          <Pill tone="champagne">In preparation · 2026</Pill>
        </div>
        <div className="mt-10 space-y-6 text-base leading-[1.7] text-bone/75 md:text-lg">
          <p>
            The full GladiusTurf Terms of Service are being finalized alongside
            our founding-crew launch. They will cover subscription terms,
            per-crew billing, the 48-hour onboarding commitment, the
            export-anytime guarantee, acceptable use, uptime SLA, and the
            mutual indemnities crew owners and operators expect from a
            production landscaping platform.
          </p>
          <p>
            An enterprise-ready PDF MSA &mdash; including the Data Processing
            Addendum (DPA), Business Associate Addendum (where applicable),
            insurance certificates, and the SOC&nbsp;2 Type&nbsp;II progress
            letter &mdash; is available on request. It is the document we
            execute with multi-location operators, franchise networks, and
            municipal contractors during procurement.
          </p>
          <p>
            Email{" "}
            <a
              href="mailto:legal@gladiusturf.com"
              className="text-champagne-bright underline-offset-4 hover:underline"
            >
              legal@gladiusturf.com
            </a>{" "}
            and we will reply within one business day. Include your legal
            entity name, signing authority, and the crew count you intend to
            license so we can route the right packet to your team.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
