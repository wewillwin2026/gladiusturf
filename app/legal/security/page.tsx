import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Security posture for GladiusTurf. Full overview is at /security; SOC 2 Type II progress letter available from legal@gladiusturf.com.",
  alternates: { canonical: "/legal/security" },
  robots: { index: true, follow: true },
};

export default function LegalSecurityPage() {
  return (
    <div className="min-h-screen bg-pitch text-bone">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <Eyebrow tone="champagne">Legal</Eyebrow>
        <h1 className="mt-4 font-serif text-5xl font-semibold tracking-[-0.02em] text-bone md:text-6xl">
          Security
        </h1>
        <div className="mt-6">
          <Pill tone="champagne">See also · /security</Pill>
        </div>
        <div className="mt-10 space-y-6 text-base leading-[1.7] text-bone/75 md:text-lg">
          <p>
            Our full security overview &mdash; multi-tenant Postgres
            row-level-security, Clerk authentication, Stripe-managed PCI scope,
            TCPA compliance, and the SOC&nbsp;2 Type&nbsp;II program &mdash;
            lives at{" "}
            <Link
              href="/security"
              className="text-champagne-bright underline-offset-4 hover:underline"
            >
              /security
            </Link>
            . Start there for the architecture, the principles, and the
            sub-processor list.
          </p>
          <p>
            For procurement and vendor-review teams: an enterprise-ready
            packet &mdash; SOC&nbsp;2 Type&nbsp;II progress letter, penetration
            test summary, DPA, sub-processor register, and incident response
            plan &mdash; is available on request.
          </p>
          <p>
            Email{" "}
            <a
              href="mailto:legal@gladiusturf.com"
              className="text-champagne-bright underline-offset-4 hover:underline"
            >
              legal@gladiusturf.com
            </a>{" "}
            and we will reply within one business day.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
