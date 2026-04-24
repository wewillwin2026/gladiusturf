import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Surplus Yard — the crew-to-crew materials marketplace",
  description:
    "List the sod, stone, mulch, fertilizer, nursery stock, and idle equipment sitting on your yard. Buy what your job needs by 7 AM tomorrow. A peer-to-peer marketplace for landscape crews.",
};

const STEPS = [
  {
    n: "01",
    title: "List in 90 seconds",
    body:
      "Snap a photo of the pallet, the chemical tote, the half-skid of pavers. Pick the category, set a price, set a pickup window. Your listing is live in your region in under two minutes.",
  },
  {
    n: "02",
    title: "Crews near you get the ping",
    body:
      "Every crew within a 60-mile radius gets a feed of fresh inventory each evening. The Friday-night foreman scrambling for Saturday material sees yours first.",
  },
  {
    n: "03",
    title: "Buyer pays. Funds are held.",
    body:
      "Buyer pays through the platform. Money sits in escrow until pickup or delivery is confirmed. No more chasing a foreman for cash. No more no-shows after a half-day reserved.",
  },
  {
    n: "04",
    title: "Pickup, confirm, payout",
    body:
      "Buyer scans the QR pickup code on your dock. Funds release to your Stripe Connect account the same day. Average settle time so far in private beta: 14 hours from list to deposit.",
  },
];

const CATEGORIES = [
  {
    label: "Sod and turf",
    body:
      "Leftover Bermuda, zoysia, fescue, St. Augustine. Half-pallets and full pallets. The stuff that yellows in 72 hours if no one cuts it.",
  },
  {
    label: "Hardscape stone and pavers",
    body:
      "Surplus pavers, wall block, capstones, flagstone, travertine. The remainders from a 2,000 sq ft patio that the homeowner doesn't want stacked behind the shed.",
  },
  {
    label: "Mulch, soil, and aggregate",
    body:
      "Yards of dyed mulch, screened topsoil, river rock, decomposed granite, mason sand. Bulk and bagged. Loaded into the buyer's dump trailer at your yard.",
  },
  {
    label: "Fertilizer and chemical",
    body:
      "Sealed bags of granular, partial totes of pre-emergent, herbicide concentrate, liquid fert. Anything labeled and in date. A licensed-applicator-only filter keeps regulated SKUs in front of the right buyers.",
  },
  {
    label: "Nursery stock and plant material",
    body:
      "B&B trees, container shrubs, perennials, annuals from a canceled install. The 47 boxwoods you over-ordered for a model home that the developer pulled.",
  },
  {
    label: "Idle equipment and attachments",
    body:
      "The walk-behind aerator that runs three weeks a year. The skid-steer attachment you bought for one project. The plow setup gathering dust in May. Daily, weekly, or outright sale.",
  },
];

