import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "Save Play · Sandbox Preview",
  description:
    "Click-through preview of GladiusTurf Save Play — what catching at-risk customers actually looks like.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/retention/demo" },
};

export default function RetentionDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-pitch text-bone">
      {/* Sandbox top bar */}
      <header className="sticky top-0 z-30 border-b border-bone/10 bg-pitch/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-champagne/30 bg-champagne/10 font-serif text-xs font-semibold text-champagne-bright"
            >
              GC
            </span>
            <div className="leading-tight">
              <div className="font-serif text-[15px] font-semibold tracking-[-0.01em] text-bone">
                Greenleaf Crew
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/55">
                Save Play
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-champagne/30 bg-champagne/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-champagne-bright sm:inline-flex">
              <FlaskConical className="h-3.5 w-3.5" />
              Sandbox preview
            </span>
            <Link
              href="/retention"
              className="inline-flex items-center gap-1.5 rounded-full border border-bone/15 bg-bone/[0.04] px-3 py-1.5 text-xs font-medium text-bone/80 transition-colors hover:border-bone/25 hover:text-bone"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              gladiusturf.com
            </Link>
          </div>
        </div>

        {/* Sandbox banner */}
        <div className="border-t border-champagne/20 bg-champagne/[0.06]">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-1.5 md:px-6">
            <p className="font-mono text-[11px] tracking-[0.04em] text-champagne-bright">
              <span aria-hidden>🧪</span>{" "}
              <span className="text-champagne-bright">Sandbox preview</span>
              <span className="text-bone/55"> · No data is saved · Save plays are mocked</span>
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
