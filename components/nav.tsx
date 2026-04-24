"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
          ? "border-b border-[rgba(15,61,46,0.12)] bg-paper/90 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <Link href="/" aria-label="GladiusTurf home">
          <LogoMark size={32} withWordmark />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-stone md:flex">
          <a className="hover:text-forest" href="/find-a-crew">Find a crew</a>
          <a className="hover:text-forest" href="/surplus-yard">Surplus Yard</a>
          <a className="hover:text-forest" href="/pricing">Pricing</a>
          <a className="hover:text-forest" href="/demo">Log in</a>
        </nav>
        <a
          href="/demo"
          className="inline-flex items-center rounded-[8px] bg-moss px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-moss/90"
        >
          Try the live demo
        </a>
      </div>
    </header>
  );
}
