"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { SignInDropdown } from "@/components/sign-in-dropdown";
import { cn } from "@/lib/cn";
import { VERTICALS } from "@/lib/vertical/types";

const PRIMARY_LINKS: { href: string; label: string; live?: boolean }[] = [
  { href: "/lighting", label: "Lighting", live: true },
  { href: "/platform", label: "Platform" },
  { href: "/product", label: "Engines" },
  { href: "/pricing", label: "Pricing" },
  { href: "/compare", label: "Compare" },
  { href: "/contact", label: "Contact" },
];

const MOBILE_SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/lighting", label: "Lighting" },
      { href: "/platform", label: "Platform" },
      { href: "/product", label: "Engines" },
      { href: "/pricing", label: "Pricing" },
      { href: "/compare", label: "Compare" },
      { href: "/manifesto", label: "Manifesto" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/portal", label: "Client Portal" },
      { href: "/field", label: "Field Crew App" },
      { href: "/score", label: "LRI Score" },
      { href: "/surplus-yard", label: "Surplus Yard" },
      { href: "/find-a-crew", label: "Find a Crew" },
    ],
  },
  {
    title: "Books",
    links: [
      { href: "/books", label: "Books" },
      { href: "/payroll", label: "Payroll" },
      { href: "/retention", label: "Retention" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/security", label: "Security" },
      { href: "/integrations", label: "Integrations" },
    ],
  },
  {
    title: "Talk to us",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/demo", label: "Book a demo" },
      { href: "/council", label: "The Council" },
    ],
  },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setSolid(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-colors duration-200",
          solid
            ? "border-b border-bone/10 bg-obsidian/95 backdrop-blur"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" aria-label="GladiusTurf home">
            <LogoMark size={40} theme="dark" withWordmark />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-bone/70 md:flex">
            {PRIMARY_LINKS.map((link, i) => (
              <a
                key={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 transition-colors",
                  i % 2 === 0
                    ? "hover:text-moss-bright"
                    : "hover:text-honey-bright"
                )}
                href={link.href}
              >
                {link.label}
                {link.live && (
                  <span
                    aria-label="Live"
                    className="h-1.5 w-1.5 rounded-full bg-honey-bright"
                  />
                )}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <SignInDropdown />
            <Link
              href="/demo"
              className="group hidden items-center gap-1.5 rounded-full bg-lime-bright px-4 py-2 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover sm:inline-flex"
            >
              Book a demo
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bone/15 text-bone/80 transition-colors hover:border-moss-bright/50 hover:text-moss-bright md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-obsidian/80 backdrop-blur"
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-obsidian shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-bone/10 px-6">
              <LogoMark size={28} theme="dark" withWordmark />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bone/15 text-bone/80 transition-colors hover:border-honey-bright/50 hover:text-honey-bright"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 px-6 py-8">
              {/* Sign-in section — mirrors the desktop SignInDropdown.
                  Live verticals route to /app/login (magic-link form);
                  waitlist verticals route to their /<vertical> page. */}
              <div className="mb-8">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/40">
                  Sign in to your workspace
                </h4>
                <ul className="mt-4 flex flex-col gap-3 text-base">
                  {VERTICALS.map((v) => {
                    const isLive = v.status === "live";
                    const href = isLive ? "/app/login" : v.href;
                    return (
                      <li key={v.slug}>
                        <a
                          href={href}
                          onClick={() => setOpen(false)}
                          data-track={`signin_dropdown_${v.slug}`}
                          className="flex items-center justify-between gap-3 text-bone/85 transition-colors hover:text-honey-bright"
                        >
                          <span className="inline-flex items-center gap-2">
                            <v.icon
                              className={cn(
                                "h-4 w-4",
                                isLive ? "text-honey-bright" : "text-bone/55",
                              )}
                              aria-hidden
                            />
                            {v.name}
                          </span>
                          {isLive ? (
                            <span className="rounded-full border border-honey-bright/40 bg-honey/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-honey-bright">
                              Live · Sign in
                            </span>
                          ) : (
                            <span className="rounded-full border border-bone/15 bg-bone/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-bone/55">
                              Waitlist
                            </span>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {MOBILE_SECTIONS.map((section) => (
                <div key={section.title} className="mb-8">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/40">
                    {section.title}
                  </h4>
                  <ul className="mt-4 flex flex-col gap-3 text-base">
                    {section.links.map((l) => (
                      <li key={l.href}>
                        <a
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="text-bone/85 transition-colors hover:text-moss-bright"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-bone/10 p-6">
              <Link
                href="/demo"
                onClick={() => setOpen(false)}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime-bright px-5 py-3 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover"
              >
                Book a demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
