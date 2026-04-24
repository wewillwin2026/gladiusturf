import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Surplus Yard",
  description:
    "The leftover-materials marketplace for landscape crews. Launching 2026.",
};

export default function SurplusYardPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        <section>
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Surplus Yard · Coming soon
            </p>
            <h1 className="max-w-4xl font-serif text-display-md text-forest md:text-display-lg">
              The leftover sod, mulch, stone, and gear your yard is
              quietly composting.
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] leading-[1.6] text-stone">
              Most shops throw away $20K–$60K of usable materials a year
              because it&apos;s easier than finding a buyer. Surplus Yard is
              the crew-to-crew marketplace that clears the yard and moves the
              margin back onto the P&amp;L. Beta opens to GladiusTurf
              subscribers first.
            </p>

            <div className="mt-12 max-w-lg">
              <WaitlistForm source="surplus-yard" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
