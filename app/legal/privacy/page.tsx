import type { Metadata } from "next";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy practices for GladiusTurf. Enterprise-ready PDF available on request from legal@gladiusturf.com.",
  alternates: { canonical: "/legal/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-pitch text-bone">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <Eyebrow tone="champagne">Legal</Eyebrow>
        <h1 className="mt-4 font-serif text-5xl font-semibold tracking-[-0.02em] text-bone md:text-6xl">
          Privacy Policy
        </h1>
        <div className="mt-6">
          <Pill tone="champagne">In preparation · 2026</Pill>
        </div>
        <div className="mt-10 space-y-6 text-base leading-[1.7] text-bone/75 md:text-lg">
          <p>
            The full GladiusTurf Privacy Policy is being prepared for public
            release alongside our founding-crew launch. It will cover what data
            we collect from crew owners, foremen, and homeowners; how we store
            and process it; the sub-processors we use (Stripe, Twilio, Resend,
            Anthropic, Vercel, Supabase); and the rights you have to export,
            correct, or delete your data at any time.
          </p>
          <p>
            An enterprise-ready PDF version of the current policy &mdash;
            including the Data Processing Addendum (DPA), sub-processor
            register, and SOC&nbsp;2 Type&nbsp;II progress letter &mdash; is
            available on request. It is the same document we send to insurance
            carriers, multi-location operators, and procurement teams during
            vendor review.
          </p>
          <p>
            Email{" "}
            <a
              href="mailto:legal@gladiusturf.com"
              className="text-champagne-bright underline-offset-4 hover:underline"
            >
              legal@gladiusturf.com
            </a>{" "}
            and we will reply within one business day. If you have an active
            data-subject request &mdash; export, deletion, or access &mdash;
            include the workspace name and the email on the account and we
            will fulfill it inside the seven-day SLA.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
