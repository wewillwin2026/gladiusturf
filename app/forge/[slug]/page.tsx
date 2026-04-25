import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { FORGE_POSTS, type ForgeBlock } from "@/content/forge-posts";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return FORGE_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = FORGE_POSTS.find((p) => p.slug === slug);
  if (!post) {
    return {
      title: "Not found",
      description: "Post not found.",
    };
  }
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/forge/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: [{ url: "/crest.png", width: 600, height: 800 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ["/crest.png"],
    },
  };
}

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00Z");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function renderBlock(block: ForgeBlock, idx: number) {
  switch (block.type) {
    case "p":
      return (
        <p
          key={idx}
          className="mt-5 text-[16px] leading-[1.7] text-bone/80"
        >
          {block.text}
        </p>
      );
    case "h2":
      return (
        <h2
          key={idx}
          className="mt-12 mb-4 font-serif text-3xl tracking-[-0.01em] leading-[1.15] text-bone"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={idx}
          className="mt-8 mb-2 font-serif text-xl leading-[1.2] text-bone"
        >
          {block.text}
        </h3>
      );
    case "blockquote":
      return (
        <blockquote
          key={idx}
          className="mt-8 mb-4 border-l-2 border-champagne/40 pl-5 italic leading-[1.6] text-bone/85"
        >
          <p>{block.text}</p>
          {block.attribution ? (
            <cite className="mt-2 block text-xs not-italic uppercase tracking-crest text-champagne-bright">
              — {block.attribution}
            </cite>
          ) : null}
        </blockquote>
      );
    case "ul":
      return (
        <ul
          key={idx}
          className="mt-5 list-disc space-y-2 pl-6 text-[16px] leading-[1.7] text-bone/75"
        >
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={idx}
          className="mt-5 list-decimal space-y-2 pl-6 text-[16px] leading-[1.7] text-bone/75"
        >
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <aside
          key={idx}
          className="mt-8 rounded-2xl border border-champagne/20 bg-champagne/[0.04] p-6"
        >
          <h4 className="font-serif text-lg leading-[1.2] text-bone">
            {block.title}
          </h4>
          <p className="mt-2 text-[15px] leading-[1.65] text-bone/75">
            {block.body}
          </p>
        </aside>
      );
    default:
      return null;
  }
}

export default async function ForgePostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = FORGE_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  // Deterministic "Other notes" — sort all posts by date desc, then take the
  // 3 entries that follow this post's index, wrapping around.
  const ordered = [...FORGE_POSTS].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  );
  const myIdx = ordered.findIndex((p) => p.slug === post.slug);
  const others = [
    ordered[(myIdx + 1) % ordered.length],
    ordered[(myIdx + 2) % ordered.length],
    ordered[(myIdx + 3) % ordered.length],
  ].filter((p) => p && p.slug !== post.slug);

  return (
    <>
      <Nav />
      <main className="bg-obsidian">
        <article className="mx-auto max-w-3xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-crest text-champagne-bright">
            The Forge
            <span className="mx-3 text-bone/30">·</span>
            {formatDate(post.publishedAt)}
            <span className="mx-3 text-bone/30">·</span>
            {post.readingMinutes}-min read
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-[-0.02em] leading-[1.08] text-bone md:text-6xl">
            {post.title}
          </h1>
          <p className="mt-3 font-serif text-lg italic leading-snug text-bone/55">
            {post.subtitle}
          </p>

          <div className="mt-12">
            {post.body.map((block, i) => renderBlock(block, i))}
          </div>

          {/* Divider */}
          <div className="mt-20 border-t border-bone/10" />

          {/* Other notes */}
          {others.length > 0 ? (
            <section className="mt-16">
              <p className="text-xs font-semibold uppercase tracking-crest text-champagne-bright">
                Other notes from the Forge
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {others.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/forge/${p.slug}`}
                    className="group rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 transition-colors hover:border-champagne/30 hover:bg-champagne/[0.04]"
                  >
                    <p className="text-xs uppercase tracking-crest text-bone/40">
                      {formatDate(p.publishedAt)}
                    </p>
                    <h3 className="mt-3 font-serif text-lg leading-[1.2] text-bone transition-colors group-hover:text-champagne-bright">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[1.55] text-bone/65">
                      {p.subtitle}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Soft CTA */}
          <section className="mt-16 grid gap-4 md:grid-cols-2">
            <Link
              href="/roi"
              className="group flex flex-col rounded-2xl border border-champagne/20 bg-champagne/[0.04] p-7 transition-colors hover:border-champagne/40 hover:bg-champagne/[0.07]"
            >
              <p className="text-xs font-semibold uppercase tracking-crest text-champagne-bright">
                Run the math
              </p>
              <h3 className="mt-3 font-serif text-2xl leading-[1.15] text-bone">
                Run the math on your shop
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-bone/70">
                Plug in your real numbers. See exactly which engine pays for
                itself first.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-champagne-bright">
                Open the calculator
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/council"
              className="group flex flex-col rounded-2xl border border-moss/30 bg-moss/[0.05] p-7 transition-colors hover:border-moss/50 hover:bg-moss/[0.08]"
            >
              <p className="text-xs font-semibold uppercase tracking-crest text-moss-bright">
                The Council
              </p>
              <h3 className="mt-3 font-serif text-2xl leading-[1.15] text-bone">
                Apply to the Council
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-bone/70">
                Founder pricing locked for life. Direct line to the team. Help
                build the next twenty years of the trade.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-moss-bright">
                Apply
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </section>
        </article>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
