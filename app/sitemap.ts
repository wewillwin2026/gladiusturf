import type { MetadataRoute } from "next";
import { COMPETITORS } from "@/content/competitors";

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
  ];

  // /vs/[slug] — one entry per competitor (excludes the noindexed
  // /portal/demo/[token] preview route by design).
  const versusRoutes = COMPETITORS.map((c) => `/vs/${c.slug}`);

  const allRoutes = [...staticRoutes, ...versusRoutes];
  const lastModified = new Date();
  return allRoutes.map((r) => ({
    url: `${base}${r}`,
    lastModified,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
