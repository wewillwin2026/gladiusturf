import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://gladiusturf.com";
  const routes = [
    "",
    "/product",
    "/pricing",
    "/compare",
    "/manifesto",
    "/demo",
    "/surplus-yard",
    "/find-a-crew",
  ];
  const lastModified = new Date();
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
