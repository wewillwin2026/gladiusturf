"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TopographicBg } from "@/components/topographic-bg";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function Hero() {
  const reduce = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: reduce ? undefined : { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <ScrollReveal>
      <section className="relative overflow-hidden bg-pitch pb-24 pt-20 md:pb-32 md:pt-28">
        {/* Champagne radial — heritage halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] bg-[radial-gradient(ellipse_at_top,rgba(201,168,122,0.10),transparent_60%)]"
        />
        {/* Sage under-glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[200px] -z-10 h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(122,155,114,0.06),transparent_65%)]"
        />
        {/* Faint grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] opacity-[0.14] [background-image:linear-gradient(to_right,rgba(245,241,232,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,241,232,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        />
        {/* Topographic contour overlay — dialed back on true black */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
          style={{ ["--topo-opacity" as string]: 0.06 }}
        >
          <TopographicBg />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl text-center">
            {/* Heritage tagline above the floating crest */}
            <motion.p
              {...fadeUp(0)}
              className="mb-6 text-xs font-medium uppercase tracking-crest text-champagne"
            >
              Precision · Groundskeeping
            </motion.p>

            {/* Crest — centered, no frame; bigger so the prestige reads */}
            <motion.div
              {...fadeUp(0.05)}
              className="mb-10 flex items-center justify-center"
            >
              <Image
                src="/crest.png"
                alt="GladiusTurf crest"
                width={520}
                height={693}
                priority
                sizes="(min-width: 1024px) 360px, (min-width: 768px) 300px, 220px"
                className="h-[220px] w-auto select-none md:h-[300px] lg:h-[360px]"
              />
            </motion.div>

            <motion.h1
              {...fadeUp(0.1)}
              className="font-serif text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-bone md:text-7xl"
            >
              Software books the job.
              <br className="hidden sm:block" />
              <span className="text-moss-bright">We close the revenue.</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.18)}
              className="mx-auto mt-8 max-w-3xl text-lg text-parchment/70 md:text-xl"
            >
              Thirty-three engines across five tiers — revenue, lifecycle,
              intelligence, operations, marketplace. The first landscaping
              operating system that gets smarter every night.
            </motion.p>

            <motion.div
              {...fadeUp(0.26)}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
            >
              <Link
                href="/demo"
                className="group inline-flex items-center gap-2 rounded-full bg-lime-bright px-7 py-3.5 text-base font-semibold text-forest shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover"
              >
                Book a 30-minute demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-2 rounded-full border border-champagne-bright/40 px-7 py-3.5 text-base font-medium text-champagne-bright transition-all hover:border-champagne-bright hover:bg-champagne/10"
              >
                See pricing →
              </Link>
            </motion.div>

            {/* Risk-reversal sub-line below CTAs */}
            <motion.p
              {...fadeUp(0.30)}
              className="mt-6 text-xs uppercase tracking-crest text-bone/45"
            >
              30-day money-back guarantee
              <span className="mx-3 text-bone/25">·</span>
              Switch from your current stack in 48 hours
            </motion.p>

            {/* Heritage proof strip — small caps, champagne-tone */}
            <motion.p
              {...fadeUp(0.34)}
              className="mt-12 text-xs uppercase tracking-crest text-bone/40"
            >
              <span>Trusted by founding crews</span>
              <span className="mx-3 text-bone/25">·</span>
              <span>Built on Stripe</span>
              <span className="mx-3 text-bone/25">·</span>
              <span>Twilio</span>
              <span className="mx-3 text-bone/25">·</span>
              <span>Anthropic Claude</span>
            </motion.p>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
