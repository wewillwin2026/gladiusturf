import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";

export const metadata: Metadata = {
  title: "Data Processing Agreement",
  description:
    "GladiusTurf's processor obligations when handling tenant customer data — sub-processor list, breach notification, deletion, and audit rights.",
  alternates: { canonical: "/legal/dpa" },
  robots: { index: true, follow: true },
};

export default function DpaPage() {
  return (
    <div className="min-h-screen bg-pitch text-bone">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <Eyebrow tone="champagne">Legal</Eyebrow>
        <p className="mt-4 text-xs uppercase tracking-crest text-champagne-bright">
          Last updated: May 7, 2026
        </p>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
          Data Processing Agreement
        </h1>
        <div className="mt-6">
          <Pill tone="champagne">Read alongside the Terms + Privacy Policy</Pill>
        </div>

        <p className="mt-8 text-bone/75 leading-relaxed">
          This Data Processing Agreement (&ldquo;DPA&rdquo;) supplements the
          GladiusTurf{" "}
          <Link
            href="/legal/terms"
            className="text-champagne-bright underline-offset-4 hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            className="text-champagne-bright underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>{" "}
          and applies whenever you (the &ldquo;Customer&rdquo;) instruct
          Gladius Inc. (&ldquo;Gladius&rdquo;) to process Personal Data on your
          behalf through the GladiusTurf service.
        </p>

        <p className="mt-4 text-bone/75 leading-relaxed">
          Customer is the data <strong>controller</strong>. Gladius is the data{" "}
          <strong>processor</strong>. Gladius will only process Personal Data
          per Customer&rsquo;s documented instructions, the Terms, this DPA,
          and applicable law.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">
          1. Scope and roles
        </h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Customer warrants that it has lawful basis (consent, contract, or
          legitimate interest) to upload, transmit, or instruct Gladius to
          process the Personal Data of its end customers (homeowners,
          employees, prospects). Gladius does not independently determine the
          purposes of that processing.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">
          2. Categories of data + data subjects
        </h2>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            <strong>End customer (homeowner) data:</strong> name, email, phone,
            service address, property notes, photos, scheduled jobs, invoice
            history, recorded messages.
          </li>
          <li>
            <strong>Employee / crew data:</strong> name, role, work email,
            phone, schedule, certifications. Not SSN or bank routing — those
            are not collected until a payroll integration ships.
          </li>
          <li>
            <strong>Prospect data:</strong> any lead or quote information
            uploaded or captured through GladiusTurf.
          </li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl text-bone">
          3. Sub-processors
        </h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Customer authorizes Gladius to engage the following sub-processors.
          Material additions or substitutions will be announced 30 days in
          advance via email + this page; Customer may object and (if Gladius
          cannot accommodate) terminate the affected service.
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            <strong>Vercel Inc.</strong> — application hosting, CDN, edge
            middleware. United States.
          </li>
          <li>
            <strong>Supabase Inc.</strong> — Postgres database, authentication
            sub-system, file storage. United States.
          </li>
          <li>
            <strong>Anthropic, PBC</strong> — large language model inference
            for AI-assisted features (Ask Gladius, Quote Drafter). Per
            Anthropic&rsquo;s commercial terms, prompts are not used to train
            their models. United States.
          </li>
          <li>
            <strong>Resend</strong> — transactional and marketing email
            delivery. United States.
          </li>
          <li>
            <strong>Stripe Inc.</strong> — payment processing. Card data is
            tokenized at the browser and never touches Gladius infrastructure.
            United States.
          </li>
          <li>
            <strong>Twilio Inc.</strong> — SMS and voice (when enabled by
            Customer). United States.
          </li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl text-bone">
          4. Security measures
        </h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Gladius implements technical and organizational measures appropriate
          to the risk of processing, including:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            Encryption in transit (TLS 1.2+) and at rest (Supabase-managed AES
            on Postgres + storage).
          </li>
          <li>
            Tenant scoping enforced at the application layer; database-level
            row-level-security policies are present and migration to RLS as
            primary boundary is on the active engineering roadmap.
          </li>
          <li>
            Authentication via signed magic-link tokens (HMAC-SHA256, 15-minute
            TTL). Session cookies are HttpOnly + Secure.
          </li>
          <li>
            Regular dependency scanning, secret rotation, and pre-deployment
            review.
          </li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl text-bone">
          5. Breach notification
        </h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          If Gladius confirms a Personal Data breach affecting Customer&rsquo;s
          workspace, Gladius will notify Customer without undue delay and in
          any case within <strong>72 hours</strong> of confirmation. The
          notification will describe the nature of the breach, the categories
          and approximate number of records affected, the likely consequences,
          and the measures taken or proposed to address it.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">
          6. Deletion and return of data
        </h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Customer may export its workspace data via the in-product export, the
          API, or by emailing{" "}
          <a
            href="mailto:legal@gladiusturf.com"
            className="text-champagne-bright underline-offset-4 hover:underline"
          >
            legal@gladiusturf.com
          </a>
          .
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          On termination of the underlying agreement, Gladius will delete or
          anonymize Customer Personal Data within 90 days, except where
          retention is required by law (tax, anti-fraud, dispute resolution).
          Backups roll off within 90 days of the deletion request.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">
          7. International transfers
        </h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          All sub-processors above operate United States infrastructure. If
          Customer or its end customers are located outside the U.S., Gladius
          relies on Standard Contractual Clauses (or equivalent transfer
          mechanisms) where required. If you are an EU/UK Customer and need a
          countersigned SCC addendum, request it at{" "}
          <a
            href="mailto:legal@gladiusturf.com"
            className="text-champagne-bright underline-offset-4 hover:underline"
          >
            legal@gladiusturf.com
          </a>
          .
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">
          8. Audit rights
        </h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Customer may request, no more than once per year, a written summary
          of Gladius&rsquo;s security posture (controls, sub-processor
          register, incident log) sufficient to demonstrate compliance with
          this DPA. On-site audit rights are not granted; certifications and
          third-party reports (when available) substitute.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">9. Contact</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Email{" "}
          <a
            href="mailto:legal@gladiusturf.com"
            className="text-champagne-bright underline-offset-4 hover:underline"
          >
            legal@gladiusturf.com
          </a>{" "}
          for any DPA-related question, sub-processor objection, breach report,
          or counter-signature request. We respond within one business day.
        </p>

        <p className="mt-12 text-xs text-bone/50 leading-relaxed">
          This DPA is provided as a baseline. Enterprise Customers may request
          a counter-signed copy with bespoke terms — email{" "}
          <a
            href="mailto:legal@gladiusturf.com"
            className="text-champagne-bright underline-offset-4 hover:underline"
          >
            legal@gladiusturf.com
          </a>
          .
        </p>
      </main>
      <Footer />
    </div>
  );
}
