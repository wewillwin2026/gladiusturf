import type { Metadata } from "next";
import {
  ArrowRight,
  Hammer,
  Package,
  Shield,
  Sparkles,
  Sprout,
  Truck,
  Wrench,
} from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";
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
    icon: Sprout,
    label: "Sod and turf",
    body:
      "Leftover Bermuda, zoysia, fescue, St. Augustine. Half-pallets and full pallets. The stuff that yellows in 72 hours if no one cuts it.",
  },
  {
    icon: Hammer,
    label: "Hardscape stone and pavers",
    body:
      "Surplus pavers, wall block, capstones, flagstone, travertine. The remainders from a 2,000 sq ft patio that the homeowner doesn't want stacked behind the shed.",
  },
  {
    icon: Truck,
    label: "Mulch, soil, and aggregate",
    body:
      "Yards of dyed mulch, screened topsoil, river rock, decomposed granite, mason sand. Bulk and bagged. Loaded into the buyer's dump trailer at your yard.",
  },
  {
    icon: Package,
    label: "Fertilizer and chemical",
    body:
      "Sealed bags of granular, partial totes of pre-emergent, herbicide concentrate, liquid fert. Anything labeled and in date. A licensed-applicator-only filter keeps regulated SKUs in front of the right buyers.",
  },
  {
    icon: Sparkles,
    label: "Nursery stock and plant material",
    body:
      "B&B trees, container shrubs, perennials, annuals from a canceled install. The 47 boxwoods you over-ordered for a model home that the developer pulled.",
  },
  {
    icon: Wrench,
    label: "Idle equipment and attachments",
    body:
      "The walk-behind aerator that runs three weeks a year. The skid-steer attachment you bought for one project. The plow setup gathering dust in May. Daily, weekly, or outright sale.",
  },
];

const TRUST_POINTS = [
  {
    n: "01",
    title: "Stripe Connect rails on every listing",
    body:
      "Every transaction settles through a verified Stripe Connect account tied to your business EIN. Buyers fund the order at checkout. Funds are held in escrow against the listing.",
  },
  {
    n: "02",
    title: "QR-confirmed pickup at the dock",
    body:
      "No cash exchanges hands at the dock — pickup is confirmed by a one-time QR code generated for the buyer's driver. Funds release the same day to your Connect account.",
  },
  {
    n: "03",
    title: "Equipment deposits, photo disputes",
    body:
      "Equipment rentals carry an automatic damage deposit, sized to replacement value, refunded after the unit returns clean. Disputes route through a 48-hour resolution flow with photo evidence required from both sides.",
  },
  {
    n: "04",
    title: "Flat fee. No listing charges.",
    body:
      "Platform fee is 4% on materials, 6% on equipment rentals. That's the whole price list. No listing fees. No monthly seat charges. No surprise interchange.",
  },
];

