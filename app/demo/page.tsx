import type { Metadata } from "next";
import { DemoForm } from "@/components/demo-form";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Request a demo",
  description:
    "See GladiusTurf on your own data in 30 minutes. 14-day pilot included.",
};

export default function DemoPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        <section>
          <div className="mx-auto grid max-w-content grid-cols-1 gap-16 px-6 py-20 md:grid-cols-2 md:py-section">
            <div>
              <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
                Request a demo
              </p>
              <h1 className="font-serif text-display-md text-forest md:text-display-lg">
                30 minutes. Your shop. Your numbers.
              </h1>
              <p className="mt-8 max-w-xl text-[17px] leading-[1.7] text-stone">
                We&apos;ll pull your public estimate volume, your service
                radius, and run the engines against your actual route. You
                walk out with a number — what GladiusTurf would have put in
                your bank last quarter.
              </p>

              <ul className="mt-10 flex flex-col gap-4 text-[15px] leading-[1.6] text-forest">
                <li>✓ 14-day pilot, no card</li>
                <li>✓ 48-hour migration from Jobber / LMN / Service Autopilot</li>
                <li>✓ We pay your overlap month</li>
                <li>✓ Month-to-month. Cancel anytime.</li>
              </ul>
            </div>

            <div>
              <DemoForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
