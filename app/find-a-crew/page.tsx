import type { Metadata } from "next";
import { ArrowRight, MapPin, Shield, Sparkles } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Find a Crew — the landscape referral network",
  description:
    "Hand off the jobs you can't take and earn a 10% referral commission when the receiving crew invoices. Built for crews turning down inbound for the wrong region, wrong service, or a fully-booked calendar.",
};

const STEPS = [
  {
    n: "01",
    title: "Tag the lead you can't take",
    body:
      "In your inbox, your CRM, or our app: tag the inbound that isn't a fit. Wrong service line, wrong region, fully booked, too small, too far. One tap and it enters the network.",
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
      "They quote, sell, schedule, and execute on their own systems. We track the deal through their pipeline so you don't have to chase a foreman for an update.",
  },
  {
    n: "04",
    title: "Commission pays automatically",
    body:
      "When the job invoices, you get 10% of the contract value paid out the next business day via Stripe Connect. No invoicing. No follow-ups. No tax-time scramble — we 1099 you in January.",
  },
];

const FOUNDING_CITIES = [
  "Atlanta",
  "Charlotte",
  "Raleigh-Durham",
  "Nashville",
  "Birmingham",
  "Tampa",
  "Orlando",
  "Jacksonville",
  "Greenville SC",
  "Columbia SC",
];

const TRUST_POINTS = [
  {
    n: "01",
    title: "Stripe Connect rails on every receiving crew",
    body:
      "Every receiving crew runs through Stripe Connect with their EIN verified at onboarding. Customer payments — whether by card, ACH, or financed installment — flow into the platform first.",
  },
  {
    n: "02",
    title: "Commission splits the day the customer pays",
    body:
      "We split the commission to the referring crew the day the customer pays, then pass the remainder to the receiving crew. There is no version of this where someone forgets your 10%.",
  },
  {
    n: "03",
    title: "Every handoff is logged end-to-end",
    body:
      "Each handoff is logged with a timestamp, source tag, quoted contract value, closed contract value, and payout. End of year you get a single 1099 for everything you earned through the network.",
  },
  {
    n: "04",
    title: "10% fixed. 1.5% from the receiver — never you.",
    body:
      "Network commission rate is fixed at 10% of the closed contract. Platform takes a 1.5% facilitation fee from the receiving crew, not from your payout. What we say you'll earn is what hits your account.",
  },
];

