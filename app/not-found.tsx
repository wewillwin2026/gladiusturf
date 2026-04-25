import type { Metadata } from "next";
import Image from "next/image";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "404 — Lost in the back forty",
  description: "The route you're looking for doesn't exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pitch text-bone">
      <Nav />
      <main className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-32 text-center">
        <Image
          src="/crest.png"
          alt=""
          width={80}
          height={80}
          className="h-20 w-20 opacity-90"
          priority
        />
        <Eyebrow tone="champagne" className="mt-8">
          404 · route not found
        </Eyebrow>
        <h1 className="mt-4 font-serif text-5xl font-semibold tracking-[-0.02em] text-bone md:text-6xl">
          Lost in the{" "}
          <span className="text-champagne-bright">back forty</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-bone/70 md:text-xl">
          The route you&apos;re looking for doesn&apos;t exist on this site.
          Walk back to the yard or book a 30-minute demo with the founders.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CtaButton href="/" variant="primary" size="lg">
            Back to home
          </CtaButton>
          <CtaButton href="/demo" variant="ghost-champagne" size="md">
            Book a demo
          </CtaButton>
        </div>
      </main>
      <Footer />
    </div>
  );
}