export default function SurplusYardPage() {
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
                Surplus Yard · Pre-launch
              </Pill>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h1 className="mt-8 max-w-5xl font-serif text-4xl md:text-6xl text-bone tracking-[-0.02em] leading-[1.05]">
                Move what&apos;s sitting on your yard. Buy what your job needs by 7 AM tomorrow.
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mt-8 max-w-2xl text-lg md:text-xl text-bone/70 leading-relaxed">
                A peer-to-peer marketplace for landscape crews. List your surplus
                sod, stone, mulch, chem, plant material, and idle equipment.
                Source short-notice inventory from yards 30 miles away — at a
                price your distributor will never quote you.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Problem narrative */}
        <section className="border-b border-bone/10">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow tone="honey">The math on your yard</Eyebrow>
                <h2 className="mt-6 font-serif text-3xl md:text-5xl text-bone tracking-[-0.02em] leading-[1.1]">
                  Every yard is a quiet warehouse of dead capital.
                </h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="mx-auto mt-12 grid max-w-3xl gap-8 text-lg text-bone/70 leading-relaxed">
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
            </ScrollReveal>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-bone/10">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-6 max-w-3xl font-serif text-3xl md:text-5xl text-bone tracking-[-0.02em] leading-[1.1]">
                Four steps. No phone tag. No gas-station meetups.
              </h2>
            </ScrollReveal>
            <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <ScrollReveal key={s.n} delay={i * 0.05}>
                  <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 h-full">
                    <p
                      className={`font-mono text-6xl md:text-7xl leading-none ${
                        i % 2 === 0
                          ? "text-honey-bright/40"
                          : "text-moss-bright/40"
                      }`}
                    >
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

        {/* What you can list */}
        <section className="border-b border-bone/10">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow tone="honey">What you can list</Eyebrow>
              <h2 className="mt-6 max-w-3xl font-serif text-3xl md:text-5xl text-bone tracking-[-0.02em] leading-[1.1]">
                If it&apos;s on your yard and it&apos;s not on a truck this week, it can be listed.
              </h2>
            </ScrollReveal>
            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((c, i) => {
                const Icon = c.icon;
                const isEven = i % 2 === 0;
                const iconCls = isEven
                  ? "border-honey/30 bg-honey/10 text-honey-bright"
                  : "border-moss/30 bg-moss/10 text-moss-bright";
                const hoverCls = isEven
                  ? "hover:border-honey/30"
                  : "hover:border-moss/30";
                return (
                  <ScrollReveal key={c.label} delay={i * 0.04}>
                    <div
                      className={`rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 h-full transition-colors ${hoverCls}`}
                    >
                      <div
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${iconCls}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-6 font-serif text-xl text-bone">
                        {c.label}
                      </h3>
                      <p className="mt-3 text-sm text-bone/60 leading-relaxed">
                        {c.body}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust + payments */}
        <section className="border-b border-bone/10 bg-forest-mid">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow>Holds, deposits, disputes</Eyebrow>
              <h2 className="mt-6 max-w-3xl font-serif text-3xl md:text-5xl text-bone tracking-[-0.02em] leading-[1.1]">
                Built on Stripe Connect so the money side is boring.
              </h2>
              <p className="mt-6 max-w-2xl text-lg text-bone/60 leading-relaxed">
                The rails behind every listing — verified accounts, escrowed
                funds, photo-evidence disputes, and a flat fee you can quote
                from memory.
              </p>
            </ScrollReveal>
            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
              {TRUST_POINTS.map((t, i) => (
                <ScrollReveal key={t.n} delay={i * 0.04}>
                  <div className="rounded-2xl border border-honey-bright/20 bg-bone/[0.02] p-8 h-full">
                    <div className="flex items-baseline gap-4">
                      <p
                        className={`font-mono text-sm tracking-[0.15em] ${
                          i % 2 === 0 ? "text-honey-bright" : "text-moss-bright"
                        }`}
                      >
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

        {/* Waitlist CTA */}
        <section className="border-b border-bone/10">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl rounded-2xl border border-moss/40 bg-gradient-to-b from-moss/10 to-transparent shadow-pop p-8 md:p-12">
                <Pill tone="honey">
                  <Sparkles className="h-3 w-3" />
                  Founder pricing
                </Pill>
                <h3 className="mt-6 font-serif text-3xl md:text-4xl text-bone tracking-[-0.02em] leading-[1.1]">
                  First 200 yards get free listings for life.
                </h3>
                <p className="mt-6 text-lg text-bone/70 leading-relaxed">
                  We&apos;re seeding the marketplace region by region. When your
                  metro hits critical mass, we open it up — and the first 200
                  founding yards never pay a listing fee, ever. Drop your email
                  and we&apos;ll come find you when your zip is live.
                </p>
                <div className="mt-10">
                  <WaitlistForm source="surplus-yard" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Final tease */}
        <section className="bg-forest-mid">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow tone="lime">
                Surplus is a P&amp;L line item, not a rounding error.
              </Eyebrow>
              <h2 className="mt-6 max-w-3xl font-serif text-3xl md:text-5xl text-bone tracking-[-0.02em] leading-[1.1]">
                Stop composting capital. Start clearing the yard.
              </h2>
              <p className="mt-8 max-w-2xl text-lg text-bone/70 leading-relaxed">
                Surplus Yard ships with GladiusTurf or stands alone. Either way,
                you list once and the network does the work.
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
                  href="/find-a-crew"
                  className="inline-flex items-center gap-2 text-sm font-medium text-bone underline underline-offset-4 hover:text-moss-bright"
                >
                  Hand off the jobs you can&apos;t take
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
