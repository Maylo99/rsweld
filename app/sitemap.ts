import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/sluzby", "/o-nas", "/galeria", "/caste-otazky", "/kontakt"];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    changeFrequency: route === "/galeria" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
