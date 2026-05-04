"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/**
 * Mobile-only sticky "Book a demo" pill. Visible only when the hero is OUT
 * of view AND the lead form is also out of view — otherwise the pill is
 * redundant with whatever CTA the user is currently looking at. Hidden ≥ md
 * (the desktop layout's in-page CTAs already cover that case).
 */
export function LightingStickyCta() {
  const [heroOut, setHeroOut] = useState(false);
  const [formIn, setFormIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hero = document.querySelector("section[data-lighting-hero]");
    const form = document.querySelector("section#lead-form");
    if (!hero || !form) return;

    const heroObs = new IntersectionObserver(
      ([entry]) => setHeroOut(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );
    const formObs = new IntersectionObserver(
      ([entry]) => setFormIn(entry.isIntersecting),
      { threshold: 0.1 },
    );
    heroObs.observe(hero);
    formObs.observe(form);
    return () => {
      heroObs.disconnect();
      formObs.disconnect();
    };
  }, []);

  const show = heroOut && !formIn;

  return (
    <div
      aria-hidden={!show}
      className={[
        "fixed inset-x-0 bottom-0 z-30 px-4 pb-4 md:hidden",
        "transition-transform duration-300 ease-out",
        show ? "translate-y-0" : "pointer-events-none translate-y-full",
        "motion-reduce:transition-none",
      ].join(" ")}
    >
      <a
        href="#lead-form"
        data-track="lighting_demo_cta_sticky"
        tabIndex={show ? 0 : -1}
        className="group flex w-full items-center justify-center gap-2 rounded-full bg-honey-bright px-6 py-3.5 text-sm font-semibold text-forest-deep shadow-pop-honey transition-all hover:bg-honey hover:shadow-cta-hover"
      >
        Book a demo
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}
