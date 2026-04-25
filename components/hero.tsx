"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
    <section className="relative overflow-hidden pb-24 pt-16 md:pb-32 md:pt-24">
      {/* Ambient moss radial */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] bg-[radial-gradient(ellipse_at_top,rgba(127,226,122,0.16),transparent_60%)]"
      />
      {/* Lime under-glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[200px] -z-10 h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(198,243,82,0.08),transparent_65%)]"
      />
      {/* Faint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] opacity-[0.18] [background-image:linear-gradient(to_right,rgba(245,241,232,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,241,232,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
      />
      {/* Topographic contour overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <TopographicBg />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow pill with pulsing dot */}
          <motion.div
            {...fadeUp(0)}
            className="mb-7 flex items-center justify-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-4 py-1.5 text-xs font-medium text-moss-bright">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-moss-bright opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-moss-bright" />
              </span>
              Landscaping Revenue Intelligence
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.05)}
            className="font-serif text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em] text-bone sm:text-5xl md:text-7xl"
          >
            Your software books the job.
            <br className="hidden sm:block" />
            <span className="text-moss-bright">We close the revenue.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.15)}
            className="mx-auto mt-8 max-w-2xl text-lg text-bone/70 md:text-xl"
          >
            Twenty-seven engines across five tiers — revenue, lifecycle,
            intelligence, operations, marketplace. The first landscaping
            operating system that gets smarter every night.
          </motion.p>

          <motion.div
            {...fadeUp(0.25)}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="/demo"
              className="group inline-flex items-center gap-2 rounded-full bg-lime-bright px-7 py-3.5 text-base font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover"
            >
              Book a 30-minute demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-2 rounded-full border border-honey-bright/40 px-7 py-3.5 text-base font-medium text-honey-bright transition-all hover:border-honey-bright hover:bg-honey/10"
            >
              See pricing →
            </Link>
          </motion.div>

          {/* Proof strip */}
          <motion.p
            {...fadeUp(0.35)}
            className="mt-10 text-xs text-bone/50"
          >
            <span className="font-medium text-bone/70">
              Trusted by 12 founding crews
            </span>
            <span className="mx-2 text-bone/30">·</span>
            Built on Stripe
            <span className="mx-2 text-bone/30">·</span>
            Twilio
            <span className="mx-2 text-bone/30">·</span>
            Supabase
            <span className="mx-2 text-bone/30">·</span>
            Vercel
          </motion.p>
        </div>
      </div>
    </section>
  );
}
