import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/realizacie", "/cenova-ponuka", "/kontakt"];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    changeFrequency: route === "/realizacie" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
