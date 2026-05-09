import Link from "next/link";
import { ArrowUpRight, Eye } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { VERTICALS } from "@/lib/vertical/types";
import { WAITLIST_COPY } from "@/lib/vertical/copy";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Landing Previews · GladiusTurf",
  robots: { index: false, follow: false },
};

/**
 * Founders-only preview page for all 8 vertical landing pages —
 * the single screen the founders open when they want to eyeball every
 * marketing surface at once before pushing changes.
 *
 * Each tile shows the hero h1 + subhead + status pill + an embedded
 * iframe of the live URL so the founder can see the actual rendered
 * page without opening 8 tabs. Click "Open" to break out into a real tab.
 *
 * Lighting copy doesn't live in WAITLIST_COPY (lighting has its own
 * full content.ts), so we hand-render its row — but the iframe still
 * pulls the live page so what you see is what's deployed.
 */

const SITE = "https://gladiusturf.com";

const LIGHTING_PREVIEW = {
  h1: "Quote it at 4 PM. Demo it at 9 PM. Install it next week.",
  subhead:
    "The OS for landscape lighting designers. Per-fixture warranty tracking, bilingual customer flow, AI Quote Drafter, Storm Response Mode.",
};

export default async function LandingPreviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Marketing"
        title="Landing previews"
        subtitle="Every public vertical landing page rendered inline. Click Open to view in a real tab — copy lives in lib/vertical/copy.ts (and lib/lighting/content.ts for the live one)."
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {VERTICALS.map((v) => {
          const isLighting = v.slug === "lighting";
          const copy = isLighting
            ? LIGHTING_PREVIEW
            : WAITLIST_COPY[v.slug as Exclude<typeof v.slug, "lighting">];
          const url = `${SITE}${v.href}`;
          const Icon = v.icon;
          return (
            <article
              key={v.slug}
              className="g-card flex flex-col overflow-hidden"
            >
              <header className="flex items-center justify-between gap-3 border-b border-g-border-subtle px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-g-surface-2 text-g-text-muted">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-medium text-g-text">
                        {v.name}
                      </h3>
                      <span
                        className={
                          v.status === "live"
                            ? "rounded-full border border-g-accent/40 bg-g-accent-faint/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-g-accent"
                            : "rounded-full border border-g-border-subtle px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-g-text-faint"
                        }
                      >
                        {v.status}
                      </span>
                    </div>
                    <p className="truncate font-geist-mono text-[11px] text-g-text-faint">
                      {url}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={v.href}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 rounded-md border border-g-border-subtle bg-g-surface px-2 py-1 text-[11px] text-g-text-muted hover:border-g-accent/60 hover:text-g-text"
                  >
                    <ArrowUpRight className="h-3 w-3" />
                    Open
                  </Link>
                  <Link
                    href={`${url}?preview=1`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 rounded-md border border-g-border-subtle bg-g-surface px-2 py-1 text-[11px] text-g-text-muted hover:border-g-accent/60 hover:text-g-text"
                    title="Open in tab with preview marker"
                  >
                    <Eye className="h-3 w-3" />
                  </Link>
                </div>
              </header>

              <div className="flex flex-col gap-3 px-4 py-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                    H1
                  </p>
                  <p className="mt-1 text-[14px] leading-snug text-g-text">
                    {copy.h1}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                    Subhead
                  </p>
                  <p className="mt-1 text-[12px] leading-[1.55] text-g-text-muted">
                    {copy.subhead}
                  </p>
                </div>
                {!isLighting && (
                  <details className="group">
                    <summary className="cursor-pointer text-[11px] uppercase tracking-[0.14em] text-g-text-faint hover:text-g-text-muted">
                      What&apos;s coming ({(copy as typeof WAITLIST_COPY[keyof typeof WAITLIST_COPY]).whatsComing.length})
                    </summary>
                    <ul className="mt-2 flex flex-col gap-1.5 pl-3">
                      {(
                        copy as typeof WAITLIST_COPY[keyof typeof WAITLIST_COPY]
                      ).whatsComing.map((item) => (
                        <li
                          key={item}
                          className="text-[12px] leading-[1.5] text-g-text-muted"
                        >
                          · {item}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>

              {/* Live iframe of the page. Sandbox prevents the embedded
                  page from breaking out of the frame; same-origin since
                  it's our own domain so navigation works inside. */}
              <div className="relative h-[460px] overflow-hidden border-t border-g-border-subtle bg-black">
                <iframe
                  src={url}
                  title={`${v.name} landing preview`}
                  className="h-[1200px] w-full origin-top-left scale-[0.5] border-0"
                  style={{ width: "200%", height: "920px" }}
                  loading="lazy"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            </article>
          );
        })}
      </section>

      <section className="g-card flex items-start gap-3 p-4">
        <div className="text-[12px] text-g-text-muted leading-relaxed">
          <strong className="text-g-text">How to update copy.</strong>{" "}
          Lighting copy lives in{" "}
          <code className="font-geist-mono">lib/lighting/content.ts</code>.
          The other 7 live in{" "}
          <code className="font-geist-mono">lib/vertical/copy.ts</code>{" "}
          (single object, one block per vertical). Change → save → push to
          main → Vercel CI redeploys → refresh this page to see the new
          render. The iframes pull the LIVE production URLs, not preview
          deploys, so allow ~3 minutes for changes to land.
        </div>
      </section>
    </div>
  );
}
