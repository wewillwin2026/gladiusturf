"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { cn } from "@/lib/cn";

export function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const handler = () => setSolid(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-200",
        solid
          ? "border-b border-bone/10 bg-forest-deep/90 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" aria-label="GladiusTurf home">
          <LogoMark size={32} theme="dark" withWordmark />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-bone/70 md:flex">
          <a className="transition-colors hover:text-moss-bright" href="/product">
            Product
          </a>
          <a className="transition-colors hover:text-moss-bright" href="/pricing">
            Pricing
          </a>
          <a className="transition-colors hover:text-moss-bright" href="/compare">
            Compare
          </a>
          <a className="transition-colors hover:text-moss-bright" href="/manifesto">
            Manifesto
          </a>
          <a className="transition-colors hover:text-moss-bright" href="/find-a-crew">
            Find a crew
          </a>
        </nav>
        <Link
          href="/demo"
          className="group inline-flex items-center gap-1.5 rounded-full bg-lime-bright px-4 py-2 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover"
        >
          Book a demo
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </header>
  );
}