export default function SurplusYardPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        {/* Hero */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Surplus Yard · Pre-launch waitlist
            </p>
            <h1 className="max-w-5xl font-serif text-display-md text-forest md:text-display-lg">
              Move what&apos;s sitting on your yard. Buy what your job needs by 7 AM tomorrow.
            </h1>
            <p className="mt-8 max-w-2xl text-[20px] leading-[1.55] text-stone">
              A peer-to-peer marketplace for landscape crews. List your surplus
              sod, stone, mulch, chem, plant material, and idle equipment.
              Source short-notice inventory from yards 30 miles away — at a
              price your distributor will never quote you.
            </p>
          </div>
        </section>

        {/* Problem narrative */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              The math on your yard
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Every yard is a quiet warehouse of dead capital.
            </h2>
            <div className="mt-10 grid max-w-3xl gap-8 text-[17px] leading-[1.7] text-stone">
              <p>
                Walk your yard on a Tuesday in July and count what&apos;s
                actually moving. The other half — the spare pallets of sod
                yellowing in the corner, the partial skids of pavers from a
                patio that came in $3K under, the totes of pre-emergent that
                will expire before next spring, the aerator that runs three
                weeks a year — is $20,000 to $80,000 of working capital your
                bank can&apos;t see and your distributor refuses to take back.
              </p>
              <p>
                You already know how to sell it. You post it on Facebook
                Marketplace, screen six tire-kickers, drive to meet a guy at a
                gas station for $180, and the whole afternoon is gone. Nobody
                running an actual install crew has time for that. So the
                pallet sits, it dries out, it goes in the dumpster on the
                first slow week of August, and the line item gets filed under
                &quot;cost of doing business.&quot;
              </p>
              <p>
                Meanwhile a crew 22 miles away is calling SiteOne at 5:45 AM
                on a Saturday because their sod order didn&apos;t make the
                truck. Their three-man install team is on the clock. The
                customer is waiting at 9. The job pays $4,200 and they&apos;re
                about to lose all of it because nothing is in stock at 6 AM
                and the next delivery window is Monday. Your pallet is
                exactly what they need. Surplus Yard is the layer that puts
                you in front of them before they cancel the install.
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
              Four steps. No phone tag. No gas-station meetups.
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

        {/* What you can list */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Six categories at launch
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              If it&apos;s on your yard and it&apos;s not on a truck this week, it can be listed.
            </h2>
            <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
              {CATEGORIES.map((c, i) => (
                <div key={c.label} className="border-t border-[rgba(15,61,46,0.18)] pt-6">
                  <p className="font-mono text-sm tracking-tagline text-forest/60">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-serif text-h2-md text-forest">
                    {c.label}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.65] text-stone">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust + payments */}
        <section className="border-b border-[rgba(15,61,46,0.12)] bg-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Holds, deposits, disputes
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Built on Stripe Connect so the money side is boring.
            </h2>
            <div className="mt-10 grid max-w-3xl gap-6 text-[16px] leading-[1.7] text-stone">
              <p>
                Every transaction settles through a verified Stripe Connect
                account tied to your business EIN. Buyers fund the order at
                checkout. Funds are held in escrow against the listing. No
                cash exchanges hands at the dock — pickup is confirmed by a
                one-time QR code generated for the buyer&apos;s driver.
              </p>
              <p>
                Equipment rentals carry an automatic damage deposit, sized to
                replacement value, refunded after the unit returns clean.
                Disputes route through a 48-hour resolution flow with photo
                evidence required from both sides. Both buyer and seller
                build a public reputation score over time — the kind of
                signal that decides who gets first ping when a crew dumps 30
                pallets of sod into the feed at 6 PM Friday.
              </p>
              <p>
                Platform fee is 4% on materials, 6% on equipment rentals.
                That&apos;s the whole price list. No listing fees. No monthly
                seat charges. No surprise interchange.
              </p>
            </div>
          </div>
        </section>

        {/* Waitlist */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Early access
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              First 200 yards on the waitlist get free listings for life.
            </h2>
            <p className="mt-8 max-w-2xl text-[17px] leading-[1.6] text-stone">
              We&apos;re seeding the marketplace region by region. When your
              metro hits critical mass, we open it up — and the first 200
              founding yards never pay a listing fee, ever. Drop your email
              and we&apos;ll come find you when your zip is live.
            </p>
            <div className="mt-12 max-w-lg">
              <WaitlistForm source="surplus-yard" />
            </div>
          </div>
        </section>

        {/* CTA Band */}
        <section className="bg-forest text-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-moss">
              Surplus is a P&amp;L line item, not a rounding error.
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md md:text-h2-lg">
              Stop composting capital. Start clearing the yard.
            </h2>
            <p className="mt-8 max-w-2xl text-[17px] leading-[1.6] text-bone/80">
              Surplus Yard ships with GladiusTurf or stands alone. Either way,
              you list once and the network does the work.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="/demo"
                className="inline-flex items-center rounded-[8px] bg-moss px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-moss/90"
              >
                See the GladiusTurf demo
              </a>
              <a
                href="/find-a-crew"
                className="text-sm font-medium text-bone underline underline-offset-4 hover:text-moss"
              >
                Hand off the jobs you can&apos;t take →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
