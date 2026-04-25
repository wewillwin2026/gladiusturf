import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TopographicBg } from "@/components/topographic-bg";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-bone/10 bg-pitch py-32">
      {/* Topographic backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <TopographicBg />
      </div>
      {/* Lime under-glow — keeps the marquee energy under the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[600px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(198,243,82,0.10),transparent_65%)]"
      />

      {/* Crest watermark — bleeds slightly off the bottom-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-4 -right-4 opacity-10"
      >
        <Image
          src="/crest.png"
          alt=""
          width={80}
          height={80}
          className="h-20 w-20"
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <ScrollReveal>
          <h2 className="font-serif text-5xl font-semibold tracking-[-0.02em] text-bone md:text-7xl">
            Stop losing the revenue
            <br />
            your software is{" "}
            <span className="text-champagne-bright">missing</span>.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-parchment/70 md:text-xl">
            Switch in 48 hours. Keep your QuickBooks.{" "}
            <span className="text-bone">30-day money-back guarantee.</span>
            <br className="hidden md:block" />
            The first leak we close usually pays for the year.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/demo"
              className="group inline-flex items-center gap-2 rounded-full bg-lime-bright px-8 py-4 text-lg font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover"
            >
              Book a 30-minute demo
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-2 rounded-full border border-champagne-bright/40 px-7 py-3.5 text-base font-medium text-champagne-bright transition-all hover:border-champagne-bright hover:bg-champagne/10"
            >
              Or see pricing →
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
