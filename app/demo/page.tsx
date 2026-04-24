import type { Metadata } from "next";
import { DemoForm } from "@/components/demo-form";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { QuoteBlock } from "@/components/quote-block";

export const metadata: Metadata = {
  title: "Request a demo",
  description:
    "See GladiusTurf on your own data in 30 minutes. Founders run the call. No SDR, no slides, no junior CSM. ROI projection live on screen.",
};

export default function DemoPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto grid max-w-content grid-cols-1 gap-16 px-6 py-20 md:grid-cols-2 md:py-section">
            <div>
              <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
                Request a demo
              </p>
              <h1 className="font-serif text-display-md text-forest md:text-display-lg">
                See it on your data. 30 minutes. Founders run the call.
              </h1>
              <p className="mt-8 max-w-xl text-[18px] leading-[1.7] text-stone">
                You won&apos;t see a deck. You&apos;ll see GladiusTurf running
                live against your own quote pipeline, your own customer list,
                and the last 90 days of jobs you&apos;ve already done. We
                screen-share the seven engines, point them at your numbers, and
                read the recovered revenue out loud.
              </p>
              <p className="mt-6 max-w-xl text-[18px] leading-[1.7] text-stone">
                No SDR pre-qualifying. No junior CSM reading talking points
                back to you. A founder shows up with the product open. By
                minute thirty you&apos;ll know — within a few thousand
                dollars — what GladiusTurf would have put in your bank last
                quarter, and exactly what migration looks like.
              </p>

              <ul className="mt-10 flex flex-col gap-3 text-[15px] leading-[1.6] text-forest">
                <li>— 14-day pilot, no card on file</li>
                <li>— 48-hour migration from Jobber / LMN / Service Autopilot</li>
                <li>— We pay your overlap month</li>
                <li>— Month-to-month. Cancel anytime, no claw-back.</li>
              </ul>
            </div>

            <div>
              <DemoForm />
            </div>
          </div>
        </section>

        <section className="border-b border-[rgba(15,61,46,0.12)] bg-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              What we&apos;ll cover
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Five things, in order, on your numbers.
            </h2>

            <ol className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
              <li>
                <p className="font-mono text-[13px] uppercase tracking-tagline text-moss">
                  01
                </p>
                <h3 className="mt-3 font-serif text-[22px] leading-[1.25] text-forest">
                  Walk your quote pipeline through Quote Intercept
                </h3>
                <p className="mt-3 text-[15px] leading-[1.65] text-stone">
                  We pull your last 30 days of estimate requests and run them
                  through the engine live. You see the ones that would have
                  been auto-routed inside two minutes, the ones that would
                  have escalated, and the ones a competitor stole because the
                  inbox sat for three days.
                </p>
              </li>

              <li>
                <p className="font-mono text-[13px] uppercase tracking-tagline text-moss">
                  02
                </p>
                <h3 className="mt-3 font-serif text-[22px] leading-[1.25] text-forest">
                  Score your last 90 days of jobs through Upsell Whisperer
                </h3>
                <p className="mt-3 text-[15px] leading-[1.65] text-stone">
                  Export your job list, paste it in, and watch the engine
                  flag the aeration windows, mulch refresh cycles, irrigation
                  leaks, and dying specimens you didn&apos;t pitch. It puts a
                  dollar number next to every property.
                </p>
              </li>

              <li>
                <p className="font-mono text-[13px] uppercase tracking-tagline text-moss">
                  03
                </p>
                <h3 className="mt-3 font-serif text-[22px] leading-[1.25] text-forest">
                  Map your referral graph
                </h3>
                <p className="mt-3 text-[15px] leading-[1.65] text-stone">
                  Drop in your customer list. Referral Radar plots which
                  properties produce the most new business, which neighbors
                  share an HOA, and which reps are quietly losing referrals.
                  We mark the postcards we&apos;d send tomorrow.
                </p>
              </li>

              <li>
                <p className="font-mono text-[13px] uppercase tracking-tagline text-moss">
                  04
                </p>
                <h3 className="mt-3 font-serif text-[22px] leading-[1.25] text-forest">
                  ROI projection — live, on screen
                </h3>
                <p className="mt-3 text-[15px] leading-[1.65] text-stone">
                  Three numbers. Recovered estimates, recovered upsells,
                  recovered referrals — annualized against your real volume.
                  No spreadsheets sent over later. You watch us do the math
                  in the product.
                </p>
              </li>

              <li>
                <p className="font-mono text-[13px] uppercase tracking-tagline text-moss">
                  05
                </p>
                <h3 className="mt-3 font-serif text-[22px] leading-[1.25] text-forest">
                  Migration plan
                </h3>
                <p className="mt-3 text-[15px] leading-[1.65] text-stone">
                  Last ten minutes. We tell you what we&apos;ll move, when
                  we&apos;ll move it, and which day your crew opens
                  GladiusTurf for the first time. 48 hours from yes to live.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Who runs the demo
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              A founder. Always. Until rep number twenty.
            </h2>

            <div className="mt-10 grid max-w-3xl grid-cols-1 gap-6 text-[17px] leading-[1.7] text-stone">
              <p>
                Other category software hands you off the second you ask for
                a demo. SDR books the call. AE runs slides. Implementation
                hands you a junior CSM who learned the product six weeks ago.
                By the time you have a real question, the person who can
                answer it is three layers away from your inbox.
              </p>
              <p>
                That ends here. Until we&apos;re north of twenty paying
                shops, every demo is run by a founder. Every migration is
                touched by a founder. Every late-night text on a Saturday
                afternoon when a sprinkler controller breaks is a founder
                replying. You&apos;ll have our cell phones inside the first
                week. That&apos;s not a perk we&apos;re marketing — it&apos;s
                how we move fast enough to be worth your subscription.
              </p>
            </div>
          </div>
        </section>

        <QuoteBlock />

        <section className="border-b border-[rgba(15,61,46,0.12)] bg-paper">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              What you need to bring
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Three exports. That&apos;s the whole prep list.
            </h2>

            <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <li className="rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-bone p-8">
                <p className="font-mono text-[13px] uppercase tracking-tagline text-moss">
                  Bring 01
                </p>
                <h3 className="mt-3 font-serif text-[22px] leading-[1.25] text-forest">
                  Last 90 days of quotes
                </h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-stone">
                  CSV export from Jobber, LMN, Service Autopilot, Aspire,
                  Zentive, or your spreadsheet. Won, lost, ghosted — all of
                  them.
                </p>
              </li>

              <li className="rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-bone p-8">
                <p className="font-mono text-[13px] uppercase tracking-tagline text-moss">
                  Bring 02
                </p>
                <h3 className="mt-3 font-serif text-[22px] leading-[1.25] text-forest">
                  Customer list export
                </h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-stone">
                  Address, contact, contract type. We don&apos;t need
                  revenue figures. We use addresses to map your referral
                  graph live on the call.
                </p>
              </li>

              <li className="rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-bone p-8">
                <p className="font-mono text-[13px] uppercase tracking-tagline text-moss">
                  Bring 03
                </p>
                <h3 className="mt-3 font-serif text-[22px] leading-[1.25] text-forest">
                  Current software name
                </h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-stone">
                  Whatever you&apos;re running today, plus anything bolted
                  onto it. We&apos;ve migrated off all of them. Tell us in
                  the form.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-forest text-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-moss">
              Not ready for a live call?
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md md:text-h2-lg">
              Watch the four-minute product tour.
            </h2>
            <p className="mt-8 max-w-2xl text-[17px] leading-[1.6] text-bone/80">
              No form. No email. The seven engines, the migration flow, the
              numbers — narrated by a founder. Come back when you&apos;ve
              seen enough.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="#tour"
                className="inline-flex items-center rounded-[8px] bg-moss px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-moss/90"
              >
                Watch the 4-min tour
              </a>
              <a
                href="/manifesto"
                className="text-sm font-medium text-bone underline underline-offset-4 hover:text-moss"
              >
                Read the manifesto first →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
