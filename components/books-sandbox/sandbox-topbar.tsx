import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { SHOP } from "@/content/books-demo-data";

export function SandboxTopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-bone/10 bg-pitch/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-content items-center gap-3 px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-champagne/15 font-serif text-xs font-semibold text-champagne-bright"
          >
            {SHOP.initials}
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-2 font-serif text-[15px] font-semibold tracking-[-0.01em] text-bone">
              {SHOP.name}
              <span className="inline-flex items-center gap-1 rounded-full border border-champagne/30 bg-champagne/[0.06] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-champagne-bright">
                <BookOpen className="h-2.5 w-2.5" />
                Books
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-bone/40">
              Owner Console · YTD 2026
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 rounded-full border border-bone/15 bg-bone/[0.04] px-3 py-1.5 text-xs font-medium text-bone/80 transition-colors hover:bg-bone/10 hover:text-bone"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            gladiusturf.com
          </Link>
        </div>
      </div>
    </header>
  );
}
