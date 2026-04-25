import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "Payroll Sandbox · GladiusTurf",
  description:
    "Click-through preview of the GladiusTurf Payroll module — GPS-verified hours, multi-state tax, 1099 packets, direct deposit. Sandbox only; no data is saved.",
  robots: { index: false, follow: false },
};

export default function PayrollDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-obsidian text-bone">
      {/* Sandbox top bar — owner-facing dark theme */}
      <header className="sticky top-0 z-30 border-b border-bone/10 bg-pitch/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-content items-center gap-3 px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-champagne/15 font-serif text-xs font-semibold text-champagne-bright"
            >
              GC
            </span>
            <div className="leading-tight">
              <div className="font-serif text-[15px] font-semibold tracking-[-0.01em] text-bone">
                Greenleaf Crew · Payroll
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-bone/45">
                Owner workspace
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-champagne/25 bg-champagne/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-champagne-bright sm:inline-flex">
              <FlaskConical className="h-3 w-3" />
              Sandbox
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-bone/15 bg-bone/[0.04] px-3 py-1.5 text-xs font-medium text-bone/85 transition-colors hover:bg-bone/[0.08] hover:text-bone"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              gladiusturf.com
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-content px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
