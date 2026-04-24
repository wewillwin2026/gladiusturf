import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Find a Crew — the landscape referral network",
  description:
    "Hand off the jobs you can't take and earn a 10% referral commission when the receiving crew invoices. Built for crews turning down inbound for the wrong region, wrong service, or a fully-booked calendar.",
};

const STEPS = [
  {
    n: "01",
    title: "Tag the lead you can’t take",
    body:
      "In your inbox, your CRM, or our app: tag the inbound that isn’t a fit. Wrong service line, wrong region, fully booked, too small, too far. One tap and it enters the network.",
  },
  {
    n: "02",
    title: "We route it to the right crew",
    body:
      "The lead lands in front of crews matching the service, the radius, and the response SLA. First crew to claim and contact the homeowner inside 60 minutes wins it.",
  },
  {
    n: "03",
    title: "Receiving crew runs the job",
    body:
      "They quote, sell, schedule, and execute on their own systems. We track the deal through their pipeline so you don’t have to chase a foreman for an update.",
  },
  {
    n: "04",
    title: "Commission pays automatically",
    body:
      "When the job invoices, you get 10% of the contract value paid out the next business day via Stripe Connect. No invoicing. No follow-ups. No tax-time scramble — we 1099 you in January.",
  },
];

export default function FindACrewPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        {/* Hero */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Find a Crew · Pre-launch waitlist
            </p>
            <h1 className="max-w-5xl font-serif text-display-md text-forest md:text-display-lg">
              The job you turn down is the job another crew is praying for.
            </h1>
            <p className="mt-8 max-w-2xl text-[20px] leading-[1.55] text-stone">
              A referral network for landscaping companies. Hand off the
              inbound you can&apos;t take. Earn a 10% commission when the
              receiving crew closes the work. Paid out the day they invoice —
              not the day they feel like it.
            </p>
          </div>
        </section>

        {/* Problem narrative */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              The math on the leads you kill
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Ten to thirty percent of your inbound dies on the voicemail.
            </h2>
            <div className="mt-10 grid max-w-3xl gap-8 text-[17px] leading-[1.7] text-stone">
              <p>
                A homeowner calls a maintenance shop asking for a hardscape
                patio. A patio shop gets a call about an irrigation startup.
                A residential crew gets a 14-acre commercial RFP. A snow plow
                outfit picks up a Saturday call about a fert app. A booked-
                solid mowing route gets one more inbound for a property they
                couldn&apos;t hit until October. Every one of those calls is
                revenue that someone is already qualified to run — just not
                the person who answered the phone.
              </p>
              <p>
                Most shops handle this the same way: a polite &quot;sorry,
                we don&apos;t do that&quot; and the lead is gone. Some shops
                keep a Google Doc of three friends to refer to. Most of the
                time the friend never knows the lead came from you, and you
                never see a dime even when they close a $42,000 install. The
                whole referral economy in this industry runs on goodwill,
                memory, and beer at the end of the season. None of those
                scale.
              </p>
              <p>
                Find a Crew turns the leads you kill into a line on your P&amp;L.
                You tag it, we route it, the receiving crew pays the network
                a 10% commission on the closed contract, and that commission
                lands in your Stripe Connect account the day the receiving
                crew invoices the customer. The lead you would have killed
                in 11 seconds becomes $400 to $4,000 in your bank account
                three weeks later.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              How it works
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Four steps from kill list to commission check.
            </h2>
            <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="rounded-[8px] border border-[rgba(15,61,46,0.12)] bg-bone p-8"
                >
                  <p className="font-mono text-sm tracking-tagline text-forest/60">
                    {s.n}
                  </p>
                  <h3 className="mt-4 font-serif text-h2-md text-forest">
                    {s.title}
                  </h3>
                  <p className="mt-4 text-[16px] leading-[1.65] text-stone">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage map placeholder */}
        <section className="border-b border-[rgba(15,61,46,0.12)] bg-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Coverage
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Live in the Southeast first. Rolling north as the network fills in.
            </h2>
            <div className="mt-10 grid max-w-3xl gap-6 text-[16px] leading-[1.7] text-stone">
              <p>
                A referral network is only useful if a crew exists on the
                receiving end. We&apos;re seeding metro by metro instead of
                opening the floodgates and letting leads die in dead zones.
                Founding markets at launch: Atlanta, Charlotte, Raleigh-Durham,
                Nashville, Birmingham, Tampa, Orlando, Jacksonville, Greenville
                SC, and Columbia SC.
              </p>
              <p>
                Each market needs a working mix of maintenance, design-build,
                hardscape, irrigation, tree care, fertilization, and snow.
                When a metro hits the threshold, every founding crew there
                gets a callable handoff in every category — meaning every
                inbound you can&apos;t take has somewhere to land.
              </p>
              <p>
                Outside our launch metros? Get on the list anyway. Markets
                open in the order their waitlist fills the seven core service
                lines.
              </p>
            </div>
            <div className="mt-12 flex h-64 max-w-3xl items-center justify-center rounded-[12px] border border-[rgba(15,61,46,0.18)] bg-paper">
              <p className="font-mono text-sm tracking-tagline text-stone">
                Coverage map · live at launch
              </p>
            </div>
          </div>
        </section>

        {/* Trust + payments */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Tracking, payouts, taxes
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              The receiving crew can&apos;t skip the commission. We hold the rails.
            </h2>
            <div className="mt-10 grid max-w-3xl gap-6 text-[16px] leading-[1.7] text-stone">
              <p>
                Every receiving crew runs through Stripe Connect with their
                EIN verified at onboarding. Customer payments — whether by
                card, ACH, or financed installment — flow into the platform
                first. We split the commission to the referring crew the day
                the customer pays, then pass the remainder to the receiving
                crew. There is no version of this where someone &quot;forgets&quot;
                your 10%.
              </p>
              <p>
                Each handoff is logged with a timestamp, a source tag, the
                quoted contract value, the closed contract value, and the
                payout. You see every lead you sent, who took it, what
                happened, and what you got paid. End of year you get a single
                1099 for everything you earned through the network.
              </p>
              <p>
                Network commission rate is fixed at 10% of the closed
                contract. Platform takes a 1.5% facilitation fee from the
                receiving crew, not from your payout. What we say you&apos;ll
                earn is what hits your account.
              </p>
            </div>
          </div>
        </section>

        {/* Waitlist - two sides */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Two sides of the network
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Pick the side you&apos;re on. Or both — most crews are.
            </h2>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-[12px] border border-[rgba(15,61,46,0.18)] bg-bone p-8">
                <p className="font-mono text-sm tracking-tagline text-forest/60">
                  SENDER
                </p>
                <h3 className="mt-4 font-serif text-h2-md text-forest">
                  I want to send overflow
                </h3>
                <p className="mt-4 text-[15px] leading-[1.65] text-stone">
                  You turn down work every week. Wrong service, wrong region,
                  wrong size, fully booked. Tag it, hand it off, get paid 10%
                  when it closes.
                </p>
                <div className="mt-8">
                  <WaitlistForm source="find-a-crew-sender" />
                </div>
              </div>
              <div className="rounded-[12px] border border-[rgba(15,61,46,0.18)] bg-bone p-8">
                <p className="font-mono text-sm tracking-tagline text-forest/60">
                  RECEIVER
                </p>
                <h3 className="mt-4 font-serif text-h2-md text-forest">
                  I want to receive overflow
                </h3>
                <p className="mt-4 text-[15px] leading-[1.65] text-stone">
                  You have capacity in a service line, region, or season. Get
                  pre-qualified inbound from crews who already screened it.
                  Pay the 10% only on what you close.
                </p>
                <div className="mt-8">
                  <WaitlistForm source="find-a-crew-receiver" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Band */}
        <section className="bg-forest text-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-moss">
              Goodwill referrals were a hobby. This is a line of revenue.
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md md:text-h2-lg">
              Stop killing leads. Start banking them.
            </h2>
            <p className="mt-8 max-w-2xl text-[17px] leading-[1.6] text-bone/80">
              Find a Crew ships with GladiusTurf or stands alone. Either way,
              the leads you can&apos;t run become the most predictable revenue
              line on your statement.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="/demo"
                className="inline-flex items-center rounded-[8px] bg-moss px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-moss/90"
              >
                See the GladiusTurf demo
              </a>
              <a
                href="/surplus-yard"
                className="text-sm font-medium text-bone underline underline-offset-4 hover:text-moss"
              >
                Move what&apos;s sitting on your yard →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
