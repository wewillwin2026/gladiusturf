import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GladiusTurf collects, uses, shares, and protects information for landscape companies and the homeowners they serve.",
  alternates: { canonical: "/legal/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-pitch text-bone">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <Eyebrow tone="champagne">Legal</Eyebrow>
        <p className="mt-4 text-xs uppercase tracking-crest text-champagne-bright">
          Last updated: April 25, 2026
        </p>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-6 text-bone/75 leading-relaxed">
          GladiusTurf is a software product built by Gladius Inc. (&ldquo;Gladius,&rdquo;
          &ldquo;we,&rdquo; &ldquo;us&rdquo;). This Privacy Policy explains what we collect,
          why we collect it, who we share it with, and the rights you have over your data.
          It applies to <strong>gladiusturf.com</strong>, the GladiusTurf web app,
          the Owner/Crew dashboards, and the Homeowner Client Portal.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We are based in the United States and operate under U.S. law. If you are reading
          this from outside the U.S., please review the &ldquo;International Users&rdquo;
          section before continuing to use the service.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">1. Who this policy covers</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          GladiusTurf has two kinds of users, and this policy speaks to both:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            <strong>Owners and dealers</strong> &mdash; the landscape companies, crew
            owners, and operators who subscribe to GladiusTurf and use it to run their
            business.
          </li>
          <li>
            <strong>End users</strong> &mdash; the homeowners and property owners who
            interact with a GladiusTurf-powered company through the Client Portal,
            email, SMS, or voice.
          </li>
        </ul>
        <p className="mt-4 text-bone/75 leading-relaxed">
          When an owner uploads or creates records about a homeowner, the owner is the
          controller of that data and Gladius is the processor. We process homeowner
          data under the owner&rsquo;s instructions, set out in their subscription
          agreement and this policy.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">2. Information we collect</h2>

        <h3 className="mt-8 font-serif text-lg text-bone">Owner / dealer information</h3>
        <p className="mt-4 text-bone/75 leading-relaxed">
          When you sign up for or operate a GladiusTurf workspace, we collect:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            <strong>Identity and contact</strong>: legal entity name, DBA, business
            address, owner/admin name, work email, work phone.
          </li>
          <li>
            <strong>Account credentials</strong>: handled by Clerk &mdash; we receive
            user IDs and session tokens but never your raw password.
          </li>
          <li>
            <strong>Billing</strong>: tier, billing cadence, last four digits of the
            card, billing address, tax IDs. Card numbers and bank details are entered
            directly into Stripe and never touch our servers.
          </li>
          <li>
            <strong>Crew and employee records</strong>: names, roles, work email and
            phone, route assignments, and any custom fields you configure.
          </li>
          <li>
            <strong>Customer and job records you upload</strong>: anything you put into
            the system &mdash; spreadsheets, notes, photos, voice memos, scheduled jobs,
            estimates, invoices, payment events.
          </li>
          <li>
            <strong>Product usage</strong>: pages viewed, features used, errors
            encountered, IP address, browser, device, and approximate location derived
            from IP.
          </li>
        </ul>

        <h3 className="mt-8 font-serif text-lg text-bone">End user / homeowner information</h3>
        <p className="mt-4 text-bone/75 leading-relaxed">
          When a landscape company uses GladiusTurf to manage your account or send you
          communications, we may process:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>Name, email address, phone number.</li>
          <li>Property address and any access notes you or your provider record.</li>
          <li>
            Service history, scheduled jobs, work-order notes, photos, and any messages
            exchanged through the portal, email, or SMS.
          </li>
          <li>
            Payment information (entered into Stripe), payment history, and
            subscription/recurring service preferences.
          </li>
          <li>
            Client Portal preferences such as preferred contact channel, language, and
            notification settings.
          </li>
        </ul>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Homeowners: if you want to access, correct, or delete your data and you
          contracted with a landscape company that uses GladiusTurf, please reach out
          to that company first &mdash; they are the controller. If they cannot help,
          email <a href="mailto:legal@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">legal@gladiusturf.com</a> and
          we will route the request.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">3. How we use information</h2>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            <strong>Deliver the product</strong>: provision your workspace, sync jobs,
            send invoices, run the Client Portal, route SMS and voice through Twilio,
            and process payments through Stripe.
          </li>
          <li>
            <strong>Communicate with you</strong>: transactional email via Resend
            (receipts, password resets, system alerts), product updates, and customer
            support replies. Marketing email is opt-in and includes an unsubscribe link
            in every message.
          </li>
          <li>
            <strong>AI processing</strong>: a subset of the engines &mdash; LeadGrade,
            ToneRadar, Save Play, the Knowledge Engine, and others &mdash; pass
            customer-text data through Anthropic Claude or OpenAI embeddings to produce
            guidance, summaries, and routing decisions. We use enterprise terms with
            zero retention on the model side. We do not allow our AI providers to train
            external models on your data. Owners can opt out of any AI feature on a
            per-engine basis in <strong>Settings &rarr; AI &amp; Automation</strong>.
          </li>
          <li>
            <strong>Security and abuse prevention</strong>: detect and respond to
            fraud, spam, scraping, brute-force attempts, and policy violations. Audit
            logs are retained for compliance.
          </li>
          <li>
            <strong>Improve the product</strong>: aggregate, de-identified usage
            analytics. We use Plausible, which is cookieless and does not build
            cross-site profiles.
          </li>
          <li>
            <strong>Legal and compliance</strong>: meet our obligations under tax,
            payments, telecom (TCPA / 10DLC), and consumer-protection law.
          </li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl text-bone">4. How we share information</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          <strong>We do not sell your data. Period.</strong> We do not share it with
          advertising networks, data brokers, or list compilers. We do not use it to
          train external AI models.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We share data only with the sub-processors below, and only to the extent
          needed to run the product:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li><strong>Vercel</strong> &mdash; web hosting and edge delivery.</li>
          <li><strong>Supabase</strong> &mdash; managed Postgres database, with row-level security per tenant.</li>
          <li><strong>Clerk</strong> &mdash; identity, authentication, and session management.</li>
          <li><strong>Resend</strong> &mdash; transactional email delivery.</li>
          <li><strong>Stripe</strong> &mdash; subscription billing, Stripe Tax, and payment processing.</li>
          <li><strong>Twilio</strong> &mdash; SMS and voice messaging on behalf of owners.</li>
          <li><strong>Anthropic</strong> &mdash; Claude model inference for AI engines, on enterprise zero-retention terms.</li>
          <li><strong>OpenAI</strong> &mdash; text embeddings for retrieval and search, on enterprise terms.</li>
          <li><strong>Plausible</strong> &mdash; privacy-first, cookieless product analytics.</li>
        </ul>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Each sub-processor is bound by contract to use the data solely to provide
          their service to us, to meet at least the same security obligations we owe
          you, and to delete or return data on termination. The current
          sub-processor list is reproduced here so it is always public; we will update
          this page within 30 days of any material change and will give Enterprise
          customers advance written notice under their MSA.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We may also disclose data when we have a good-faith belief it is required by
          law (subpoena, court order, lawful request from a government authority), to
          protect the rights, property, or safety of Gladius, our users, or the
          public, or in connection with a merger, acquisition, or sale of assets &mdash;
          in which case the acquiring party will be bound by this policy or an
          equivalent one.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">5. Cookies and tracking</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We use a deliberately small set of cookies. The full list:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            <strong>Plausible analytics</strong> &mdash; no cookies, no cross-site
            tracking, no fingerprinting. Aggregate page views and referrers only.
          </li>
          <li>
            <strong>Clerk session cookies</strong> &mdash; required to keep you signed
            in to your workspace. First-party, HTTP-only.
          </li>
          <li>
            <strong>Stripe checkout cookies</strong> &mdash; set by Stripe during
            checkout to detect fraud and complete payment. Governed by Stripe&rsquo;s
            privacy notice.
          </li>
        </ul>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We do not use Google Analytics, Meta Pixel, LinkedIn Insight Tag, or any
          other ad-tech tracker on the product surface. If we ever add one, this list
          updates first.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">6. Your rights</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Depending on where you live, you have the right to:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li><strong>Access</strong> &mdash; ask what personal information we hold.</li>
          <li><strong>Correct</strong> &mdash; ask us to fix something inaccurate.</li>
          <li><strong>Delete</strong> &mdash; ask us to remove your information, subject to legal retention.</li>
          <li><strong>Port</strong> &mdash; receive a copy in a portable format.</li>
          <li><strong>Opt out</strong> &mdash; of marketing email and, for owners, of AI processing per-engine.</li>
          <li><strong>Non-discrimination</strong> &mdash; we will not penalize you for exercising any of the above.</li>
        </ul>
        <p className="mt-4 text-bone/75 leading-relaxed">
          These rights are recognized under the California Consumer Privacy Act
          (CCPA/CPRA), the Virginia Consumer Data Protection Act (CDPA), the Colorado
          Privacy Act (CPA), the Connecticut Data Privacy Act (CTDPA), and similar
          state privacy laws in Utah, Texas, Oregon, Montana, and others. Where a state
          law applies to you, we honor it whether or not you cite it by name.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          To exercise a right, email{" "}
          <a href="mailto:legal@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">
            legal@gladiusturf.com
          </a>{" "}
          from the address on the account, or contact us through the workspace owner
          if you are a homeowner. We respond within 30 days. We may need to verify
          your identity before fulfilling certain requests.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          If you are a California resident, you also have the right to know whether
          we sell or share personal information for cross-context behavioral
          advertising. We do not. There is nothing to opt out of, but you may still
          submit the request and we will confirm in writing.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">7. Data retention</h2>
        <ul className="mt-4 space-y-2 list-disc pl-6 text-bone/75 leading-relaxed">
          <li>
            <strong>Active customer data</strong>: retained for the life of your
            subscription. You can export at any time from inside the workspace.
          </li>
          <li>
            <strong>After termination</strong>: we keep your workspace data for 90
            days so you can export it, then we delete it from primary systems and
            purge it from backups within the next backup cycle (typically under 35
            days).
          </li>
          <li>
            <strong>Audit and security logs</strong>: retained for up to 7 years to
            meet financial-services and tax-compliance requirements that some of our
            customers carry forward to us.
          </li>
          <li>
            <strong>Billing records</strong>: retained as required by U.S. tax law,
            typically 7 years, and held in Stripe.
          </li>
          <li>
            <strong>Marketing contacts</strong>: retained until you unsubscribe,
            then suppressed (kept in a do-not-contact list) so we do not email you again.
          </li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl text-bone">8. Children&rsquo;s privacy</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          GladiusTurf is a B2B product for landscape companies and the property
          owners they serve. It is not directed at children under 13, and we do not
          knowingly collect personal information from anyone under 13. If you believe
          a child&rsquo;s information has been submitted to us, email{" "}
          <a href="mailto:legal@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">
            legal@gladiusturf.com
          </a>{" "}
          and we will delete it.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">9. International users and cross-border transfers</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          Gladius operates in the United States. Our infrastructure runs on U.S.
          regions of Vercel and Supabase, and most of our sub-processors are
          U.S.-based. If you access GladiusTurf from outside the United States, you
          are transferring your information into the U.S., where data-protection laws
          may differ from those in your jurisdiction.
        </p>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We do not currently offer EEA, U.K., or Swiss data-residency options. If
          you require an EU Standard Contractual Clauses-based DPA or U.K. IDTA,
          email <a href="mailto:legal@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">legal@gladiusturf.com</a> before
          you sign up &mdash; we will tell you honestly whether we can support your use
          case today.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">10. Security</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We protect your data with industry-standard controls: AES-256 encryption at
          rest, TLS 1.3 in transit, Postgres row-level security so tenants are
          isolated at the database engine, scoped Clerk-issued JWTs on every request,
          least-privilege internal access, and audit logging on sensitive operations.
          Stripe handles all card data inside its PCI-DSS Level 1 environment so we
          never see it. The full architecture, the SOC 2 Type II program, and the
          incident-response process live at{" "}
          <Link href="/security" className="text-champagne-bright underline-offset-4 hover:underline">
            /security
          </Link>
          . Report a vulnerability to{" "}
          <a href="mailto:security@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">
            security@gladiusturf.com
          </a>
          .
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">11. Changes to this policy</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          We update this policy when our practices change. The &ldquo;Last updated&rdquo;
          date at the top reflects the most recent revision. For material changes,
          we email account owners at least 30 days before the change takes effect and
          post a notice in the product. Continued use after the effective date means
          you accept the updated policy.
        </p>

        <h2 className="mt-12 font-serif text-2xl text-bone">12. Contact</h2>
        <p className="mt-4 text-bone/75 leading-relaxed">
          GladiusTurf, a Gladius Inc. product. For privacy questions, data-subject
          requests, GDPR/CCPA inquiries, or DPA execution, email{" "}
          <a href="mailto:legal@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">
            legal@gladiusturf.com
          </a>
          . For security disclosure, email{" "}
          <a href="mailto:security@gladiusturf.com" className="text-champagne-bright underline-offset-4 hover:underline">
            security@gladiusturf.com
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
