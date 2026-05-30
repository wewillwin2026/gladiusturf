import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Pill } from "@/components/pill";

// ---------------------------------------------------------------------------
// /awais/mesh — Live AWAIS Sentinel Mesh Visualization (Turf surface)
// ---------------------------------------------------------------------------
// Same page that lives at gladiuscrm.com/awais/mesh, but rendered from
// the Turf side of the federation. The "this product" node is GladiusTurf;
// the four other nodes are CRM, BDC, Stone, GoFetchAuto.
//
// When a Sentinel attack signature, regression pattern, or root-cause
// fingerprint hits a certainty threshold in any vertical, it gets
// anonymized and pushed to the federation bus. The other four pick it
// up, re-validate against their own corpus, and harden if it applies.
//
// Polling: visualization runs on a deterministic local clock. The full
// telemetry API lives at gladiuscrm.com/api/status/aggregate; we don't
// proxy it across origins here.
//
// LOCKED-SURFACE NOTE: lives under app/awais/mesh/** — NOT in the locked
// `app/(marketing)/**` glob. No UNLOCK-TURF required.
// ---------------------------------------------------------------------------

const SITE = "https://gladiusturf.com";
const TITLE = "The Mesh that Never Sleeps — AWAIS Live Federation | GladiusTurf";
const DESCRIPTION =
  "Watch AWAIS in real time. Five products. One brain. When one vertical learns, all five harden — in under 30 seconds.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE}/awais/mesh` },
  openGraph: {
    type: "website",
    url: `${SITE}/awais/mesh`,
    siteName: "GladiusTurf",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@gladiusturf",
    creator: "@gladiusturf",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// Client-only canvas — pentagon + animated beams + SVG <animate> blocks.
// SSR is irrelevant for the canvas; keeping it client-only avoids
// hydration mismatch around the animated nodes.
const MeshCanvas = dynamic(() =>
  import("./_client").then((m) => ({ default: m.MeshCanvas })),
);

export default function AwaisMeshPage() {
  return (
    <>
      <Nav />
      <main className="bg-obsidian text-bone">
        {/* HERO band ------------------------------------------------- */}
        <section className="relative overflow-hidden border-b border-bone/10 px-6 pt-28 pb-14 md:pt-32 md:pb-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(127,226,122,0.10),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[500px] opacity-[0.06] [background-image:linear-gradient(to_right,rgba(245,241,232,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,241,232,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          />
          <div className="relative mx-auto max-w-6xl text-center">
            <Pill className="mb-8" tone="moss">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-moss-bright shadow-[0_0_8px_rgba(127,226,122,0.85)]"
              />
              Live federation telemetry
            </Pill>

            <h1 className="mx-auto mt-2 max-w-4xl font-serif text-[clamp(40px,7vw,80px)] leading-[1.02] tracking-[-0.02em] text-bone italic">
              The mesh that never sleeps.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-bone/70 md:text-xl">
              Five products. One brain. When one of us learns, all of us
              learn — in under 30 seconds.
            </p>

            <div className="mt-10 flex justify-center">
              <a
                href="/demo"
                className="inline-flex items-center gap-2 rounded-full bg-lime-bright px-7 py-3 text-base font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover"
              >
                Book a tour
                <span aria-hidden>&rarr;</span>
              </a>
            </div>
          </div>
        </section>

        {/* CANVAS — client-side ------------------------------------- */}
        <MeshCanvas />

        {/* How it works --------------------------------------------- */}
        <section className="border-t border-bone/10 px-6 py-14 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-moss-bright">
              How it works
            </p>
            <p className="mt-4 text-base leading-relaxed text-bone/75 md:text-lg">
              Every AWAIS instance ships with a federation broadcaster.
              When a new attack signature, regression pattern, or
              root-cause hits a certainty threshold inside one
              vertical — say, a credential-stuffing burst on a turf
              tenant&apos;s public quote page — it&rsquo;s anonymized and
              pushed to the federation bus. The other four pick it up,
              re-validate against their own corpus, and harden if it
              applies.{" "}
              <span className="text-moss-bright">
                No GPUs. No agent. No inference cost. Just one brain
                that spans five products.
              </span>
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-sm text-bone/55">
              Aggregates are anonymized and public-safe. We never publish
              attacker fingerprints, stack traces, crew GPS pings,
              customer addresses, or raw event payloads on this surface.
            </p>
          </div>
        </section>

        {/* What it protects on Turf specifically -------------------- */}
        <section className="border-t border-bone/10 bg-pitch px-6 py-16 md:py-20">
          <div className="mx-auto max-w-5xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-champagne-bright">
              On the Turf surface specifically
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-[1.1] tracking-[-0.01em] text-bone md:text-4xl">
              What the mesh is watching for crew owners.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Crew GPS telemetry",
                  body: "Field-app location pings stay tenant-scoped. The mesh catches anomalous cross-tenant query attempts in under a second.",
                },
                {
                  title: "Customer addresses",
                  body: "Address records are tenant-isolated by RLS + application scoping. Federation flags any extraction-rate spike across the network.",
                },
                {
                  title: "Route optimization data",
                  body: "Daily route + dispatch payloads are encrypted at rest. The mesh fingerprints unusual export patterns and propagates the signature.",
                },
              ].map((t) => (
                <div
                  key={t.title}
                  className="rounded-xl border border-bone/10 bg-bone/[0.02] p-5 backdrop-blur-sm"
                >
                  <p className="font-serif text-lg text-bone">{t.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-bone/65">
                    {t.body}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-bone/55">
              Read the full posture on{" "}
              <a
                href="/security"
                className="text-champagne-bright underline decoration-champagne/30 underline-offset-4 hover:decoration-champagne-bright"
              >
                /security
              </a>{" "}
              — every claim there should hold up to a procurement DPA
              review.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
