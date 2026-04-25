import type { MetadataRoute } from "next";
import { COMPETITORS } from "@/content/competitors";
import { FORGE_POSTS } from "@/content/forge-posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://gladiusturf.com";
  const staticRoutes = [
    "",
    "/product",
    "/pricing",
    "/compare",
    "/manifesto",
    "/demo",
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
  ];

  // /vs/[slug] — one entry per competitor (excludes the noindexed
  // /portal/demo/[token] preview route by design).
  const versusRoutes = COMPETITORS.map((c) => `/vs/${c.slug}`);

  // /forge/[slug] — one entry per Forge post.
  const forgeRoutes = FORGE_POSTS.map((p) => `/forge/${p.slug}`);

  const allRoutes = [...staticRoutes, ...versusRoutes, ...forgeRoutes];
  // Stable per-deploy lastmod — pinned to the audit/release date so Search
  // Console doesn't flag noisy build-time churn. Bump this when content
  // meaningfully changes across the site.
  const lastModified = new Date("2026-04-25");
  return allRoutes.map((r) => ({
    url: `${base}${r}`,
    lastModified,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
