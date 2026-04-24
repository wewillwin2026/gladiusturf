import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Find a crew",
  description:
    "Directory of crews running on GladiusTurf — launching with our first 100 shops.",
};

export default function FindACrewPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        <section>
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Find a crew · Coming with our first 100
            </p>
            <h1 className="max-w-4xl font-serif text-display-md text-forest md:text-display-lg">
              The directory of crews that don&apos;t miss Saturday calls.
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] leading-[1.6] text-stone">
              Every GladiusTurf shop gets a listing — service area, crew
              size, specialties, response SLA. Homeowners and property
              managers search by ZIP and book on the spot. Launching when we
              hit 100 live shops.
            </p>

            <div className="mt-12 max-w-lg">
              <WaitlistForm source="find-a-crew" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
