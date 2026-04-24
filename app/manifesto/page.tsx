import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Why GladiusTurf exists. A letter to the landscape crew owner from the founder.",
};

export default function ManifestoPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-3xl px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Manifesto
            </p>
            <h1 className="font-serif text-display-md text-forest md:text-display-lg">
              Why GladiusTurf.
            </h1>
            <div className="mt-12 flex flex-col gap-6 text-[17px] leading-[1.7] text-forest">
              <p>
                Landscaping is the last great trade that still runs on
                whiteboards, text threads, and gut. Every shop I&apos;ve ever
                walked into has a wall of sticky notes where the quote pipeline
                lives. Every owner I&apos;ve ever met can tell you the name of
                the client who called Saturday morning, wanted a callback, and
                never got one.
              </p>
              <p>
                That&apos;s a six-figure leak per shop per year — $180,000 in
                our numbers, more in some. We don&apos;t blame the owner. We
                don&apos;t blame the crew. We blame the stack. You&apos;re
                paying seven software vendors to do six jobs badly and leave
                the seventh — the one that actually matters — undone.
              </p>
              <p>
                GladiusTurf is the opposite bet. One subscription. Seven
                engines. Every engine holds itself to a dollar number. If an
                engine doesn&apos;t move money, we rip it out. We don&apos;t
                ship features.
              </p>
              <p>
                We aren&apos;t a CRM. A CRM is a rolodex with a calendar
                bolted on. What landscape crews actually need is something
                that watches the property, watches the crew, watches the
                weather, watches the chemicals, and tells a human exactly
                what to do next. That&apos;s a revenue system. That&apos;s
                what we built.
              </p>
              <p>
                We built it because the father who runs the shop in our
                hometown told us what he lost last spring, and how he found
                out. He found out by reading a Google review.
              </p>
              <p>
                Never again. Not on our watch.
              </p>
              <p className="mt-6 text-stone">
                — The founders, GladiusTurf
              </p>
            </div>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