export default function FindACrewPage() {
  return (
    <>
      <Nav />
      <main className="bg-forest-deep">
        {/* Hero */}
        <section className="border-b border-bone/10">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Pill>
                <span className="h-1.5 w-1.5 rounded-full bg-moss-bright animate-pulse-dot" />
                Find a Crew · Pre-launch
              </Pill>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h1 className="mt-8 max-w-5xl font-serif text-4xl md:text-6xl text-bone tracking-[-0.02em] leading-[1.05]">
                The job you turn down is the job another crew is praying for.
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mt-8 max-w-2xl text-lg md:text-xl text-bone/70 leading-relaxed">
                A referral network for landscaping companies. Hand off the
                inbound you can&apos;t take. Earn a 10% commission when the
                receiving crew closes the work. Paid out the day they invoice —
                not the day they feel like it.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Problem narrative */}
        <section className="border-b border-bone/10">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow>The math on the leads you kill</Eyebrow>
                <h2 className="mt-6 font-serif text-3xl md:text-5xl text-bone tracking-[-0.02em] leading-[1.1]">
                  Ten to thirty percent of your inbound dies on the voicemail.
                </h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="mx-auto mt-12 grid max-w-3xl gap-8 text-lg text-bone/70 leading-relaxed">
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
            </ScrollReveal>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-bone/10">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-6 max-w-3xl font-serif text-3xl md:text-5xl text-bone tracking-[-0.02em] leading-[1.1]">
                Four steps from kill list to commission check.
              </h2>
            </ScrollReveal>
            <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <ScrollReveal key={s.n} delay={i * 0.05}>
                  <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 h-full">
                    <p className="font-mono text-6xl md:text-7xl text-moss-bright/40 leading-none">
                      {s.n}
                    </p>
                    <h3 className="mt-6 font-serif text-xl text-bone">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-base text-bone/60 leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage map */}
        <section className="border-b border-bone/10 bg-forest-mid">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow>Founding cities</Eyebrow>
              <h2 className="mt-6 max-w-3xl font-serif text-3xl md:text-5xl text-bone tracking-[-0.02em] leading-[1.1]">
                We&apos;re starting with 10 metros.
              </h2>
              <p className="mt-6 max-w-2xl text-lg text-bone/60 leading-relaxed">
                A referral network is only useful if a crew exists on the
                receiving end. We&apos;re seeding metro by metro instead of
                opening the floodgates and letting leads die in dead zones.
              </p>
            </ScrollReveal>
            <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-5">
              {FOUNDING_CITIES.map((city, i) => (
                <ScrollReveal key={city} delay={i * 0.03}>
                  <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-5 transition-colors hover:border-moss/30">
                    <MapPin className="h-4 w-4 text-moss-bright" />
                    <p className="mt-3 font-serif text-lg text-bone">{city}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal delay={0.1}>
              <div className="mt-12 flex h-64 items-center justify-center rounded-2xl border border-bone/10 bg-bone/[0.02]">
                <div className="text-center">
                  <MapPin className="mx-auto h-8 w-8 text-moss-bright/60" />
                  <p className="mt-3 font-mono text-sm tracking-[0.15em] text-bone/40">
                    COVERAGE MAP · LIVE AT LAUNCH
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="mt-8 max-w-2xl text-base text-bone/60 leading-relaxed">
                Each market needs a working mix of maintenance, design-build,
                hardscape, irrigation, tree care, fertilization, and snow.
                When a metro hits the threshold, every founding crew there
                gets a callable handoff in every category. Outside our launch
                metros? Get on the list anyway — markets open in the order
                their waitlist fills the seven core service lines.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Trust + payments */}
        <section className="border-b border-bone/10">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow>Tracking, payouts, taxes</Eyebrow>
              <h2 className="mt-6 max-w-3xl font-serif text-3xl md:text-5xl text-bone tracking-[-0.02em] leading-[1.1]">
                The receiving crew can&apos;t skip the commission. We hold the rails.
              </h2>
              <p className="mt-6 max-w-2xl text-lg text-bone/60 leading-relaxed">
                Stripe Connect on every account, escrowed splits, full audit
                trail, and a single 1099 in January. The only thing you do is
                tag the lead.
              </p>
            </ScrollReveal>
            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
              {TRUST_POINTS.map((t, i) => (
                <ScrollReveal key={t.n} delay={i * 0.04}>
                  <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 h-full">
                    <div className="flex items-baseline gap-4">
                      <p className="font-mono text-sm tracking-[0.15em] text-moss-bright">
                        {t.n}
                      </p>
                      <Shield className="h-4 w-4 text-bone/40" />
                    </div>
                    <h3 className="mt-4 font-serif text-xl text-bone">
                      {t.title}
                    </h3>
                    <p className="mt-3 text-base text-bone/60 leading-relaxed">
                      {t.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Waitlist - two sides */}
        <section className="border-b border-bone/10">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow>Two sides of the network</Eyebrow>
              <h2 className="mt-6 max-w-3xl font-serif text-3xl md:text-5xl text-bone tracking-[-0.02em] leading-[1.1]">
                Pick the side you&apos;re on. Or both — most crews are.
              </h2>
            </ScrollReveal>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
              <ScrollReveal>
                <div className="rounded-2xl border border-moss/40 bg-gradient-to-b from-moss/10 to-transparent shadow-pop p-8 md:p-10 h-full">
                  <Pill>
                    <Sparkles className="h-3 w-3" />
                    Senders
                  </Pill>
                  <h3 className="mt-6 font-serif text-3xl text-bone tracking-[-0.02em]">
                    I want to send overflow.
                  </h3>
                  <p className="mt-4 text-base text-bone/70 leading-relaxed">
                    You turn down work every week. Wrong service, wrong region,
                    wrong size, fully booked. Tag it, hand it off, get paid 10%
                    when it closes.
                  </p>
                  <div className="mt-10">
                    <WaitlistForm source="find-a-crew-sender" />
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.05}>
                <div className="rounded-2xl border border-moss/40 bg-gradient-to-b from-moss/10 to-transparent shadow-pop p-8 md:p-10 h-full">
                  <Pill>
                    <Sparkles className="h-3 w-3" />
                    Receivers
                  </Pill>
                  <h3 className="mt-6 font-serif text-3xl text-bone tracking-[-0.02em]">
                    I want to receive overflow.
                  </h3>
                  <p className="mt-4 text-base text-bone/70 leading-relaxed">
                    You have capacity in a service line, region, or season. Get
                    pre-qualified inbound from crews who already screened it.
                    Pay the 10% only on what you close.
                  </p>
                  <div className="mt-10">
                    <WaitlistForm source="find-a-crew-receiver" />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Final tease */}
        <section className="bg-forest-mid">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow tone="lime">
                Goodwill referrals were a hobby. This is a line of revenue.
              </Eyebrow>
              <h2 className="mt-6 max-w-3xl font-serif text-3xl md:text-5xl text-bone tracking-[-0.02em] leading-[1.1]">
                Stop killing leads. Start banking them.
              </h2>
              <p className="mt-8 max-w-2xl text-lg text-bone/70 leading-relaxed">
                Find a Crew ships with GladiusTurf or stands alone. Either way,
                the leads you can&apos;t run become the most predictable revenue
                line on your statement.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <a
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-lg bg-lime-bright px-6 py-3 text-sm font-semibold text-forest shadow-cta transition-all hover:shadow-cta-hover"
                >
                  See the GladiusTurf demo
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/surplus-yard"
                  className="inline-flex items-center gap-2 text-sm font-medium text-bone underline underline-offset-4 hover:text-moss-bright"
                >
                  Move what&apos;s sitting on your yard
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
