import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Subscription, billing, acceptable-use, AI processing, and dispute terms for GladiusTurf customers.",
  alternates: { canonical: "/legal/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-pitch text-bone">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <Eyebrow tone="champagne">Legal</Eyebrow>
        <p className="mt-4 text-xs uppercase tracking-crest text-champagne-bright">
          Last updated: April 25, 2026
        </p>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
          Terms of Service
        </h1>

        <p className="mt-6 text-bone/75 leading-relaxed">
          These Terms of Service (&ldquo;Terms&rdquo;) form a binding agreement between
          you and Gladius Inc. (&ldquo;Gladius,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;)
          governing your use of GladiusTurf &mdash; the website at{" "}
          <strong>gladiusturf.com</strong>, the GladiusTurf web application, the
          Owner and Crew dashboards, the Homeowner Client Portal, and any related
          services we provide (together, the &ldquo;Service&rdquo;). Please read
          them. They are written in plain English on purpose.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">1. Acceptance of these terms</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          By clicking &ldquo;I agree,&rdquo; checking a box, signing an order form
          that references these Terms, or by simply using the Service, you agree to
          be bound by these Terms and by the{" "}
          <Link href="/legal/privacy" className="text-champagne-bright underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          . If you are accepting on behalf of a company, you represent that you
          have authority to bind that company.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          If you do not agree, do not use the Service.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">2. The service</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          GladiusTurf is software for landscape companies. It includes a customer
          and crew CRM, scheduling, dispatch, estimating, invoicing, payment
          collection, a Homeowner Client Portal, SMS/voice messaging, and
          AI-driven engines for lead grading, retention, and operations. The
          specific features available to you depend on your subscription tier.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          GladiusTurf is <em>not</em> a marketplace, a labor-leasing platform, a
          legal-advice service, or a regulated financial institution. We provide
          tooling. You operate your business.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">3. Account registration</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          You sign in through Clerk, our identity provider. You agree to:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>Be at least 18 years old.</li>
          <li>Provide accurate, current information &mdash; legal entity, billing address, contact email.</li>
          <li>Keep your credentials secret and not share them with anyone outside your business.</li>
          <li>Tell us promptly at <a href="mailto:security@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">security@gladiusturf.com</a> if you suspect unauthorized access.</li>
          <li>Be responsible for everything that happens under your account, including the actions of crew members and admins you invite.</li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl text-bone">4. Subscriptions, billing, and cancellation</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          GladiusTurf is sold on a subscription basis at the tier and price shown on{" "}
          <Link href="/pricing" className="text-champagne-bright underline-offset-4 hover:underline">
            /pricing
          </Link>{" "}
          or in your order form (Independent, Professional, or Enterprise). You may
          choose monthly or annual billing.
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            <strong>Auto-renewal</strong>: subscriptions renew automatically at the
            end of each billing period at the then-current price unless you cancel.
            We will send a renewal reminder before annual renewals.
          </li>
          <li>
            <strong>Payment</strong>: handled by Stripe. You authorize us, through
            Stripe, to charge your saved payment method for fees, taxes (collected
            via Stripe Tax), and any usage-based add-ons.
          </li>
          <li>
            <strong>Late payment</strong>: if a charge fails, we will retry and
            email you. If the account remains unpaid after 14 days, we may suspend
            access; after 60 days, we may terminate and delete the workspace per
            the retention rules in the Privacy Policy.
          </li>
          <li>
            <strong>Cancellation</strong>: you may cancel anytime from inside the
            workspace. Cancellation stops the next renewal; the current paid period
            runs out as scheduled.
          </li>
          <li>
            <strong>30-day money-back guarantee</strong>: for the Independent and
            Professional tiers, request a full refund within 30 days of your first
            paid charge by emailing{" "}
            <a href="mailto:founders@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">
              founders@gladiusturf.com
            </a>
            . No questions, no clawbacks.
          </li>
          <li>
            <strong>Enterprise</strong>: Enterprise customers are governed by their
            order form / MSA, which controls cancellation, refunds, and notice
            periods (typically 30 days&rsquo; written notice for material breach
            with cure rights).
          </li>
        </ul>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Outside the 30-day window, fees are non-refundable except where required
          by law or stated in your MSA.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">5. Acceptable use</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          You agree not to use the Service to:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            Send spam or any commercial message that violates the TCPA, CAN-SPAM,
            10DLC carrier rules, or equivalent laws. Outbound SMS and voice require
            valid opt-in. We reserve the right to cut off Twilio traffic that puts
            our messaging registrations at risk.
          </li>
          <li>Scrape, mass-export, or reverse-engineer the Service or its data, beyond what is necessary to use it normally.</li>
          <li>Resell, rent, sublicense, or white-label the Service to third parties without a written agreement.</li>
          <li>Harass, threaten, defame, or stalk any person through the Service&rsquo;s communications surfaces.</li>
          <li>Upload malware, attempt to break authentication, probe for vulnerabilities outside our published bug-bounty channel, or interfere with other tenants&rsquo; workspaces.</li>
          <li>Use the Service to violate any applicable law, including consumer-protection, employment, or fair-credit laws.</li>
          <li>Impersonate another person or company.</li>
          <li>Build a competing product using the Service or its data.</li>
        </ul>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We may suspend or terminate accounts that violate this section. Where
          we can, we will warn you first; where we cannot, we will explain after.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">6. Customer data</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          As between you and us, you own all data, content, files, photos,
          messages, and records you (or anyone using your account) put into the
          Service (&ldquo;Customer Data&rdquo;). We host and process Customer Data
          on your behalf to deliver the Service.
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            <strong>License to operate</strong>: you grant us the limited,
            non-exclusive license needed to host, copy, process, transmit, display,
            and back up Customer Data so we can run the Service for you.
          </li>
          <li>
            <strong>Export</strong>: you can export Customer Data in a portable
            format any time from inside the workspace. We will not gate exports
            behind retention or upsell schemes.
          </li>
          <li>
            <strong>Deletion</strong>: on termination, we follow the retention
            schedule in the Privacy Policy &mdash; 90-day export window, then
            deletion from primary systems with backup purge in the next cycle.
            Audit logs are retained for up to 7 years.
          </li>
          <li>
            <strong>Aggregated, de-identified data</strong>: we may use de-identified,
            aggregated statistics derived from Customer Data to improve and benchmark
            the product (e.g., median response times, model quality metrics). We
            will never re-identify it.
          </li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl text-bone">7. AI processing</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Several engines &mdash; LeadGrade, ToneRadar, Save Play, the Knowledge
          Engine, and others &mdash; process Customer Data through Anthropic Claude
          and OpenAI embeddings to produce summaries, recommendations, and routing
          decisions.
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            <strong>No training on your data</strong>: we use enterprise terms with
            both providers that prohibit training their public models on Customer
            Data and that operate on a zero-retention basis at the model level.
          </li>
          <li>
            <strong>Outputs are guidance, not advice</strong>: AI outputs are
            informational and operational suggestions. They are not legal,
            financial, medical, tax, employment, or licensed-professional advice,
            and you must use human judgment before acting on them &mdash; especially
            for pricing, contracts, terminations, and customer disputes.
          </li>
          <li>
            <strong>Per-engine opt-out</strong>: owners can disable any AI feature
            in <strong>Settings &rarr; AI &amp; Automation</strong>. Disabling an
            engine stops outbound text from leaving for the model provider.
          </li>
          <li>
            <strong>Model errors</strong>: AI can be wrong. You agree we are not
            liable for business decisions you make solely on AI output without
            human review.
          </li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl text-bone">8. Third-party services</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          The Service integrates with third parties that have their own terms.
          When you use the relevant feature, you also accept their terms for that
          service:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li><strong>Stripe</strong> &mdash; payments, subscriptions, Stripe Tax.</li>
          <li><strong>Twilio</strong> &mdash; SMS and voice (subject to 10DLC, TCPA, and carrier rules).</li>
          <li><strong>Resend</strong> &mdash; transactional email.</li>
          <li><strong>Clerk</strong> &mdash; authentication and identity.</li>
          <li><strong>Vercel</strong> &mdash; hosting and edge delivery.</li>
          <li><strong>Supabase</strong> &mdash; managed Postgres database.</li>
          <li><strong>Anthropic</strong> &mdash; Claude AI inference.</li>
          <li><strong>OpenAI</strong> &mdash; embeddings.</li>
          <li><strong>Plausible</strong> &mdash; cookieless analytics.</li>
        </ul>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We are not responsible for third-party outages or for changes those
          providers make to their services. We will choose competent providers
          and notify you of material sub-processor changes per the Privacy Policy.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">9. Intellectual property</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We own the Service: the software, the engines, the UI, the brand, the
          GladiusTurf and Gladius marks, and any improvements or feedback-driven
          changes we make. You receive a non-exclusive, non-transferable,
          revocable license to use the Service during your subscription, subject
          to these Terms.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          You own your Customer Data and any logos, brand marks, or templates you
          upload. If you submit feedback, ideas, or feature requests, you grant
          us a perpetual, royalty-free license to use them &mdash; we will not owe
          you anything if we ship something inspired by your suggestion.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">10. Disclaimers and warranties</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          The Service is provided <strong>&ldquo;as is&rdquo; and &ldquo;as available.&rdquo;</strong>{" "}
          We make commercially reasonable efforts to keep it running, secure, and
          accurate. Beyond that, to the maximum extent permitted by law, we
          disclaim all warranties &mdash; express, implied, or statutory &mdash;
          including merchantability, fitness for a particular purpose,
          non-infringement, and any warranty arising from course of dealing.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We commit to a written uptime SLA only on the Enterprise tier. On
          Independent and Professional, we will work hard, communicate during
          incidents, and post status updates &mdash; but there is no contractual
          uptime number tied to those tiers.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">11. Limitation of liability</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          To the maximum extent permitted by law:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            Neither party is liable for indirect, incidental, special,
            consequential, exemplary, or punitive damages, or for lost profits,
            lost revenue, lost goodwill, or loss of data.
          </li>
          <li>
            Our total aggregate liability under or related to these Terms is
            capped at the amount you paid us in the 12 months immediately before
            the event giving rise to the claim.
          </li>
        </ul>
        <p className="mt-4 text-bone/75 leading-relaxed">
          These limits apply regardless of legal theory (contract, tort, statute,
          or otherwise) and even if a remedy fails of its essential purpose. They
          do not apply to a party&rsquo;s indemnification obligations, breach of
          confidentiality, infringement of the other party&rsquo;s intellectual
          property, or amounts owed under § 4 (Subscriptions, Billing, and
          Cancellation).
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">12. Indemnification</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          <strong>You</strong> will defend, indemnify, and hold Gladius harmless
          from third-party claims arising out of: your Customer Data, your use of
          the Service in violation of these Terms or applicable law, your
          messaging practices (TCPA, CAN-SPAM, 10DLC), or your business
          activities (including disputes with your own customers, employees, or
          subcontractors).
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          <strong>We</strong> will defend, indemnify, and hold you harmless from
          third-party claims that the Service, as provided by us and used in
          accordance with these Terms, infringes a U.S. patent, copyright, or
          trademark. If such a claim is made, we may, at our option, modify the
          Service, obtain a license, or terminate the affected feature and refund
          fees prepaid for the unused portion.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Indemnification requires prompt written notice, reasonable cooperation,
          and sole control of defense and settlement (no settlement that admits
          fault or imposes obligations without consent).
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">13. Termination</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          You may terminate by canceling your subscription at any time. We may
          terminate or suspend immediately for material breach (including § 5,
          Acceptable Use), non-payment, or risk to the platform&rsquo;s
          security and stability. For non-material breach we will give written
          notice and a 30-day cure period.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          On termination: your right to use the Service ends, you keep a 90-day
          export window per the Privacy Policy, and any refund follows § 4. The
          sections that by their nature should survive termination &mdash;
          intellectual property, customer-data ownership, disclaimers,
          limitation of liability, indemnification, governing law, and these
          surviving-clauses rules &mdash; survive.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">14. Governing law and disputes</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          These Terms are governed by the laws of the State of Delaware, without
          regard to its conflict-of-laws rules. The U.N. Convention on Contracts
          for the International Sale of Goods does not apply.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          <strong>Informal resolution first.</strong> Before filing anything,
          email <a href="mailto:legal@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">legal@gladiusturf.com</a> with
          a description of the dispute. We will try to resolve it within 30 days.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          <strong>Binding arbitration.</strong> If informal resolution fails, any
          dispute arising out of or related to these Terms or the Service will be
          resolved by binding arbitration administered by JAMS under its
          Streamlined Arbitration Rules, seated in Wilmington, Delaware (or
          conducted virtually). The arbitrator&rsquo;s award may be entered in
          any court of competent jurisdiction.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          <strong>Carve-outs.</strong> Either party may bring claims in court for
          intellectual-property infringement, misuse of confidential information,
          or for injunctive or equitable relief. Either party may also bring an
          individual action in small-claims court if the dispute qualifies.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          <strong>Class-action waiver.</strong> Disputes must be brought in your
          individual capacity, not as a plaintiff or class member in any
          purported class, collective, or representative proceeding. The
          arbitrator may not consolidate claims and may not preside over any
          form of class action.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">15. Changes to these terms</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We may update these Terms. The &ldquo;Last updated&rdquo; date at the
          top reflects the most recent version. For material changes, we will
          email account owners at least 30 days before the change takes effect
          and post a notice in the product. If you do not agree with the change,
          you can cancel before the effective date and receive a pro-rated
          refund of any prepaid, unused fees. Continued use after the effective
          date means you accept the updated Terms.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">16. Miscellaneous</h2>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li><strong>Entire agreement.</strong> These Terms, the Privacy Policy, and any executed order form / MSA are the entire agreement and supersede prior agreements on the same subject.</li>
          <li><strong>Severability.</strong> If a provision is unenforceable, the rest stays in effect.</li>
          <li><strong>No waiver.</strong> Failure to enforce a provision is not a waiver.</li>
          <li><strong>Assignment.</strong> You may not assign these Terms without our written consent. We may assign in connection with a merger, acquisition, or sale of substantially all assets.</li>
          <li><strong>Force majeure.</strong> Neither party is liable for delays or failures caused by events outside reasonable control (natural disasters, war, government action, internet or upstream-provider outages).</li>
          <li><strong>Notices.</strong> Notices to us must go to <a href="mailto:legal@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">legal@gladiusturf.com</a>. Notices to you may be sent to the email on the account.</li>
          <li><strong>Independent contractors.</strong> The parties are independent contractors. No agency, partnership, or joint venture is created.</li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl text-bone">17. Contact</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          GladiusTurf is a product of Gladius Inc. For legal questions, contract
          execution, or DPA requests, email{" "}
          <a href="mailto:legal@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">
            legal@gladiusturf.com
          </a>
          . For everything else, email{" "}
          <a href="mailto:founders@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">
            founders@gladiusturf.com
          </a>
          . We reply within one business day.
        </p>
      </main>
      <Footer />
    </div>
  );
}
