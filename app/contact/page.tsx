import type { Metadata } from "next";
import { ArrowRight, Mail, MessageSquare, Phone } from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "Contact — Talk to a founder",
  description:
    "Two lines that both ring a founder. Call, text, or email. No SDR, no support queue. Replies within one business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact GladiusTurf — Talk to a founder",
    description:
      "Two lines that both ring a founder. Call, text, or email. Replies within one business day.",
  },
};

const PHONES = [
  {
    label: "Line 1",
    display: "(786) 774-6087",
    tel: "+17867746087",
    sms: "+17867746087",
  },
  {
    label: "Line 2",
    display: "(352) 410-5889",
    tel: "+13524105889",
    sms: "+13524105889",
  },
];

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-bone/10 bg-pitch py-24 md:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(201,168,122,0.10),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-5xl px-6">
            <ScrollReveal>
              <Pill tone="champagne">Contact</Pill>
              <h1 className="mt-7 font-serif text-5xl font-semibold leading-[1.04] tracking-[-0.02em] text-bone md:text-6xl">
                Talk to a founder. Two lines, one inbox.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-parchment/75 md:text-xl">
                No SDR, no ticket queue, no &ldquo;a CSM will reach out within
                48 hours.&rdquo; Both numbers below ring a founder. So does
                the email. Replies inside one business day, usually faster.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* PHONE CARDS */}
        <section className="border-b border-bone/10 bg-obsidian py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <ScrollReveal>
              <Eyebrow tone="champagne">Call or text</Eyebrow>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
                Pick whichever rings through first.
              </h2>
              <p className="mt-3 max-w-2xl text-base text-bone/65">
                Both lines hit the same founder rotation. If one goes to
                voicemail, leave a name and the second line will call you back
                inside the hour during business hours.
              </p>
            </ScrollReveal>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {PHONES.map((p, i) => {
                const accent =
                  i === 0 ? "text-champagne-bright" : "text-moss-bright";
                const accentBorder =
                  i === 0
                    ? "border-champagne-bright/40 hover:border-champagne-bright"
                    : "border-moss-bright/40 hover:border-moss-bright";
                return (
                  <ScrollReveal key={p.tel} delay={i * 0.08}>
                    <div
                      className={`group flex h-full flex-col rounded-2xl border bg-bone/[0.02] p-8 transition-colors ${accentBorder}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-xs uppercase tracking-crest ${accent}`}
                        >
                          {p.label}
                        </span>
                        <Phone
                          className={`h-5 w-5 ${accent}`}
                          aria-hidden
                        />
                      </div>
                      <a
                        href={`tel:${p.tel}`}
                        className={`mt-6 block font-mono text-3xl font-semibold tracking-tight text-bone transition-colors hover:${accent} md:text-4xl`}
                      >
                        {p.display}
                      </a>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <a
                          href={`tel:${p.tel}`}
                          className={`inline-flex items-center gap-2 rounded-full border ${accentBorder} px-4 py-2 text-sm font-medium ${accent} transition-colors`}
                        >
                          <Phone className="h-3.5 w-3.5" aria-hidden />
                          Call
                        </a>
                        <a
                          href={`sms:${p.sms}`}
                          className="inline-flex items-center gap-2 rounded-full border border-bone/15 px-4 py-2 text-sm font-medium text-bone/80 transition-colors hover:border-bone/40 hover:text-bone"
                        >
                          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                          Text
                        </a>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* EMAIL + HOURS */}
        <section className="border-b border-bone/10 bg-slate-deep py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <ScrollReveal>
                <Eyebrow tone="moss">Email the founders</Eyebrow>
                <h3 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
                  Sometimes a written question is the fastest path.
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-bone/65">
                  Migration questions, security review, integration scoping,
                  feature requests — these go faster in writing. Both
                  founders read this inbox. No auto-responder.
                </p>
                <a
                  href="mailto:founders@gladiusturf.com"
                  className="mt-6 inline-flex items-center gap-2 font-mono text-lg font-semibold text-bone transition-colors hover:text-champagne-bright md:text-xl"
                >
                  <Mail className="h-5 w-5" aria-hidden />
                  founders@gladiusturf.com
                </a>
              </ScrollReveal>

              <ScrollReveal delay={0.08}>
                <Eyebrow tone="champagne">Response times</Eyebrow>
                <h3 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
                  Honest expectations.
                </h3>
                <ul className="mt-6 space-y-3 text-[15px] leading-[1.6] text-bone/75">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne-bright" />
                    <span>
                      <span className="text-bone">Phone &amp; text:</span>{" "}
                      Mon&ndash;Fri 7a&ndash;7p ET. Voicemail returned
                      same-day.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-moss-bright" />
                    <span>
                      <span className="text-bone">Email:</span> One business
                      day, usually under four hours.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne-bright" />
                    <span>
                      <span className="text-bone">Founding cohort:</span>{" "}
                      Direct Signal thread with the founders. Inside an hour,
                      most days.
                    </span>
                  </li>
                </ul>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* DEMO CTA */}
        <section className="bg-pitch py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <ScrollReveal>
              <h3 className="font-serif text-2xl font-semibold text-bone md:text-3xl">
                Already know the math is there? Skip the call.
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-base text-bone/65">
                A 30-minute demo on your own data is faster than three rounds
                of phone tag. Founders run it. ROI projection live on screen.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <a
                  href="/demo"
                  className="group inline-flex items-center gap-2 rounded-full bg-lime-bright px-7 py-3.5 text-base font-semibold text-forest shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover"
                >
                  Book a 30-minute demo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="/roi"
                  className="group inline-flex items-center gap-2 rounded-full border border-champagne-bright/40 px-6 py-3 text-sm font-medium text-champagne-bright transition-all hover:border-champagne-bright hover:bg-champagne/10"
                >
                  Run your numbers →
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
