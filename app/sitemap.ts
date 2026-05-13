import type { MetadataRoute } from "next";
import { COMPETITORS } from "@/content/competitors";
import { FORGE_POSTS } from "@/content/forge-posts";
import { VERTICALS } from "@/lib/vertical/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://gladiusturf.com";
  const staticRoutes = [
    "",
    "/product",
    "/pricing",
    "/pricing/cfo",
    "/compare",
    "/manifesto",
    "/demo",
    "/contact",
    "/surplus-yard",
    "/find-a-crew",
    "/platform",
    "/integrations",
    "/security",
    "/field",
    "/score",
    "/portal",
    "/books",
    "/payroll",
    "/retention",
    "/roi",
    "/loss",
    "/council",
    "/forge",
    "/transparency",
    "/legal/privacy",
    "/legal/terms",
    "/legal/dpa",
    "/legal/security",
  ];

  // /vs/[slug] — one entry per competitor (excludes the noindexed
  // /portal/demo/[token] preview route by design).
  const versusRoutes = COMPETITORS.map((c) => `/vs/${c.slug}`);

  // /forge/[slug] — one entry per Forge post.
  const forgeRoutes = FORGE_POSTS.map((p) => `/forge/${p.slug}`);

  // Stable per-deploy lastmod — pinned to the audit/release date so Search
  // Console doesn't flag noisy build-time churn. Bump this when content
  // meaningfully changes across the site.
  const lastModified = new Date("2026-04-25");
  const verticalLastModified = new Date("2026-05-04");

  const generic = [...staticRoutes, ...versusRoutes, ...forgeRoutes].map(
    (r) => ({
      url: `${base}${r}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: r === "" ? 1 : 0.7,
    }),
  );

  // Vertical routes — /lighting at 0.9 (live product surface), the seven
  // waitlist verticals at 0.7. Kept on a separate lastmod so the
  // 2026-05-04 ship is reflected in Search Console without bumping the
  // whole site.
  const verticals = VERTICALS.map((v) => ({
    url: `${base}${v.href}`,
    lastModified: verticalLastModified,
    changeFrequency: "weekly" as const,
    priority: v.status === "live" ? 0.9 : 0.7,
  }));

  return [...generic, ...verticals];
}
