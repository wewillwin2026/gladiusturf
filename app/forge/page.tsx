import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { WaitlistForm } from "@/components/waitlist-form";
import { FORGE_POSTS } from "@/content/forge-posts";

export const metadata: Metadata = {
  title: "The Forge — Notes from the trade",
  description:
    "Long-form on landscape ops, software, the labor crisis, and the operating system the trade actually deserves. Notes from the Forge.",
  alternates: { canonical: "/forge" },
  openGraph: {
    type: "website",
    title: "The Forge — Notes from the trade",
    description:
      "Long-form on landscape ops, software, the labor crisis, and the operating system the trade actually deserves.",
    images: [{ url: "/crest.png", width: 600, height: 800 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Forge — Notes from the trade",
    description:
      "Long-form on landscape ops, software, the labor crisis, and the operating system the trade actually deserves.",
    images: ["/crest.png"],
  },
};

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00Z");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ForgeIndexPage() {
  // Sort newest first.
  const posts = [...FORGE_POSTS].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  );

  return (
    <>
      <Nav />
      <main className="bg-obsidian">
        {/* HERO */}
        <section className="relative overflow-hidden bg-pitch py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(201,168,122,0.10),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[500px] opacity-[0.10] [background-image:linear-gradient(to_right,rgba(234,227,210,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(234,227,210,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          />
          <div className="relative mx-auto max-w-3xl px-6">
            <Pill tone="champagne" className="mb-8">
              The Forge
            </Pill>
            <h1 className="font-serif text-5xl tracking-[-0.02em] leading-[1.05] text-bone md:text-7xl">
              Notes from the trade.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-parchment/75 md:text-xl">
              Long-form on landscape ops, software, the labor crisis, and the
              operating system the trade actually deserves.
            </p>
          </div>
        </section>

        {/* POSTS */}
        <section className="bg-obsidian py-20">
          <div className="mx-auto max-w-3xl px-6">
            <ol className="flex flex-col">
              {posts.map((post, i) => (
                <li
                  key={post.slug}
                  className="group border-b border-bone/10 py-10 transition-colors hover:bg-champagne/[0.03]"
                >
                  <div className="font-mono text-xs uppercase tracking-crest text-champagne-bright/60">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="mt-4 font-serif text-2xl tracking-[-0.01em] leading-[1.2] text-bone md:text-3xl">
                    <Link
                      href={`/forge/${post.slug}`}
                      className="transition-colors group-hover:text-champagne-bright"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 font-serif text-lg italic leading-snug text-bone/55">
                    {post.subtitle}
                  </p>
                  <p className="mt-5 text-[15px] leading-[1.65] text-bone/70">
                    {post.excerpt}
                  </p>
                  <p className="mt-6 text-xs uppercase tracking-crest text-bone/40">
                    {formatDate(post.publishedAt)}
                    <span className="mx-3 text-bone/25">·</span>
                    {post.readingMinutes}-min read
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* SUBSCRIBE BAND */}
        <section className="border-t border-bone/10 bg-slate-deep py-20">
          <div className="mx-auto max-w-3xl px-6">
            <Eyebrow tone="champagne" className="mb-5">
              Subscribe to the Forge
            </Eyebrow>
            <h2 className="font-serif text-3xl tracking-[-0.01em] leading-[1.1] text-bone md:text-4xl">
              One post a week. No spam. Cancel anytime.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-bone/65">
              Notes from the trade — landscape ops, software, the labor
              crisis, and the operating system the trade actually deserves.
            </p>
            <div className="mt-8 max-w-lg">
              <WaitlistForm source="forge" />
            </div>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
